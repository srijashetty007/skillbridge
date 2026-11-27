import { FormEvent, useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Plus, Target, Trash2 } from 'lucide-react'
import { apiRequest } from '../lib/api'
import { SkillItem } from '../types'

const ROLES = [
  'Full-Stack Software Engineer',
  'AI / Machine Learning Engineer',
  'Data Analyst / BI Engineer',
  'Product Designer (UI/UX)',
  'Cloud & DevOps Engineer',
]

interface GapResult {
  target_role: string
  readiness_score: number
  skills_analysis: Array<{
    skill: string
    category: string
    current: number
    target: number
    gap: number
    status: 'ready' | 'in_progress' | 'missing'
  }>
}

export default function SkillGapPage() {
  const [skills, setSkills] = useState<SkillItem[]>([])
  const [newSkill, setNewSkill] = useState({ name: '', category: 'Technical', proficiency: 60, target_proficiency: 85 })
  const [targetRole, setTargetRole] = useState(ROLES[0])
  const [gapResult, setGapResult] = useState<GapResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)

  const loadSkills = async () => {
    try {
      const data = await apiRequest<SkillItem[]>('/api/skills')
      setSkills(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSkills()
  }, [])

  const handleAddSkill = async (e: FormEvent) => {
    e.preventDefault()
    if (!newSkill.name.trim()) return
    const saved = await apiRequest<SkillItem>('/api/skills', {
      method: 'POST',
      body: JSON.stringify(newSkill),
    })
    setSkills((prev) => {
      const idx = prev.findIndex((s) => s.id === saved.id)
      if (idx >= 0) {
        return prev.map((s) => (s.id === saved.id ? saved : s))
      }
      return [saved, ...prev]
    })
    setNewSkill({ name: '', category: 'Technical', proficiency: 60, target_proficiency: 85 })
  }

  const handleUpdateProficiency = async (skillId: number, proficiency: number) => {
    const updated = await apiRequest<SkillItem>(`/api/skills/${skillId}`, {
      method: 'PATCH',
      body: JSON.stringify({ proficiency }),
    })
    setSkills((prev) => prev.map((s) => (s.id === skillId ? updated : s)))
  }

  const handleDelete = async (skillId: number) => {
    await apiRequest(`/api/skills/${skillId}`, { method: 'DELETE' })
    setSkills((prev) => prev.filter((s) => s.id !== skillId))
  }

  const handleAnalyzeGap = async () => {
    setAnalyzing(true)
    try {
      const res = await apiRequest<GapResult>('/api/skills/analyze-gap', {
        method: 'POST',
        body: JSON.stringify({ target_role: targetRole }),
      })
      setGapResult(res)
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2.5 text-2xl font-extrabold text-slate-900">
          <Target className="h-6 w-6 text-indigo-600" />
          Skill Gap Analyzer
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Track your current technical skills and compare them against target industry benchmarks.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Manage Skills */}
        <div className="space-y-5 lg:col-span-6">
          <form onSubmit={handleAddSkill} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">Add or Update Skill</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                required
                value={newSkill.name}
                onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                placeholder="e.g., React, TypeScript, SQL"
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-indigo-500"
              />
              <select
                value={newSkill.category}
                onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-indigo-500"
              >
                <option value="Technical">Technical</option>
                <option value="Programming">Programming</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Data">Data</option>
                <option value="DevOps">DevOps</option>
                <option value="Design">Design</option>
              </select>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="flex justify-between text-xs font-semibold text-slate-600">
                  <span>Current Proficiency</span>
                  <span>{newSkill.proficiency}%</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={newSkill.proficiency}
                  onChange={(e) => setNewSkill({ ...newSkill, proficiency: Number(e.target.value) })}
                  className="mt-1 w-full accent-indigo-600"
                />
              </div>
              <div>
                <label className="flex justify-between text-xs font-semibold text-slate-600">
                  <span>Target Level</span>
                  <span>{newSkill.target_proficiency}%</span>
                </label>
                <input
                  type="range"
                  min={40}
                  max={100}
                  value={newSkill.target_proficiency}
                  onChange={(e) => setNewSkill({ ...newSkill, target_proficiency: Number(e.target.value) })}
                  className="mt-1 w-full accent-violet-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="gradient-brand mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              Save Skill
            </button>
          </form>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">Your Skill Inventory</h2>
            {loading ? (
              <p className="mt-4 text-xs text-slate-500">Loading skills...</p>
            ) : skills.length === 0 ? (
              <p className="mt-4 text-xs text-slate-500">No skills added yet.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {skills.map((skill) => (
                  <div key={skill.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-sm font-bold text-slate-900">{skill.name}</span>
                        <span className="ml-2 rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500">
                          {skill.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            skill.status === 'proficient'
                              ? 'bg-emerald-100 text-emerald-700'
                              : skill.status === 'learning'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {skill.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDelete(skill.id)}
                          className="text-slate-400 hover:text-rose-600"
                          aria-label={`Delete ${skill.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={skill.proficiency}
                        onChange={(e) => handleUpdateProficiency(skill.id, Number(e.target.value))}
                        className="flex-1 accent-indigo-600"
                      />
                      <span className="w-16 text-right text-xs font-semibold text-slate-700">
                        {skill.proficiency}% / {skill.target_proficiency}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Role Gap Analysis */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-6">
          <h2 className="text-base font-bold text-slate-900">Benchmark Against Target Role</h2>
          <p className="mt-1 text-xs text-slate-500">
            Select a role to identify missing skills and readiness gaps.
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAnalyzeGap}
              disabled={analyzing}
              className="gradient-brand rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
            >
              {analyzing ? 'Analyzing...' : 'Analyze Gaps'}
            </button>
          </div>

          {gapResult && (
            <div className="mt-6 space-y-4">
              <div className="gradient-brand-soft flex items-center justify-between rounded-2xl border border-indigo-100 p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                    Role Readiness Score
                  </p>
                  <p className="text-sm font-bold text-slate-900">{gapResult.target_role}</p>
                </div>
                <span className="text-3xl font-extrabold text-indigo-700">
                  {gapResult.readiness_score}%
                </span>
              </div>

              <div className="space-y-3">
                {gapResult.skills_analysis.map((item) => (
                  <div key={item.skill} className="rounded-xl border border-slate-100 p-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.status === 'ready' ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <AlertCircle
                            className={`h-4 w-4 ${
                              item.status === 'in_progress' ? 'text-indigo-500' : 'text-amber-500'
                            }`}
                          />
                        )}
                        <span className="text-sm font-bold text-slate-900">{item.skill}</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-600">
                        {item.gap === 0 ? 'Benchmark met' : `Gap: ${item.gap} pts`}
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${
                          item.status === 'ready'
                            ? 'bg-emerald-500'
                            : item.status === 'in_progress'
                              ? 'bg-indigo-600'
                              : 'bg-amber-400'
                        }`}
                        style={{ width: `${Math.min(100, Math.round((item.current / item.target) * 100))}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Current: {item.current}% • Target: {item.target}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
