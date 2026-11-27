import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  Bot,
  Eraser,
  Loader2,
  MessageSquarePlus,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { apiRequest, ApiError } from '../lib/api'
import { ChatConversation } from '../types'

const QUICK_PROMPTS = [
  'Which skills should I learn next for my target role?',
  'Help me improve a software project bullet on my resume.',
  'How do I answer "Tell me about a challenge" using STAR?',
  'Explain REST APIs vs GraphQL simply.',
]

export default function SkillBridgeChatbot() {
  const [open, setOpen] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
  const [configured, setConfigured] = useState<boolean | null>(null)
  const [statusMessage, setStatusMessage] = useState('')
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [activeId, setActiveId] = useState<number | null>(null)
  const [input, setInput] = useState('')
  const [pendingUserMessage, setPendingUserMessage] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const activeConversation = conversations.find((c) => c.id === activeId) || null

  const loadChatData = useCallback(async () => {
    setStatusLoading(true)
    setError('')
    try {
      const [statusRes, convs] = await Promise.all([
        apiRequest<{ configured: boolean; model: string; message: string }>('/api/chat/status'),
        apiRequest<ChatConversation[]>('/api/chat/conversations'),
      ])
      setConfigured(statusRes.configured)
      setStatusMessage(statusRes.message)
      setConversations(convs)
      setActiveId((prev) => (prev && convs.some((c) => c.id === prev) ? prev : convs[0]?.id ?? null))
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Network error: Unable to reach the SkillBridge backend.')
      }
    } finally {
      setStatusLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      loadChatData()
    }
  }, [open, loadChatData])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConversation?.messages.length, pendingUserMessage, sending])

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) {
      setError('Please enter a message before sending.')
      return
    }
    if (sending) return

    setError('')
    setSending(true)
    setPendingUserMessage(trimmed)
    setInput('')

    try {
      const updatedConv = await apiRequest<ChatConversation>('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          conversation_id: activeId,
          message: trimmed,
        }),
      })
      setConversations((prev) => {
        const exists = prev.some((c) => c.id === updatedConv.id)
        if (exists) {
          return prev.map((c) => (c.id === updatedConv.id ? updatedConv : c))
        }
        return [updatedConv, ...prev]
      })
      setActiveId(updatedConv.id)
      setConfigured(true)
    } catch (err) {
      setInput(trimmed)
      if (err instanceof ApiError) {
        if (err.status === 503) {
          setConfigured(false)
          setStatusMessage(err.message)
        }
        setError(err.message)
      } else {
        setError('Network error: Unable to connect to SkillBridge AI. Please check that the backend is running.')
      }
    } finally {
      setPendingUserMessage(null)
      setSending(false)
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleClearActiveChat = async () => {
    if (!activeId) {
      setInput('')
      setError('')
      return
    }
    setError('')
    try {
      const cleared = await apiRequest<ChatConversation>(
        `/api/chat/conversations/${activeId}/messages`,
        { method: 'DELETE' }
      )
      setConversations((prev) => prev.map((c) => (c.id === activeId ? cleared : c)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to clear chat.')
    }
  }

  const handleDeleteConversation = async (id: number) => {
    try {
      await apiRequest(`/api/chat/conversations/${id}`, { method: 'DELETE' })
      const remaining = conversations.filter((c) => c.id !== id)
      setConversations(remaining)
      if (activeId === id) {
        setActiveId(remaining[0]?.id ?? null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete chat.')
    }
  }

  const hasMessages = (activeConversation?.messages.length ?? 0) > 0 || pendingUserMessage !== null

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="gradient-brand no-print fixed right-6 bottom-6 z-50 flex items-center gap-2.5 rounded-full px-5 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-600/30 transition hover:scale-105"
        aria-label="Open SkillBridge AI"
      >
        <Bot className="h-5 w-5" />
        <span>SkillBridge AI</span>
      </button>

      {/* Floating Chat Drawer */}
      {open && (
        <div className="no-print fixed right-4 bottom-22 z-50 flex h-[560px] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl sm:right-6">
          {/* Header */}
          <div className="gradient-brand flex items-center justify-between px-5 py-4 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold">SkillBridge AI</h3>
                <p className="text-[11px] text-indigo-100">
                  {configured === null
                    ? 'Checking Gemini connection...'
                    : configured
                      ? 'Connected to Gemini AI'
                      : 'API key configuration required'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {hasMessages && (
                <button
                  type="button"
                  onClick={handleClearActiveChat}
                  title="Clear chat messages"
                  aria-label="Clear chat"
                  className="rounded-lg p-1.5 text-white/80 hover:bg-white/15 hover:text-white"
                >
                  <Eraser className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setActiveId(null)
                  setError('')
                }}
                title="New conversation"
                aria-label="New conversation"
                className="rounded-lg p-1.5 text-white/80 hover:bg-white/15 hover:text-white"
              >
                <MessageSquarePlus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="rounded-lg p-1.5 text-white/80 hover:bg-white/15 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Conversation Tabs */}
          {conversations.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-100 bg-slate-50 px-3 py-2">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    conv.id === activeId
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActiveId(conv.id)
                      setError('')
                    }}
                    className="max-w-[120px] truncate"
                  >
                    {conv.title}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteConversation(conv.id)}
                    className="text-slate-400 hover:text-rose-600"
                    aria-label="Delete conversation"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Body */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {configured === false && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <div className="flex-1">
                    <p className="font-bold">Gemini API Key Not Configured</p>
                    <p className="mt-1">{statusMessage}</p>
                    <p className="mt-2 font-mono text-[11px] text-amber-800">
                      backend/.env → GEMINI_API_KEY=your_actual_api_key
                    </p>
                    <button
                      type="button"
                      onClick={loadChatData}
                      disabled={statusLoading}
                      className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-amber-900 hover:bg-amber-100/60"
                    >
                      <RefreshCw className={`h-3 w-3 ${statusLoading ? 'animate-spin' : ''}`} />
                      Check Connection
                    </button>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start justify-between gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={() => setError('')}
                  className="shrink-0 text-rose-500 hover:text-rose-700"
                  aria-label="Dismiss error"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {!hasMessages ? (
              <div className="space-y-4 py-2">
                <div className="rounded-2xl bg-indigo-50/70 p-4 text-xs leading-relaxed text-slate-700">
                  <p className="font-semibold text-indigo-900">Hi! I am SkillBridge AI.</p>
                  <p className="mt-1">
                    Ask me about career paths, technical concepts, resume bullets, interview answers, or what skills to learn next.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Suggested Prompts
                  </p>
                  {QUICK_PROMPTS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      disabled={configured === false || sending}
                      onClick={() => sendMessage(q)}
                      className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs font-medium text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50/50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {activeConversation?.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'gradient-brand text-white'
                          : 'border border-slate-200 bg-slate-50 text-slate-800'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {pendingUserMessage && (
                  <div className="flex justify-end">
                    <div className="gradient-brand max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap text-white opacity-90">
                      {pendingUserMessage}
                    </div>
                  </div>
                )}
              </>
            )}

            {sending && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                  <span>SkillBridge AI is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t border-slate-100 bg-white p-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                disabled={statusLoading || configured === false || sending}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage(input)
                  }
                }}
                placeholder={
                  configured === false
                    ? 'Configure GEMINI_API_KEY in backend/.env...'
                    : 'Ask SkillBridge AI anything...'
                }
                className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-indigo-500 disabled:bg-slate-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || configured === false || sending}
                className="gradient-brand flex h-9 w-9 items-center justify-center rounded-xl text-white transition hover:opacity-95 disabled:opacity-40"
                aria-label="Send message"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
