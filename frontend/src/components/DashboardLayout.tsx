import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Briefcase,
  Compass,
  FileText,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  MessageSquareCode,
  Settings,
  Sparkles,
  Target,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import SkillBridgeChatbot from './SkillBridgeChatbot'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/dashboard/career-assessment', label: 'Career Assessment', icon: Compass },
  { to: '/dashboard/skill-gap', label: 'Skill Gap Analyzer', icon: Target },
  { to: '/dashboard/roadmap', label: 'Learning Roadmap', icon: Map },
  { to: '/dashboard/resume', label: 'AI Resume Builder', icon: FileText },
  { to: '/dashboard/interviews', label: 'Interview Prep', icon: MessageSquareCode },
  { to: '/dashboard/jobs', label: 'Jobs & Internships', icon: Briefcase },
  { to: '/dashboard/settings', label: 'Profile & Settings', icon: Settings },
]

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`no-print fixed inset-y-0 left-0 z-40 flex w-68 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="gradient-brand flex h-9 w-9 items-center justify-center rounded-xl text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-slate-900">
              Skill<span className="text-indigo-600">Bridge</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'gradient-brand text-white shadow-sm shadow-indigo-500/20'
                      : 'text-slate-600 hover:bg-indigo-50/70 hover:text-indigo-700'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="mb-3 rounded-2xl bg-slate-50 p-3">
            <p className="truncate text-sm font-semibold text-slate-900">{user?.full_name}</p>
            <p className="truncate text-xs text-slate-500">
              {user?.profile?.college_name || 'Student'} • {user?.profile?.graduation_year || 2027}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-md lg:px-8">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden lg:block">
            <p className="text-xs font-medium text-slate-500">
              Target Career:{' '}
              <span className="font-semibold text-indigo-600">
                {user?.profile?.target_role || 'Full-Stack Software Engineer'}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard/settings"
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pr-3.5 pl-2 text-xs font-semibold text-slate-700 hover:border-indigo-200"
            >
              <span className="gradient-brand flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white">
                {user?.full_name?.charAt(0).toUpperCase() || 'S'}
              </span>
              <span>{user?.full_name}</span>
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      <SkillBridgeChatbot />
    </div>
  )
}
