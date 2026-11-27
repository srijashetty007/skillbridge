import { FormEvent, useState } from 'react'
import { Save, Settings } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../lib/api'
import { User } from '../types'

export default function SettingsPage() {
  const { user, refreshUser } = useAuth()

  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    college_name: user?.profile?.college_name || '',
    graduation_year: user?.profile?.graduation_year || 2027,
    degree: user?.profile?.degree || 'B.Tech / B.S.',
    major: user?.profile?.major || 'Computer Science',
    target_role: user?.profile?.target_role || 'Full-Stack Software Engineer',
    bio: user?.profile?.bio || '',
    linkedin_url: user?.profile?.linkedin_url || '',
    github_url: user?.profile?.github_url || '',
    portfolio_url: user?.profile?.portfolio_url || '',
  })

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')
    try {
      await apiRequest<User>('/api/dashboard/profile', {
        method: 'PUT',
        body: JSON.stringify({
          ...form,
          graduation_year: Number(form.graduation_year),
        }),
      })
      await refreshUser()
      setMessage('Profile & career settings updated.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2.5 text-2xl font-extrabold text-slate-900">
          <Settings className="h-6 w-6 text-indigo-600" />
          Student Profile &amp; Settings
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Keep your academic background, target role, and portfolio links updated so SkillBridge AI tailors advice to you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {message && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
            {message}
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
              Full Name
            </label>
            <input
              type="text"
              required
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
              Email (Read-Only)
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
              College / University
            </label>
            <input
              type="text"
              required
              value={form.college_name}
              onChange={(e) => setForm({ ...form, college_name: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
              Graduation Year
            </label>
            <input
              type="number"
              min={2020}
              max={2035}
              value={form.graduation_year}
              onChange={(e) => setForm({ ...form, graduation_year: Number(e.target.value) })}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
              Degree
            </label>
            <input
              type="text"
              value={form.degree}
              onChange={(e) => setForm({ ...form, degree: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
              Major
            </label>
            <input
              type="text"
              value={form.major}
              onChange={(e) => setForm({ ...form, major: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
              Target Role
            </label>
            <input
              type="text"
              value={form.target_role}
              onChange={(e) => setForm({ ...form, target_role: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
            Bio &amp; Career Goals
          </label>
          <textarea
            rows={3}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
              LinkedIn URL
            </label>
            <input
              type="text"
              value={form.linkedin_url}
              onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
              placeholder="https://linkedin.com/in/..."
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
              GitHub URL
            </label>
            <input
              type="text"
              value={form.github_url}
              onChange={(e) => setForm({ ...form, github_url: e.target.value })}
              placeholder="https://github.com/..."
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
              Portfolio URL
            </label>
            <input
              type="text"
              value={form.portfolio_url}
              onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })}
              placeholder="https://..."
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="gradient-brand inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving Changes...' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}
