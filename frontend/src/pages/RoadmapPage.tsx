import { FormEvent, useEffect, useState } from 'react'
import { BookOpen, CheckCircle2, Circle, Map, Plus, Trash2 } from 'lucide-react'
import { apiRequest } from '../lib/api'
import { LearningRoadmap } from '../types'

const ROLE_PRESETS = [
  'Full-Stack Software Engineer',
  'AI / Machine Learning Engineer',
  'Data Analyst / BI Engineer',
  'Product Designer (UI/UX)',
  'Cloud & DevOps Engineer',
]

export default function RoadmapPage() {
  const [roadmaps, setRoadmaps] = useState<LearningRoadmap[]>([])
  const [targetRole, setTargetRole] = useState(ROLE_PRESETS[0])
  const [weeklyHours, setWeeklyHours] = useState(12)
  const [generating, setGenerating] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest<LearningRoadmap[]>('/api/roadmaps')
      .then(setRoadmaps)
      .finally(() => setLoading(false))
  }, [])

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault()
    setGenerating(true)
    try {
      const created = await apiRequest<LearningRoadmap>('/api/roadmaps/generate', {
        method: 'POST',
        body: JSON.stringify({ target_role: targetRole, weekly_hours: weeklyHours }),
      })
      setRoadmaps((prev) => [created, ...prev])
    } finally {
      setGenerating(false)
    }
  }

  const handleToggleMilestone = async (roadmapId: number, milestoneId: string, completed: boolean) => {
    const updated = await apiRequest<LearningRoadmap>(`/api/roadmaps/${roadmapId}/milestones`, {
      method: 'PATCH',
      body: JSON.stringify({ milestone_id: milestoneId, completed }),
    })
    setRoadmaps((prev) => prev.map((r) => (r.id === roadmapId ? updated : r)))
  }

  const handleDelete = async (roadmapId: number) => {
    await apiRequest(`/api/roadmaps/${roadmapId}`, { method: 'DELETE' })
    setRoadmaps((prev) => prev.filter((r) => r.id !== roadmapId))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2.5 text-2xl font-extrabold text-slate-900">
          <Map className="h-6 w-6 text-indigo-600" />
          Personalized Learning Roadmap
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Generate a structured step-by-step study plan and check off milestones as you progress.
        </p>
      </div>

      <form
        onSubmit={handleGenerate}
        className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
            Target Role
          </label>
          <select
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500"
          >
            {ROLE_PRESETS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-44">
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
            Weekly Study Hours
          </label>
          <input
            type="number"
            min={2}
            max={60}
            value={weeklyHours}
            onChange={(e) => setWeeklyHours(Number(e.target.value))}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={generating}
          className="gradient-brand inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
        >
          <Plus className="h-4 w-4" />
          {generating ? 'Generating...' : 'Generate Roadmap'}
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-slate-500">Loading roadmaps...</p>
      ) : roadmaps.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          No roadmaps yet. Pick a target role above to create your personalized study plan.
        </div>
      ) : (
        <div className="space-y-6">
          {roadmaps.map((rm) => (
            <div key={rm.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{rm.title}</h2>
                  <p className="mt-1 text-xs text-slate-500">{rm.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-500">Progress</span>
                    <p className="text-lg font-extrabold text-indigo-600">{rm.progress_pct}%</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(rm.id)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    aria-label="Delete roadmap"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all"
                  style={{ width: `${rm.progress_pct}%` }}
                />
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {rm.milestones.map((m) => (
                  <div
                    key={m.id}
                    className={`rounded-2xl border p-4 transition ${
                      m.completed
                        ? 'border-emerald-200 bg-emerald-50/40'
                        : 'border-slate-200 bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wide text-indigo-600">
                          {m.phase} • {m.duration}
                        </span>
                        <h3 className="mt-1 text-sm font-bold text-slate-900">{m.title}</h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleMilestone(rm.id, m.id, !m.completed)}
                        className="shrink-0 text-indigo-600 hover:scale-105"
                        aria-label={m.completed ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {m.completed ? (
                          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                        ) : (
                          <Circle className="h-6 w-6 text-slate-300" />
                        )}
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {m.skills.map((sk) => (
                        <span
                          key={sk}
                          className="rounded-lg bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>

                    <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
                      <BookOpen className="h-3.5 w-3.5 shrink-0 text-violet-600" />
                      <span>Resources: {m.resources.join(', ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
