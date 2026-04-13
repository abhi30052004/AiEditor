'use client'

import { useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import EditorToolbar from './EditorToolbar'

export default function ContentEditor({ value, onChange, suggestions, onSuggestionClick, suggestionLoading }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML())
    },
  })

  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (value !== current) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [editor, value])

  return (
    <div className="studio-card editor-panel">
      <div className="editor-header">
        <div>
          <p className="eyebrow">Editable response</p>
          <h2 className="panel-title">Tiptap Editor</h2>
          <p className="panel-subtitle">The AI response appears here and can be edited directly in the same UI.</p>
        </div>
        <div className="editor-badge">Live editing</div>
      </div>

      <EditorToolbar editor={editor} />

      <div className="suggestion-strip">
        <span className="suggestion-label">Suggestions</span>
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            type="button"
            className="suggestion-chip"
            disabled={suggestionLoading}
            onClick={() => onSuggestionClick(suggestion)}
          >
            {suggestion.label}
          </button>
        ))}
      </div>

      <div className="editor-surface">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
