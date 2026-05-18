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
      className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
        active
          ? "bg-neutral-200 text-neutral-900"
          : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
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
          "rich-text min-h-[160px] px-3 py-2.5 text-sm text-neutral-900 focus:outline-none",
      },
    },
  });

  return (
    <div className="rounded-lg border border-neutral-300 focus-within:border-neutral-900 focus-within:ring-1 focus-within:ring-neutral-900 transition-colors overflow-hidden">
      <div className="flex flex-wrap gap-0.5 border-b border-neutral-200 bg-neutral-50 px-2 py-1.5">
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
        <span className="mx-1 self-center text-neutral-200">|</span>
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
        <span className="mx-1 self-center text-neutral-200">|</span>
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
        <span className="mx-1 self-center text-neutral-200">|</span>
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
