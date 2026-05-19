"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  searchCustomerTags,
  upsertCustomerTag,
  type TagSuggestionGroup,
} from "@/lib/supabase";

// Demo provider id (Tahko Adventure Oy) — first provider seeded in Supabase
const DEMO_PROVIDER_ID = "45ba17b9-21ec-4193-a2ca-9bb4bc9ce808";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

type TagPill = {
  label: string;
  /** true when the tag was typed by the user and not yet in the catalog */
  isNew?: boolean;
};

type Props = {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
};

export function CustomerTagInput({
  value,
  onChange,
  placeholder = "Add tag…",
  className,
}: Props) {
  const [inputValue, setInputValue] = useState("");
  const [groups, setGroups] = useState<TagSuggestionGroup[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Flatten suggestions for keyboard navigation
  const flatSuggestions: { tag: string; isNew: boolean }[] = [];
  const trimmed = inputValue.trim().toLowerCase();

  // Check if the typed value already exists in suggestions
  const existsInSuggestions = groups.some((g) =>
    g.tags.some((t) => t.tag.toLowerCase() === trimmed),
  );
  const existsInValue = value.some((v) => v.toLowerCase() === trimmed);

  // Add "Create …" option when it's new text
  if (trimmed && !existsInSuggestions && !existsInValue) {
    flatSuggestions.push({ tag: trimmed, isNew: true });
  }
  groups.forEach((g) => {
    g.tags.forEach((t) => {
      if (!value.includes(t.tag)) {
        flatSuggestions.push({ tag: t.tag, isNew: false });
      }
    });
  });

  const fetchSuggestions = useCallback(async (q: string) => {
    setLoading(true);
    const result = await searchCustomerTags(DEMO_PROVIDER_ID, q);
    setGroups(result);
    setLoading(false);
    setActiveIndex(-1);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(inputValue);
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputValue, fetchSuggestions]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function addTag(tag: string, isNew: boolean) {
    const normalised = tag.trim().toLowerCase();
    if (!normalised || value.includes(normalised)) return;
    onChange([...value, normalised]);
    if (isNew) {
      // Fire-and-forget: persist to catalog
      upsertCustomerTag(DEMO_PROVIDER_ID, normalised, "General");
    } else {
      upsertCustomerTag(DEMO_PROVIDER_ID, normalised);
    }
    setInputValue("");
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatSuggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (activeIndex >= 0 && flatSuggestions[activeIndex]) {
        const s = flatSuggestions[activeIndex];
        addTag(s.tag, s.isNew);
      } else if (inputValue.trim()) {
        addTag(inputValue.trim(), !existsInSuggestions);
      }
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  // Build grouped dropdown rows (with inter-group headers)
  const dropdownRows: React.ReactNode[] = [];
  let flatIdx = 0;

  // "Create" row at top
  if (trimmed && !existsInSuggestions && !existsInValue) {
    const idx = flatIdx++;
    dropdownRows.push(
      <button
        key="__create__"
        onMouseDown={(e) => {
          e.preventDefault();
          addTag(trimmed, true);
        }}
        className={cx(
          "w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors",
          activeIndex === idx
            ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
            : "text-[var(--color-forest)] hover:bg-[var(--color-accent)]/10 hover:text-[var(--color-accent)]",
        )}
      >
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider border border-[var(--color-accent)] text-[var(--color-accent)] rounded px-1.5 py-0.5">
          New
        </span>
        <span className="font-medium">{trimmed}</span>
      </button>,
    );
  }

  groups.forEach((group) => {
    const available = group.tags.filter((t) => !value.includes(t.tag));
    if (available.length === 0) return;

    dropdownRows.push(
      <div
        key={`header-${group.category}`}
        className="px-3 pt-2 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-sage)] select-none"
      >
        {group.category}
      </div>,
    );

    available.forEach((t) => {
      const idx = flatIdx++;
      dropdownRows.push(
        <button
          key={t.id}
          onMouseDown={(e) => {
            e.preventDefault();
            addTag(t.tag, false);
          }}
          className={cx(
            "w-full flex items-center justify-between px-3 py-1.5 text-sm text-left transition-colors",
            activeIndex === idx
              ? "bg-[var(--color-forest)]/8 text-[var(--color-forest)]"
              : "text-neutral-700 hover:bg-[var(--color-forest)]/5 hover:text-[var(--color-forest)]",
          )}
        >
          <span>{t.tag}</span>
          {t.usage_count > 1 && (
            <span className="text-[11px] text-neutral-400 tabular-nums">
              {t.usage_count}×
            </span>
          )}
        </button>,
      );
    });
  });

  const showDropdown = open && (loading || dropdownRows.length > 0);

  return (
    <div className={cx("relative", className)}>
      {/* Tag pills + input */}
      <div
        className={cx(
          "flex flex-wrap gap-1.5 min-h-[38px] w-full px-2.5 py-1.5 border border-neutral-300 rounded-lg",
          "focus-within:ring-2 focus-within:ring-[var(--color-forest)] focus-within:border-transparent",
          "bg-white cursor-text transition-shadow",
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <TagPill key={tag} tag={tag} onRemove={removeTag} />
        ))}

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] border-0 outline-none text-sm text-neutral-900 placeholder:text-neutral-400 bg-transparent"
        />
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full max-h-72 overflow-y-auto rounded-lg border border-neutral-200 bg-white shadow-lg"
        >
          {loading && dropdownRows.length === 0 ? (
            <div className="px-3 py-2 text-sm text-neutral-400">Loading…</div>
          ) : (
            dropdownRows
          )}
        </div>
      )}

      <p className="mt-1 text-xs text-neutral-400">
        Press <kbd className="font-mono">Enter</kbd> or{" "}
        <kbd className="font-mono">,</kbd> to add. Type anything to create a new
        tag.
      </p>
    </div>
  );
}

function TagPill({
  tag,
  onRemove,
}: {
  tag: string;
  onRemove: (tag: string) => void;
}) {
  // Map well-known tags to colours; fallback to forest/cream for custom ones
  const colorMap: Record<string, string> = {
    vip: "bg-purple-50 text-purple-700 ring-purple-200",
    repeat: "bg-blue-50 text-blue-700 ring-blue-200",
    group: "bg-green-50 text-green-700 ring-green-200",
    corporate: "bg-amber-50 text-amber-700 ring-amber-200",
    family: "bg-pink-50 text-pink-700 ring-pink-200",
    solo: "bg-sky-50 text-sky-700 ring-sky-200",
    honeymoon: "bg-rose-50 text-rose-700 ring-rose-200",
    birthday: "bg-orange-50 text-orange-700 ring-orange-200",
    anniversary: "bg-red-50 text-red-700 ring-red-200",
  };

  const colorClass =
    colorMap[tag] ??
    "bg-[var(--color-forest)]/8 text-[var(--color-forest)] ring-[var(--color-forest)]/20";

  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1",
        colorClass,
      )}
    >
      {tag}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(tag);
        }}
        className="ml-0.5 rounded-full hover:opacity-70 transition-opacity leading-none"
        aria-label={`Remove ${tag}`}
      >
        ×
      </button>
    </span>
  );
}
