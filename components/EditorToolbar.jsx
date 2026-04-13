'use client'

function ToolbarButton({ active = false, onClick, label, title }) {
  return (
    <button
      type="button"
      className={`toolbar-button ${active ? 'is-active' : ''}`}
      onClick={onClick}
      aria-pressed={active}
      title={title || label}
    >
      {label}
    </button>
  )
}

export default function EditorToolbar({ editor }) {
  if (!editor) return null

  return (
    <div className="toolbar">
      <ToolbarButton label="B" title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} />
      <ToolbarButton label="I" title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} />
      <ToolbarButton label="S" title="Strike" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} />
      <ToolbarButton label="Code" title="Code" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} />
      <ToolbarButton label="H1" title="Heading 1" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
      <ToolbarButton label="H2" title="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
      <ToolbarButton label="• List" title="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} />
      <ToolbarButton label="1. List" title="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
      <ToolbarButton label="Quote" title="Quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
      <ToolbarButton label="Clear" title="Clear formatting" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} />
      <ToolbarButton label="Undo" title="Undo" onClick={() => editor.chain().focus().undo().run()} />
      <ToolbarButton label="Redo" title="Redo" onClick={() => editor.chain().focus().redo().run()} />
    </div>
  )
}
