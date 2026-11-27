import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bot,
  Briefcase,
  CheckCircle2,
  Compass,
  FileText,
  GraduationCap,
  Layers,
  Map,
  MessageSquareCode,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { apiRequest } from '../lib/api'

const features = [
  {
    icon: Compass,
    title: 'AI Career Assessment',
    description:
      'Answer quick questions about your strengths, interests, and work style to uncover matched tech roles and entry salaries.',
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    icon: Target,
    title: 'Skill Gap Analyzer',
    description:
      'Compare your current proficiencies against real industry requirements and see exact readiness percentages per role.',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    icon: Map,
    title: 'Personalized Roadmaps',
    description:
      'Follow structured multi-phase learning plans with curated resources and interactive milestone tracking.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: FileText,
    title: 'AI Resume Builder',
    description:
      'Craft clean, ATS-friendly student resumes with live preview, print export, and Gemini-powered bullet critiques.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: MessageSquareCode,
    title: 'Interview Preparation',
    description:
      'Practice technical, behavioral, and system design questions tailored to your target role with instant structured feedback.',
    color: 'bg-sky-50 text-sky-600',
  },
  {
    icon: Briefcase,
    title: 'Job & Internship Discovery',
    description:
      'Browse internships and graduate roles scored against your skills, and track applications in one place.',
    color: 'bg-indigo-50 text-indigo-600',
  },
]

export default function LandingPage() {
  const [contact, setContact] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [contactFeedback, setContactFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleContactSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setContactFeedback(null)

    if (!contact.name.trim() || !contact.email.trim() || !contact.subject.trim() || contact.message.trim().length < 5) {
      setContactFeedback({ type: 'error', text: 'Please fill out all fields (message at least 5 characters).' })
      return
    }

    setSubmitting(true)
    try {
      const res = await apiRequest<{ message: string }>('/api/contact', {
        method: 'POST',
        body: JSON.stringify(contact),
      })
      setContactFeedback({ type: 'success', text: res.message })
      setContact({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      setContactFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Unable to send message right now.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 via-white to-white pt-16 pb-24">
        <div className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-purple-200/40 blur-3xl" />
        <div className="pointer-events-none absolute top-32 -left-24 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-700">
              <Sparkles className="h-3.5 w-3.5" />
              Built for College Students &amp; Fresh Graduates
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Turn Campus Potential Into{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 bg-clip-text text-transparent">
                Career Readiness
              </span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-slate-600">
              SkillBridge combines career discovery, skill gap analytics, personalized learning roadmaps, resume building, interview prep, and <strong>SkillBridge AI</strong> in one student workspace.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/signup"
                className="gradient-brand inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:opacity-95"
              >
                Start Free Today
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-700"
              >
                Student Login
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-indigo-600" /> Free student workspace
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-blue-600" /> Real progress tracking
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Bot className="h-4 w-4 text-violet-600" /> Gemini AI mentor
              </span>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xl shadow-indigo-900/10">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="gradient-brand flex h-10 w-10 items-center justify-center rounded-xl text-white">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Student Career Snapshot</p>
                    <p className="text-xs text-slate-500">Target: Full-Stack Software Engineer</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  92% Career Match
                </span>
              </div>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>TypeScript &amp; React</span>
                    <span className="text-indigo-600">85% Ready</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full w-[85%] rounded-full bg-gradient-to-r from-indigo-600 to-blue-500" />
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>Python FastAPI &amp; SQL</span>
                    <span className="text-violet-600">72% In Progress</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-violet-600 to-indigo-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3.5">
                    <p className="text-xs font-medium text-indigo-700">Active Roadmap</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">3 / 4 Phases</p>
                  </div>
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-3.5">
                    <p className="text-xs font-medium text-blue-700">Matched Internships</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">6 Curated Roles</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t border-slate-100 bg-slate-50/70 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              Everything You Need
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Six Career Modules, One Unified Workspace
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Move systematically from figuring out what role fits you best to landing internships and full-time graduate offers.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feat) => {
              const Icon = feat.icon
              return (
                <div
                  key={feat.title}
                  className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                >
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${feat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-slate-900">{feat.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{feat.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-6">
            <div className="gradient-brand rounded-3xl p-8 text-white shadow-xl">
              <Layers className="h-8 w-8 text-indigo-200" />
              <h3 className="mt-5 text-2xl font-bold">Why Students Love SkillBridge</h3>
              <p className="mt-3 text-sm leading-relaxed text-indigo-100">
                University coursework teaches theory, while hiring teams look for applied skills, crisp resumes, and confident technical storytelling. SkillBridge connects those two worlds.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/20 pt-6">
                <div>
                  <p className="text-2xl font-extrabold">5+</p>
                  <p className="text-xs text-indigo-100">Tech Career Tracks</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold">100%</p>
                  <p className="text-xs text-indigo-100">Synced Progress</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold">24/7</p>
                  <p className="text-xs text-indigo-100">AI Career Mentor</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <span className="text-xs font-bold uppercase tracking-widest text-violet-600">
              About SkillBridge
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Designed Specifically for Early-Career Talent
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Whether you are a sophomore exploring software engineering, a junior preparing for summer internships, or a graduating senior polishing your portfolio, SkillBridge keeps every step measurable.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
                <span>Identify exact technical skill gaps before applying to roles.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
                <span>Store multiple targeted resumes and interview practice scores in your profile.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
                <span>Chat anytime with SkillBridge AI powered by Google Gemini for tailored mentorship.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="border-t border-slate-100 bg-slate-50/70 py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
              Contact Us
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">
              Questions or University Partnerships?
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Send us a message and we will get back to you shortly.
            </p>
          </div>

          <form
            onSubmit={handleContactSubmit}
            className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          >
            {contactFeedback && (
              <div
                className={`mb-6 rounded-xl px-4 py-3 text-sm font-medium ${
                  contactFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {contactFeedback.text}
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={contact.name}
                  onChange={(e) => setContact({ ...contact, name: e.target.value })}
                  placeholder="Alex Rivera"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  placeholder="alex@university.edu"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Subject
              </label>
              <input
                type="text"
                required
                value={contact.subject}
                onChange={(e) => setContact({ ...contact, subject: e.target.value })}
                placeholder="Career coaching or campus access inquiry"
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="mt-5">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Message
              </label>
              <textarea
                rows={4}
                required
                value={contact.message}
                onChange={(e) => setContact({ ...contact, message: e.target.value })}
                placeholder="Tell us how we can help..."
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="gradient-brand mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  )
}
