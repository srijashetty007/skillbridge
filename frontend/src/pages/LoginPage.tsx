import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, KeyRound, Lock, Mail, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../lib/api'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Forgot password state
  const [forgotOpen, setForgotOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [resetMessage, setResetMessage] = useState('')
  const [resetError, setResetError] = useState('')
  const [resetBusy, setResetBusy] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError('Please enter both your email and password.')
      return
    }
    setLoading(true)
    try {
      await login(email.trim(), password)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestReset = async (e: FormEvent) => {
    e.preventDefault()
    setResetError('')
    setResetMessage('')
    setResetBusy(true)
    try {
      const res = await apiRequest<{ message: string; reset_token: string | null }>('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: resetEmail.trim() }),
      })
      setResetMessage(res.message)
      if (res.reset_token) {
        setResetToken(res.reset_token)
      }
    } catch (err) {
      setResetError(err instanceof Error ? err.message : 'Unable to initiate password reset.')
    } finally {
      setResetBusy(false)
    }
  }

  const handleCompleteReset = async (e: FormEvent) => {
    e.preventDefault()
    setResetError('')
    if (newPassword.length < 6) {
      setResetError('New password must be at least 6 characters.')
      return
    }
    setResetBusy(true)
    try {
      const res = await apiRequest<{ message: string }>('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token: resetToken, new_password: newPassword }),
      })
      setResetMessage(res.message)
      setResetToken('')
      setNewPassword('')
      setTimeout(() => {
        setForgotOpen(false)
      }, 1500)
    } catch (err) {
      setResetError(err instanceof Error ? err.message : 'Unable to reset password.')
    } finally {
      setResetBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md">
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
              <h1 className="text-xl font-bold text-slate-950">Welcome back</h1>
              <p className="text-xs text-slate-500">Log in to your SkillBridge student account</p>
            </div>
          </div>

          {!forgotOpen ? (
            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Email Address
                </label>
                <div className="relative mt-1.5">
                  <Mail className="pointer-events-none absolute top-3 left-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@university.edu"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pr-4 pl-10 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotOpen(true)
                      setResetEmail(email)
                      setResetMessage('')
                      setResetError('')
                    }}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative mt-1.5">
                  <Lock className="pointer-events-none absolute top-3 left-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pr-11 pl-10 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-2.5 right-3 rounded-lg p-1 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="gradient-brand w-full rounded-xl py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'Log In'}
              </button>

              <p className="text-center text-sm text-slate-600">
                New to SkillBridge?{' '}
                <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700">
                  Create a student account
                </Link>
              </p>
            </form>
          ) : (
            <div className="mt-7 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <KeyRound className="h-4 w-4 text-indigo-600" />
                  Reset Password
                </h2>
                <button
                  type="button"
                  onClick={() => setForgotOpen(false)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Back to Login
                </button>
              </div>

              {resetMessage && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700">
                  {resetMessage}
                </div>
              )}
              {resetError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">
                  {resetError}
                </div>
              )}

              {!resetToken ? (
                <form onSubmit={handleRequestReset} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Registered Email
                    </label>
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="you@university.edu"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={resetBusy}
                    className="gradient-brand w-full rounded-xl py-2.5 text-sm font-semibold text-white"
                  >
                    {resetBusy ? 'Preparing reset...' : 'Request Reset Token'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleCompleteReset} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={resetBusy}
                    className="gradient-brand w-full rounded-xl py-2.5 text-sm font-semibold text-white"
                  >
                    {resetBusy ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
