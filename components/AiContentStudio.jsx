'use client'

import { useEffect, useMemo, useState } from 'react'
import ContentEditor from './ContentEditor'
import { htmlToPlainText, textToHtml } from '@/lib/html'
import { LENGTH_OPTIONS, PLATFORM_OPTIONS, TONE_OPTIONS } from '@/lib/prompt-builder'

const DRAFT_STORAGE_KEY = 'ai-content-editor:current-draft'
const HISTORY_STORAGE_KEY = 'ai-content-editor:last-3-history'

const SUGGESTIONS = [
  { id: 'shorter', label: 'Make shorter', instruction: 'Make this shorter while preserving the main message.' },
  { id: 'engaging', label: 'More engaging', instruction: 'Make this more engaging and energetic.' },
  { id: 'professional', label: 'Professional tone', instruction: 'Rewrite this in a more professional tone.' },
  { id: 'cta', label: 'Add CTA', instruction: 'Add a clear call to action at the end.' },
  { id: 'hashtags', label: 'Add hashtags', instruction: 'Add relevant hashtags only if they fit the platform naturally.' },
]

function createHistoryItem({ platform, tone, length, audience, prompt, editorHtml }) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    platform,
    tone,
    length,
    audience,
    prompt,
    editorHtml,
    createdAt: new Date().toISOString(),
  }
}

function formatDateLabel(isoDate) {
  const date = new Date(isoDate)
  return date.toLocaleString([], {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data?.error || 'Request failed.')
  }

  return data
}

export default function AiContentStudio() {
  const [platform, setPlatform] = useState('linkedin')
  const [tone, setTone] = useState('professional')
  const [length, setLength] = useState('medium')
  const [audience, setAudience] = useState('Working professionals and online audiences')
  const [prompt, setPrompt] = useState('Create a LinkedIn post announcing our AI content editor for client work and direct editing in one place.')
  const [editorHtml, setEditorHtml] = useState('<p>Generate content and it will appear here.</p>')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [suggestionLoading, setSuggestionLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY)
      const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY)

      if (savedDraft) {
        const parsedDraft = JSON.parse(savedDraft)
        setPlatform(parsedDraft.platform || 'linkedin')
        setTone(parsedDraft.tone || 'professional')
        setLength(parsedDraft.length || 'medium')
        setAudience(parsedDraft.audience || 'Working professionals and online audiences')
        setPrompt(parsedDraft.prompt || '')
        setEditorHtml(parsedDraft.editorHtml || '<p></p>')
      }

      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory)
        if (Array.isArray(parsedHistory)) {
          setHistory(parsedHistory.slice(0, 3))
        }
      }
    } catch {
      // ignore malformed local storage
    }
  }, [])

  useEffect(() => {
    const draft = {
      platform,
      tone,
      length,
      audience,
      prompt,
      editorHtml,
    }

    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft))
  }, [platform, tone, length, audience, prompt, editorHtml])

  useEffect(() => {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, 3)))
  }, [history])

  const plainText = useMemo(() => htmlToPlainText(editorHtml), [editorHtml])

  async function handleGenerate() {
    if (!prompt.trim()) {
      setError('Please write what you want the AI to generate.')
      setSuccess('')
      return
    }

    try {
      setLoading(true)
      setError('')
      setSuccess('')

      const data = await postJson('/api/generate', {
        platform,
        tone,
        length,
        audience,
        prompt,
      })

      const nextHtml = textToHtml(data.content || '')
      setEditorHtml(nextHtml)
      setHistory((previous) => [createHistoryItem({ platform, tone, length, audience, prompt, editorHtml: nextHtml }), ...previous].slice(0, 3))
      setSuccess('Draft generated and saved to the recent history sidebar.')
    } catch (currentError) {
      setError(currentError.message || 'Unable to generate content.')
      setSuccess('')
    } finally {
      setLoading(false)
    }
  }

  async function handleSuggestionClick(suggestion) {
    if (!plainText.trim()) {
      setError('Generate or type some content in the editor first.')
      setSuccess('')
      return
    }

    try {
      setSuggestionLoading(true)
      setError('')
      setSuccess('')

      const data = await postJson('/api/rewrite', {
        instruction: suggestion.instruction,
        currentContent: plainText,
        platform,
        tone,
      })

      setEditorHtml(textToHtml(data.content || ''))
      setSuccess(`Suggestion applied: ${suggestion.label}.`)
    } catch (currentError) {
      setError(currentError.message || 'Unable to apply suggestion.')
      setSuccess('')
    } finally {
      setSuggestionLoading(false)
    }
  }

  function handleCopy() {
    navigator.clipboard
      .writeText(plainText)
      .then(() => {
        setSuccess('Current editor text copied to clipboard.')
        setError('')
      })
      .catch(() => {
        setError('Clipboard copy is not available in this browser.')
        setSuccess('')
      })
  }

  function handleDownload() {
    const filename = `${platform}-content-${new Date().toISOString().slice(0, 10)}.txt`
    downloadTextFile(filename, plainText)
    setSuccess('Downloaded the current editor content as a text file.')
    setError('')
  }

  function handleClear() {
    setEditorHtml('<p></p>')
    setSuccess('Editor cleared.')
    setError('')
  }

  function handleRestoreHistory(item) {
    setPlatform(item.platform)
    setTone(item.tone)
    setLength(item.length)
    setAudience(item.audience)
    setPrompt(item.prompt)
    setEditorHtml(item.editorHtml)
    setSuccess('Loaded one of the last 3 saved conversations into the editor.')
    setError('')
  }

  return (
    <main className="page-shell">
      <div className="background-orb orb-1" />
      <div className="background-orb orb-2" />
      <div className="background-orb orb-3" />

      <div className="page-container">
        <section className="hero-card studio-card">
          <div className="hero-copy">
            <div className="chip-row">
              <span className="chip">React + Next.js (JavaScript)</span>
              <span className="chip">OpenAI generation</span>
              <span className="chip">Editable Tiptap editor</span>
            </div>
            <h1>AI Content Editor Studio</h1>
            <p>
              Generate content for LinkedIn, Instagram, YouTube, Website, Facebook, and X. The response appears directly in the editor, where the user can format, rewrite, and finalize it without leaving the UI.
            </p>
          </div>
          <div className="hero-stats">
            <div className="stat-card">
              <strong>6</strong>
              <span>Platform presets</span>
            </div>
            <div className="stat-card">
              <strong>3</strong>
              <span>Saved history items</span>
            </div>
            <div className="stat-card">
              <strong>5</strong>
              <span>Quick rewrite suggestions</span>
            </div>
          </div>
        </section>

        <section className="main-grid">
          <aside className="left-column">
            <div className="studio-card prompt-card">
              <p className="eyebrow">Prompt setup</p>
              <h2 className="panel-title">Create content</h2>
              <p className="panel-subtitle">Choose the platform, tone, length, and then describe what you want the AI to write.</p>

              <div className="field-grid">
                <div className="field-row">
                  <label className="field">
                    <span>Platform</span>
                    <select value={platform} onChange={(event) => setPlatform(event.target.value)}>
                      {PLATFORM_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field">
                    <span>Tone</span>
                    <select value={tone} onChange={(event) => setTone(event.target.value)}>
                      {TONE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="field-row">
                  <label className="field">
                    <span>Length</span>
                    <select value={length} onChange={(event) => setLength(event.target.value)}>
                      {LENGTH_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field">
                    <span>Audience</span>
                    <input value={audience} onChange={(event) => setAudience(event.target.value)} placeholder="Who is the content for?" />
                  </label>
                </div>

                <label className="field">
                  <span>Prompt</span>
                  <textarea
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    placeholder="Example: Write an Instagram caption for a new product launch in a friendly but professional tone."
                  />
                </label>
              </div>

              <div className="action-row">
                <button type="button" className="primary-button" onClick={handleGenerate} disabled={loading}>
                  {loading ? 'Generating...' : 'Generate response'}
                </button>
                <button type="button" className="secondary-button" onClick={handleCopy}>
                  Copy text
                </button>
                <button type="button" className="secondary-button" onClick={handleDownload}>
                  Download
                </button>
                <button type="button" className="ghost-button" onClick={handleClear}>
                  Clear editor
                </button>
              </div>

              {error ? <div className="status-message error-message">{error}</div> : null}
              {success ? <div className="status-message success-message">{success}</div> : null}
            </div>

            <div className="studio-card history-card">
              <div className="history-heading">
                <div>
                  <p className="eyebrow">Recent history</p>
                  <h2 className="panel-title">Last 3 conversations</h2>
                </div>
                <span className="history-count">{history.length}/3</span>
              </div>

              <div className="history-list">
                {history.length === 0 ? (
                  <div className="empty-history">
                    Generate content once and the latest 3 results will appear here.
                  </div>
                ) : (
                  history.map((item) => (
                    <button key={item.id} type="button" className="history-item" onClick={() => handleRestoreHistory(item)}>
                      <div className="history-topline">
                        <strong>{item.platform}</strong>
                        <span>{formatDateLabel(item.createdAt)}</span>
                      </div>
                      <p>{item.prompt}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </aside>

          <ContentEditor
            value={editorHtml}
            onChange={setEditorHtml}
            suggestions={SUGGESTIONS}
            onSuggestionClick={handleSuggestionClick}
            suggestionLoading={suggestionLoading}
          />
        </section>
      </div>
    </main>
  )
}
