import { FormEvent, useEffect, useState } from 'react'
import { FileText, Plus, Printer, Save, Sparkles, Trash2 } from 'lucide-react'
import { apiRequest } from '../lib/api'
import { ResumeData } from '../types'

export default function ResumeBuilderPage() {
  const [resumes, setResumes] = useState<ResumeData[]>([])
  const [active, setActive] = useState<ResumeData | null>(null)
  const [skillsInput, setSkillsInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest<ResumeData[]>('/api/resumes').then((list) => {
      setResumes(list)
      if (list.length > 0) {
        setActive(list[0])
        setSkillsInput((list[0].skills || []).join(', '))
      }
    })
  }, [])

  const selectResume = (r: ResumeData) => {
    setActive(r)
    setSkillsInput((r.skills || []).join(', '))
    setMessage('')
    setError('')
  }

  const handleCreateNew = () => {
    const blank: ResumeData = {
      id: 0,
      title: 'New Target Resume',
      target_role: 'Full-Stack Software Engineer',
      template: 'modern',
      personal_info: { full_name: '', email: '', location: '', linkedin: '', github: '' },
      summary: '',
      education: [{ school: '', degree: '', graduation: '2027', gpa: '' }],
      experience: [],
      projects: [{ name: '', tech: '', description: '' }],
      skills: ['Python', 'React', 'TypeScript'],
      ai_feedback: '',
      updated_at: new Date().toISOString(),
    }
    setActive(blank)
    setSkillsInput(blank.skills.join(', '))
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    if (!active) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const parsedSkills = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)

      const saved = await apiRequest<ResumeData>('/api/resumes', {
        method: 'POST',
        body: JSON.stringify({
          id: active.id || null,
          title: active.title,
          target_role: active.target_role,
          template: active.template,
          personal_info: active.personal_info,
          summary: active.summary,
          education: active.education,
          experience: active.experience,
          projects: active.projects,
          skills: parsedSkills,
        }),
      })
      setActive(saved)
      setResumes((prev) => {
        const exists = prev.some((r) => r.id === saved.id)
        return exists ? prev.map((r) => (r.id === saved.id ? saved : r)) : [saved, ...prev]
      })
      setMessage('Resume saved to your profile.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save resume.')
    } finally {
      setSaving(false)
    }
  }

  const handleAiReview = async () => {
    if (!active || !active.id) {
      setError('Save your resume first before running AI review.')
      return
    }
    setReviewing(true)
    setError('')
    try {
      const updated = await apiRequest<ResumeData>(`/api/resumes/${active.id}/ai-review`, {
        method: 'POST',
      })
      setActive(updated)
      setResumes((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to run AI resume review.')
    } finally {
      setReviewing(false)
    }
  }

  const handleDelete = async (id: number) => {
    await apiRequest(`/api/resumes/${id}`, { method: 'DELETE' })
    const remaining = resumes.filter((r) => r.id !== id)
    setResumes(remaining)
    setActive(remaining[0] || null)
    if (remaining[0]) {
      setSkillsInput((remaining[0].skills || []).join(', '))
    }
  }

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-extrabold text-slate-900">
            <FileText className="h-6 w-6 text-indigo-600" />
            AI Resume Builder
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Edit your resume, preview it live, export to PDF via print, and request Gemini AI feedback.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCreateNew}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" />
            New Resume
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Printer className="h-4 w-4" />
            Print / Export PDF
          </button>
        </div>
      </div>

      {/* Saved Resume Selector */}
      <div className="no-print flex flex-wrap gap-2">
        {resumes.map((r) => (
          <div
            key={r.id}
            className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold ${
              active?.id === r.id
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 bg-white text-slate-600'
            }`}
          >
            <button type="button" onClick={() => selectResume(r)}>
              {r.title}
            </button>
            <button
              type="button"
              onClick={() => handleDelete(r.id)}
              className="text-slate-400 hover:text-rose-600"
              aria-label="Delete resume"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {active && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Editor */}
          <form
            onSubmit={handleSave}
            className="no-print space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-6"
          >
            {message && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-700">
                {message}
              </div>
            )}
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-700">
                {error}
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-600">Resume Title</label>
                <input
                  type="text"
                  required
                  value={active.title}
                  onChange={(e) => setActive({ ...active, title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600">Target Role</label>
                <input
                  type="text"
                  required
                  value={active.target_role}
                  onChange={(e) => setActive({ ...active, target_role: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Full Name"
                value={active.personal_info.full_name || ''}
                onChange={(e) =>
                  setActive({
                    ...active,
                    personal_info: { ...active.personal_info, full_name: e.target.value },
                  })
                }
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={active.personal_info.email || ''}
                onChange={(e) =>
                  setActive({
                    ...active,
                    personal_info: { ...active.personal_info, email: e.target.value },
                  })
                }
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
              />
              <input
                type="text"
                placeholder="Location (e.g., Boston, MA)"
                value={active.personal_info.location || ''}
                onChange={(e) =>
                  setActive({
                    ...active,
                    personal_info: { ...active.personal_info, location: e.target.value },
                  })
                }
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
              />
              <input
                type="text"
                placeholder="GitHub / LinkedIn URL"
                value={active.personal_info.github || ''}
                onChange={(e) =>
                  setActive({
                    ...active,
                    personal_info: { ...active.personal_info, github: e.target.value },
                  })
                }
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600">Professional Summary</label>
              <textarea
                rows={3}
                value={active.summary}
                onChange={(e) => setActive({ ...active, summary: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600">Skills (comma separated)</label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            {/* Project Section */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-600">Featured Project</label>
                <button
                  type="button"
                  onClick={() =>
                    setActive({
                      ...active,
                      projects: [...active.projects, { name: '', tech: '', description: '' }],
                    })
                  }
                  className="text-xs font-semibold text-indigo-600"
                >
                  + Add Project
                </button>
              </div>
              <div className="mt-2 space-y-3">
                {active.projects.map((proj, idx) => (
                  <div key={idx} className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input
                        type="text"
                        placeholder="Project Name"
                        value={proj.name}
                        onChange={(e) => {
                          const updated = [...active.projects]
                          updated[idx] = { ...proj, name: e.target.value }
                          setActive({ ...active, projects: updated })
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Tech Stack (e.g., React, FastAPI)"
                        value={proj.tech}
                        onChange={(e) => {
                          const updated = [...active.projects]
                          updated[idx] = { ...proj, tech: e.target.value }
                          setActive({ ...active, projects: updated })
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                      />
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Impact and key technical achievements..."
                      value={proj.description}
                      onChange={(e) => {
                        const updated = [...active.projects]
                        updated[idx] = { ...proj, description: e.target.value }
                        setActive({ ...active, projects: updated })
                      }}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="gradient-brand inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-white"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Resume'}
              </button>

              <button
                type="button"
                onClick={handleAiReview}
                disabled={reviewing}
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-2.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
              >
                <Sparkles className="h-4 w-4" />
                {reviewing ? 'Reviewing...' : 'AI Resume Critique'}
              </button>
            </div>

            {active.ai_feedback && (
              <div className="rounded-2xl border border-violet-200 bg-violet-50/70 p-4 text-xs leading-relaxed whitespace-pre-wrap text-slate-800">
                <p className="mb-1.5 font-bold text-violet-900">Gemini AI Feedback</p>
                {active.ai_feedback}
              </div>
            )}
          </form>

          {/* Live Resume Preview */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm lg:col-span-6">
            <div className="border-b-2 border-indigo-600 pb-4">
              <h2 className="text-2xl font-extrabold text-slate-900">
                {active.personal_info.full_name || 'Your Full Name'}
              </h2>
              <p className="mt-1 text-xs font-medium text-indigo-600">{active.target_role}</p>
              <p className="mt-1 text-xs text-slate-500">
                {[active.personal_info.email, active.personal_info.location, active.personal_info.github]
                  .filter(Boolean)
                  .join(' • ') || 'email@university.edu • City, State • github.com/username'}
              </p>
            </div>

            {active.summary && (
              <div className="mt-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Summary</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-700">{active.summary}</p>
              </div>
            )}

            {active.education.length > 0 && (
              <div className="mt-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Education</h3>
                {active.education.map((edu, idx) => (
                  <div key={idx} className="mt-1.5 flex justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{edu.school || 'University Name'}</p>
                      <p className="text-slate-600">{edu.degree}</p>
                    </div>
                    <span className="text-slate-500">Class of {edu.graduation}</span>
                  </div>
                ))}
              </div>
            )}

            {active.projects.length > 0 && (
              <div className="mt-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Projects</h3>
                <div className="mt-2 space-y-2.5">
                  {active.projects.map((p, idx) => (
                    <div key={idx} className="text-xs">
                      <p className="font-bold text-slate-900">
                        {p.name || 'Project Title'}{' '}
                        {p.tech && <span className="font-normal text-indigo-600">({p.tech})</span>}
                      </p>
                      <p className="mt-0.5 text-slate-600">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Skills</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {skillsInput
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((sk) => (
                    <span
                      key={sk}
                      className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700"
                    >
                      {sk}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
