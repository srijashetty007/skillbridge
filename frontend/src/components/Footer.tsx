import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="gradient-brand flex h-9 w-9 items-center justify-center rounded-xl text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-white">
                Skill<span className="text-indigo-400">Bridge</span>
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
              Empowering college students and fresh graduates to bridge the gap between campus learning and high-impact tech careers.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Platform</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#features" className="hover:text-white">Career Assessment</a></li>
              <li><a href="#features" className="hover:text-white">Skill Gap Analyzer</a></li>
              <li><a href="#features" className="hover:text-white">Learning Roadmaps</a></li>
              <li><a href="#features" className="hover:text-white">AI Resume Builder</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Get Started</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link to="/signup" className="hover:text-white">Create Student Account</Link></li>
              <li><Link to="/login" className="hover:text-white">Student Login</Link></li>
              <li><a href="#about" className="hover:text-white">About SkillBridge</a></li>
              <li><a href="#contact" className="hover:text-white">Contact Support</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} SkillBridge. Built for students and graduates.</p>
          <p>Powered by FastAPI, React &amp; Gemini AI</p>
        </div>
      </div>
    </footer>
  )
}
