import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  Calendar,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Sparkles,
  User,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    college_name: '',
    graduation_year: 2027,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.full_name.trim().length < 2) {
      setError('Please enter your full name.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.')
      return
    }
    if (!form.college_name.trim()) {
      setError('Please enter your college or university name.')
      return
    }

    setLoading(true)
    try {
      await signup({
        ...form,
        graduation_year: Number(form.graduation_year),
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-lg">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to SkillBridge
        </Link>

        <div className="rounded-3xl border border-slate-200/90 bg-white p-8 shadow-xl shadow-indigo-950/5">
          <div className="flex items-center gap-2.5">
            <div className="gradient-brand flex h-10 w-10 items-center justify-center rounded-xl text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-950">Create your SkillBridge account</h1>
              <p className="text-xs text-slate-500">Launch your personalized career roadmap in seconds</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Full Name
              </label>
              <div className="relative mt-1.5">
                <User className="pointer-events-none absolute top-3 left-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Jordan Lee"
                  className="w-full rounded-xl border border-slate-200 py-2.5 pr-4 pl-10 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Email Address
              </label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute top-3 left-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="jordan@university.edu"
                  className="w-full rounded-xl border border-slate-200 py-2.5 pr-4 pl-10 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  College Name
                </label>
                <div className="relative mt-1.5">
                  <Building2 className="pointer-events-none absolute top-3 left-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={form.college_name}
                    onChange={(e) => setForm({ ...form, college_name: e.target.value })}
                    placeholder="State University"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pr-4 pl-10 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Graduation Year
                </label>
                <div className="relative mt-1.5">
                  <Calendar className="pointer-events-none absolute top-3 left-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="number"
                    min={2020}
                    max={2035}
                    required
                    value={form.graduation_year}
                    onChange={(e) => setForm({ ...form, graduation_year: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 py-2.5 pr-4 pl-10 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Password
                </label>
                <div className="relative mt-1.5">
                  <Lock className="pointer-events-none absolute top-3 left-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min. 6 characters"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pr-10 pl-10 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-2.5 right-2.5 rounded p-1 text-slate-400 hover:text-slate-600"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Confirm Password
                </label>
                <div className="relative mt-1.5">
                  <Lock className="pointer-events-none absolute top-3 left-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={form.confirm_password}
                    onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                    placeholder="Repeat password"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pr-4 pl-10 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="gradient-brand mt-2 w-full rounded-xl py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-60"
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>

            <p className="text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
                Log in here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
