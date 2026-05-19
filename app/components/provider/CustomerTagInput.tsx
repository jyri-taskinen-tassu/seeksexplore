"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

export type TagItem = {
  id: string;
  tag: string;
  category: string;
  usage_count: number;
};

export type GroupedTagSuggestions = {
  category: string;
  tags: TagItem[];
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

/** Single removable tag chip */
function TagChip({ tag, onRemove }: { tag: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-forest)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--color-forest)] ring-1 ring-[var(--color-forest)]/20">
      {tag}
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[var(--color-forest)]/60 hover:bg-[var(--color-forest)]/20 hover:text-[var(--color-forest)] transition-colors"
        aria-label={`Remove tag ${tag}`}
      >
        ×
      </button>
    </span>
  );
}

/**
 * CustomerTagInput
 *
 * Free-text tag input with grouped suggestions fetched from Supabase RPC.
 * - Type to search existing tags grouped by category
 * - Press Enter or click suggestion to add
 * - New tags (not in suggestions) are created in DB on submit
 * - Tags saved to customer via onTagsChange callback
 */
export default function CustomerTagInput({
  customerId,
  initialTags,
  onTagsChange,
}: {
  customerId: string;
  initialTags: string[];
  onTagsChange: (customerId: string, tags: string[]) => Promise<void>;
}) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<GroupedTagSuggestions[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fetchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Flatten suggestions for keyboard navigation
  const flatSuggestions = suggestions.flatMap((g) => g.tags);

  const fetchSuggestions = useCallback(
    async (q: string) => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/provider/customers/tags?q=${encodeURIComponent(q)}`,
        );
        if (res.ok) {
          const data: GroupedTagSuggestions[] = await res.json();
          // Filter out already-added tags
          const filtered = data
            .map((group) => ({
              ...group,
              tags: group.tags.filter(
                (t) => !tags.includes(t.tag.toLowerCase()),
              ),
            }))
            .filter((group) => group.tags.length > 0);
          setSuggestions(filtered);
        }
      } finally {
        setLoading(false);
      }
    },
    [tags],
  );

  useEffect(() => {
    if (fetchTimeout.current) clearTimeout(fetchTimeout.current);
    if (!showDropdown) return;
    fetchTimeout.current = setTimeout(() => {
      fetchSuggestions(inputValue);
    }, 150);
    return () => {
      if (fetchTimeout.current) clearTimeout(fetchTimeout.current);
    };
  }, [inputValue, showDropdown, fetchSuggestions]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const addTag = useCallback(
    async (tagText: string, category = "Custom") => {
      const normalized = tagText.trim().toLowerCase();
      if (!normalized || tags.includes(normalized)) return;

      const newTags = [...tags, normalized];
      setTags(newTags);
      setInputValue("");
      setShowDropdown(false);
      setHighlightedIndex(-1);
      setSaving(true);

      try {
        // If it's a new tag not in DB, upsert it first
        const isExisting = flatSuggestions.some((s) => s.tag === normalized);
        if (!isExisting) {
          await fetch("/api/provider/customers/tags", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tag: normalized, category }),
          });
        } else {
          // Increment usage count
          await fetch("/api/provider/customers/tags", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tag: normalized, category }),
          });
        }
        await onTagsChange(customerId, newTags);
      } finally {
        setSaving(false);
      }
    },
    [tags, customerId, onTagsChange, flatSuggestions],
  );

  const removeTag = useCallback(
    async (tagText: string) => {
      const newTags = tags.filter((t) => t !== tagText);
      setTags(newTags);
      setSaving(true);
      try {
        await onTagsChange(customerId, newTags);
      } finally {
        setSaving(false);
      }
    },
    [tags, customerId, onTagsChange],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, flatSuggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && flatSuggestions[highlightedIndex]) {
        const s = flatSuggestions[highlightedIndex];
        addTag(s.tag, s.category);
      } else if (inputValue.trim()) {
        addTag(inputValue.trim());
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setHighlightedIndex(-1);
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  // Flatten index offset for highlighting within grouped display
  let flatIdx = 0;

  return (
    <div className="space-y-2">
      {/* Chips row */}
      <div className="flex flex-wrap gap-1.5 min-h-[24px]">
        {tags.map((tag) => (
          <TagChip
            key={tag}
            tag={tag}
            onRemove={saving ? () => {} : () => removeTag(tag)}
          />
        ))}
        {saving && (
          <span className="text-xs text-neutral-400 self-center">Saving…</span>
        )}
      </div>

      {/* Input + dropdown */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowDropdown(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder="Type a tag and press Enter…"
          disabled={saving}
          className={cx(
            "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm",
            "focus:border-transparent focus:ring-2 focus:ring-[var(--color-forest)]",
            "placeholder:text-neutral-400 disabled:opacity-50 transition-shadow",
          )}
          aria-label="Add customer tag"
          autoComplete="off"
        />

        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute left-0 top-full mt-1 z-20 w-full rounded-xl border border-neutral-200 bg-white shadow-lg overflow-hidden"
          >
            {loading && (
              <div className="px-4 py-3 text-xs text-neutral-400">
                Loading suggestions…
              </div>
            )}

            {!loading && suggestions.length === 0 && inputValue.trim() && (
              <div className="px-4 py-3">
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    addTag(inputValue.trim());
                  }}
                  className="flex items-center gap-2 text-sm text-neutral-700 hover:text-[var(--color-forest)] transition-colors"
                >
                  <span className="text-neutral-400 text-xs">Create</span>
                  <span className="font-medium text-[var(--color-forest)]">
                    &ldquo;{inputValue.trim()}&rdquo;
                  </span>
                  <span className="text-xs text-neutral-400">
                    as Custom tag
                  </span>
                </button>
              </div>
            )}

            {!loading && suggestions.length === 0 && !inputValue.trim() && (
              <div className="px-4 py-3 text-xs text-neutral-400">
                Start typing to see suggestions
              </div>
            )}

            {!loading &&
              suggestions.map((group) => {
                const groupStart = flatIdx;
                flatIdx += group.tags.length;
                return (
                  <div key={group.category}>
                    {/* Category header */}
                    <div className="px-3 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 bg-neutral-50 border-b border-neutral-100">
                      {group.category}
                    </div>
                    {group.tags.map((tagItem, i) => {
                      const absIdx = groupStart + i;
                      const isHighlighted = absIdx === highlightedIndex;
                      return (
                        <button
                          key={tagItem.id}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            addTag(tagItem.tag, tagItem.category);
                          }}
                          onMouseEnter={() => setHighlightedIndex(absIdx)}
                          className={cx(
                            "w-full text-left flex items-center justify-between px-3 py-2 text-sm transition-colors",
                            isHighlighted
                              ? "bg-[var(--color-forest)]/5 text-[var(--color-forest)]"
                              : "text-neutral-700 hover:bg-neutral-50",
                          )}
                        >
                          <span className="font-medium">{tagItem.tag}</span>
                          {tagItem.usage_count > 0 && (
                            <span className="text-xs text-neutral-400">
                              {tagItem.usage_count}×
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}

            {/* "Create new" option always shown when input has value and there are also suggestions */}
            {!loading && suggestions.length > 0 && inputValue.trim() && (
              <div className="border-t border-neutral-100">
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    addTag(inputValue.trim());
                  }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-neutral-500 hover:bg-neutral-50 transition-colors"
                >
                  <span className="text-xs">Create</span>
                  <span className="font-medium text-[var(--color-forest)]">
                    &ldquo;{inputValue.trim()}&rdquo;
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-neutral-400">
        Press Enter to add · Backspace to remove last · or click a suggestion
      </p>
    </div>
  );
}
