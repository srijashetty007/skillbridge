import { FormEvent, useEffect, useState } from 'react'
import { Award, CheckCircle2, MessageSquareCode, Play, Send } from 'lucide-react'
import { apiRequest } from '../lib/api'
import { InterviewSession } from '../types'

export default function InterviewPrepPage() {
  const [sessions, setSessions] = useState<InterviewSession[]>([])
  const [active, setActive] = useState<InterviewSession | null>(null)
  const [role, setRole] = useState('Full-Stack Software Engineer')
  const [interviewType, setInterviewType] = useState('technical')
  const [difficulty, setDifficulty] = useState('entry')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [starting, setStarting] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    apiRequest<InterviewSession[]>('/api/interviews').then((list) => {
      setSessions(list)
      if (list.length > 0 && list[0].status === 'in_progress') {
        setActive(list[0])
      }
    })
  }, [])

  const handleStart = async (e: FormEvent) => {
    e.preventDefault()
    setStarting(true)
    try {
      const session = await apiRequest<InterviewSession>('/api/interviews/start', {
        method: 'POST',
        body: JSON.stringify({ role, interview_type: interviewType, difficulty }),
      })
      setSessions((prev) => [session, ...prev])
      setActive(session)
      setAnswers({})
    } finally {
      setStarting(false)
    }
  }

  const handleSubmitAnswers = async (e: FormEvent) => {
    e.preventDefault()
    if (!active) return
    setSubmitting(true)
    try {
      const payloadAnswers = active.questions.map((q) => ({
        question: q.question,
        answer: answers[q.id] || '',
      }))
      const updated = await apiRequest<InterviewSession>(`/api/interviews/${active.id}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers: payloadAnswers }),
      })
      setActive(updated)
      setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2.5 text-2xl font-extrabold text-slate-900">
          <MessageSquareCode className="h-6 w-6 text-indigo-600" />
          Interview Preparation
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Practice realistic technical, behavioral, and system design questions with structured scoring.
        </p>
      </div>

      {/* Start New Session */}
      <form
        onSubmit={handleStart}
        className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-4 sm:items-end"
      >
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
            Target Role
          </label>
          <input
            type="text"
            required
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
            Interview Type
          </label>
          <select
            value={interviewType}
            onChange={(e) => setInterviewType(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500"
          >
            <option value="technical">Technical</option>
            <option value="behavioral">Behavioral (STAR)</option>
            <option value="system_design">System Design</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
            Difficulty
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500"
          >
            <option value="entry">Internship / Entry</option>
            <option value="intermediate">New Grad</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={starting}
          className="gradient-brand inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
        >
          <Play className="h-4 w-4" />
          {starting ? 'Starting...' : 'Start Mock Interview'}
        </button>
      </form>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Active Session */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-8">
          {active ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {active.role} — {active.interview_type.replace('_', ' ').toUpperCase()}
                  </h2>
                  <p className="text-xs text-slate-500">Difficulty: {active.difficulty}</p>
                </div>
                {active.score !== null && (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                    Score: {active.score}/100
                  </span>
                )}
              </div>

              {active.status === 'completed' ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 text-xs leading-relaxed whitespace-pre-wrap text-slate-800">
                    <p className="mb-1 font-bold text-indigo-900">Evaluation Feedback</p>
                    {active.feedback}
                  </div>
                  {active.answers.map((item, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs">
                      <p className="font-bold text-slate-900">Q{idx + 1}: {item.question}</p>
                      <p className="mt-2 text-slate-700">{item.answer || '(No answer submitted)'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleSubmitAnswers} className="space-y-5">
                  {active.questions.map((q, idx) => (
                    <div key={q.id} className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-sm font-bold text-slate-900">
                        {idx + 1}. {q.question}
                      </p>
                      <p className="text-xs text-indigo-600">Tip: {q.tip}</p>
                      <textarea
                        rows={4}
                        required
                        value={answers[q.id] || ''}
                        onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                        placeholder="Write your structured answer here..."
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500"
                      />
                    </div>
                  ))}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="gradient-brand inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white"
                  >
                    <Send className="h-4 w-4" />
                    {submitting ? 'Evaluating...' : 'Submit Interview Answers'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-slate-500">
              Start a new mock interview above or select a past session on the right.
            </div>
          )}
        </div>

        {/* History */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Award className="h-5 w-5 text-violet-600" />
            Past Sessions
          </h2>
          <div className="mt-4 space-y-2.5">
            {sessions.length === 0 ? (
              <p className="text-xs text-slate-500">No interview sessions yet.</p>
            ) : (
              sessions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActive(s)}
                  className={`block w-full rounded-xl border p-3 text-left transition ${
                    active?.id === s.id
                      ? 'border-indigo-500 bg-indigo-50/50'
                      : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{s.role}</span>
                    {s.status === 'completed' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" /> {s.score}/100
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {s.interview_type.replace('_', ' ')} • {new Date(s.created_at).toLocaleDateString()}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
