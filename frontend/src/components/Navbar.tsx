import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, Sparkles, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="gradient-brand flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm shadow-indigo-500/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Skill<span className="text-indigo-600">Bridge</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm font-medium text-slate-600 transition hover:text-indigo-600">
            Features
          </a>
          <a href="#about" className="text-sm font-medium text-slate-600 transition hover:text-indigo-600">
            About
          </a>
          <a href="#contact" className="text-sm font-medium text-slate-600 transition hover:text-indigo-600">
            Contact
          </a>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Link
              to="/dashboard"
              className="gradient-brand rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="gradient-brand rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/25 transition hover:opacity-95"
              >
                Get Started Free
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <a href="#features" onClick={() => setOpen(false)} className="text-sm font-medium text-slate-700">
              Features
            </a>
            <a href="#about" onClick={() => setOpen(false)} className="text-sm font-medium text-slate-700">
              About
            </a>
            <a href="#contact" onClick={() => setOpen(false)} className="text-sm font-medium text-slate-700">
              Contact
            </a>
            <hr className="border-slate-100" />
            {user ? (
              <Link
                to="/dashboard"
                className="gradient-brand rounded-xl px-4 py-2.5 text-center text-sm font-semibold text-white"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="rounded-xl border border-slate-200 px-4 py-2 text-center text-sm font-semibold text-slate-700">
                  Log In
                </Link>
                <Link to="/signup" className="gradient-brand rounded-xl px-4 py-2 text-center text-sm font-semibold text-white">
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
