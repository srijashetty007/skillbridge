import { FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Compass, Sparkles, TrendingUp } from 'lucide-react'
import { apiRequest } from '../lib/api'
import { CareerAssessment } from '../types'

const INTEREST_OPTIONS = [
  'Web Development',
  'AI & Machine Learning',
  'Data Science',
  'UI/UX Design',
  'Cloud Infrastructure',
  'Mobile Apps',
  'Security',
]

const STRENGTH_OPTIONS = [
  'Problem Solving',
  'Mathematics',
  'Creativity',
  'Analytics',
  'Automation',
  'User Research',
  'Python',
]

const INDUSTRY_OPTIONS = ['SaaS', 'FinTech', 'EdTech', 'AI Research', 'Consumer Tech', 'Enterprise']

export default function CareerAssessmentPage() {
  const [interests, setInterests] = useState<string[]>(['Web Development', 'Problem Solving'])
  const [strengths, setStrengths] = useState<string[]>(['Problem Solving'])
  const [workStyle, setWorkStyle] = useState('Collaborative')
  const [industries, setIndustries] = useState<string[]>(['SaaS'])
  const [experienceLevel, setExperienceLevel] = useState('Beginner')

  const [history, setHistory] = useState<CareerAssessment[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest<CareerAssessment[]>('/api/careers/assessments')
      .then(setHistory)
      .catch(() => {})
  }, [])

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item])
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (interests.length === 0 || strengths.length === 0) {
      setError('Select at least one interest and one strength.')
      return
    }
    setSubmitting(true)
    try {
      const created = await apiRequest<CareerAssessment>('/api/careers/assessments', {
        method: 'POST',
        body: JSON.stringify({
          interests,
          strengths,
          work_style: workStyle,
          preferred_industries: industries,
          experience_level: experienceLevel,
        }),
      })
      setHistory((prev) => [created, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit assessment.')
    } finally {
      setSubmitting(false)
    }
  }

  const latest = history[0]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2.5 text-2xl font-extrabold text-slate-900">
          <Compass className="h-6 w-6 text-indigo-600" />
          Career Assessment
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Discover high-fit tech roles matched to your interests, strengths, and preferred work style.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-6"
        >
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
              1. Technical &amp; Career Interests
            </label>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((item) => {
                const active = interests.includes(item)
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleItem(interests, setInterests, item)}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                      active
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {item}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
              2. Top Strengths
            </label>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {STRENGTH_OPTIONS.map((item) => {
                const active = strengths.includes(item)
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleItem(strengths, setStrengths, item)}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                      active
                        ? 'border-violet-600 bg-violet-50 text-violet-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {item}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
                3. Work Style
              </label>
              <select
                value={workStyle}
                onChange={(e) => setWorkStyle(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
              >
                <option value="Collaborative">Collaborative Team Builder</option>
                <option value="Analytical">Deep Analytical Focus</option>
                <option value="Creative">Creative &amp; Visual</option>
                <option value="Independent">Independent Ownership</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
                4. Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
              >
                <option value="Beginner">Beginner / Coursework</option>
                <option value="Intermediate">Intermediate / Side Projects</option>
                <option value="Internship Ready">Internship Ready</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
              5. Preferred Industries
            </label>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {INDUSTRY_OPTIONS.map((item) => {
                const active = industries.includes(item)
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleItem(industries, setIndustries, item)}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                      active
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {item}
                  </button>
                )
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="gradient-brand inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" />
            {submitting ? 'Analyzing Matches...' : 'Generate Career Matches'}
          </button>
        </form>

        {/* Results Panel */}
        <div className="space-y-4 lg:col-span-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              {latest ? 'Your Matched Career Paths' : 'Complete the Assessment to See Matches'}
            </h2>

            {latest ? (
              <div className="mt-4 space-y-3.5">
                {latest.recommended_careers.map((rec, idx) => (
                  <div
                    key={rec.role}
                    className={`rounded-2xl border p-4 ${
                      idx === 0 ? 'border-indigo-200 bg-indigo-50/50' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {idx === 0 && <CheckCircle2 className="h-4 w-4 text-indigo-600" />}
                        <h3 className="text-sm font-bold text-slate-900">{rec.role}</h3>
                      </div>
                      <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-bold text-white">
                        {rec.match_score}% Match
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Entry Salary: {rec.salary_entry} • Demand: {rec.demand}
                    </p>
                    <p className="mt-2 text-xs text-slate-700">{rec.reason}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {rec.key_skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex gap-3 pt-2">
                  <Link
                    to="/dashboard/skill-gap"
                    className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                  >
                    Analyze Skill Gaps
                  </Link>
                  <Link
                    to="/dashboard/roadmap"
                    className="gradient-brand rounded-xl px-4 py-2 text-xs font-semibold text-white"
                  >
                    Build Learning Roadmap
                  </Link>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                Select your interests and strengths on the left and click &ldquo;Generate Career Matches&rdquo;.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
