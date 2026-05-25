"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

type Props = {
  content: string;
  onChange: (html: string) => void;
};

function ToolBtn({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      className={`rounded px-2.5 py-1.5 text-xs font-bold transition-all ${
        active
          ? "bg-[var(--green-900)] text-white shadow-sm"
          : "text-[var(--ink-sub)] hover:bg-[var(--cream-100)] hover:text-[var(--green-900)]"
      }`}
    >
      {children}
    </button>
  );
}

export default function TiptapEditor({ content, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "rich-text min-h-[200px] px-4 py-3 text-sm text-[var(--ink)] focus:outline-none bg-white",
      },
    },
  });

  return (
    <div className="rounded-xl border border-[var(--line)] focus-within:border-[var(--green-800)] focus-within:ring-1 focus-within:ring-[var(--green-800)] transition-all overflow-hidden shadow-sm">
      <div className="flex flex-wrap items-center gap-1 border-b border-[var(--line)] bg-[var(--cream-50)]/50 px-3 py-2">
        <ToolBtn
          active={editor?.isActive("bold")}
          onClick={() => editor?.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <strong>B</strong>
        </ToolBtn>
        <ToolBtn
          active={editor?.isActive("italic")}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <em>I</em>
        </ToolBtn>
        <span className="mx-1 self-center h-4 w-px bg-[var(--line)]" />
        <ToolBtn
          active={editor?.isActive("heading", { level: 2 })}
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run()
          }
          title="Heading 2"
        >
          H2
        </ToolBtn>
        <ToolBtn
          active={editor?.isActive("heading", { level: 3 })}
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 3 }).run()
          }
          title="Heading 3"
        >
          H3
        </ToolBtn>
        <span className="mx-1 self-center h-4 w-px bg-[var(--line)]" />
        <ToolBtn
          active={editor?.isActive("bulletList")}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          title="Bullet list"
        >
          • List
        </ToolBtn>
        <ToolBtn
          active={editor?.isActive("orderedList")}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          title="Numbered list"
        >
          1. List
        </ToolBtn>
        <span className="mx-1 self-center h-4 w-px bg-[var(--line)]" />
        <ToolBtn
          active={editor?.isActive("blockquote")}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          title="Blockquote"
        >
          ❝
        </ToolBtn>
        <ToolBtn
          active={false}
          onClick={() => editor?.chain().focus().setHardBreak().run()}
          title="Line break"
        >
          ↵
        </ToolBtn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
