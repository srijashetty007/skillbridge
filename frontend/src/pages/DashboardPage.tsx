import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  Award,
  Briefcase,
  CheckCircle2,
  Compass,
  GraduationCap,
  Map,
  Target,
} from 'lucide-react'
import { apiRequest } from '../lib/api'
import {
  ActivityItem,
  CareerRecommendation,
  RoadmapMilestone,
  SkillItem,
  User,
} from '../types'

interface OverviewData {
  user: User
  stats: {
    total_skills: number
    proficient_skills: number
    avg_skill_progress: number
    resumes_count: number
    interviews_count: number
    saved_jobs_count: number
    active_roadmaps: number
  }
  skills: SkillItem[]
  recommended_careers: CareerRecommendation[]
  active_roadmap: {
    id: number
    title: string
    target_role: string
    progress_pct: number
    milestones: RoadmapMilestone[]
  } | null
  recent_activities: ActivityItem[]
}

export default function DashboardPage() {
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest<OverviewData>('/api/dashboard/overview')
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load dashboard.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        {error || 'Dashboard could not be loaded.'}
      </div>
    )
  }

  const { user, stats, skills, recommended_careers, active_roadmap, recent_activities } = data

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="gradient-brand rounded-3xl p-6 text-white shadow-lg shadow-indigo-500/15 sm:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-100">
              Student Career Workspace
            </p>
            <h1 className="mt-1.5 text-2xl font-extrabold sm:text-3xl">
              Welcome back, {user.full_name.split(' ')[0]}!
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-indigo-100">
              {user.profile?.college_name || 'University Student'} • Class of{' '}
              {user.profile?.graduation_year || 2027} • Aiming for{' '}
              <span className="font-semibold text-white">{user.profile?.target_role}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/dashboard/career-assessment"
              className="rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-indigo-700 shadow-sm transition hover:bg-indigo-50"
            >
              Take Career Assessment
            </Link>
            <Link
              to="/dashboard/roadmap"
              className="rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/20"
            >
              View Roadmap
            </Link>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Skill Readiness
            </span>
            <Target className="h-5 w-5 text-indigo-600" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{stats.avg_skill_progress}%</p>
          <p className="mt-1 text-xs text-slate-500">
            {stats.proficient_skills} of {stats.total_skills} skills proficient
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Roadmaps
            </span>
            <Map className="h-5 w-5 text-violet-600" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{stats.active_roadmaps}</p>
          <p className="mt-1 text-xs text-slate-500">
            {active_roadmap ? `${active_roadmap.progress_pct}% active progress` : 'Generate your first roadmap'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Interviews &amp; Resumes
            </span>
            <Award className="h-5 w-5 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">
            {stats.interviews_count + stats.resumes_count}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {stats.resumes_count} resumes • {stats.interviews_count} mock interviews
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Tracked Jobs
            </span>
            <Briefcase className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{stats.saved_jobs_count}</p>
          <p className="mt-1 text-xs text-slate-500">Saved &amp; applied opportunities</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Career Recommendations */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-7">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <Compass className="h-5 w-5 text-indigo-600" />
              Top Career Recommendations
            </h2>
            <Link
              to="/dashboard/career-assessment"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Assess again <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {recommended_careers.slice(0, 3).map((rec) => (
              <div
                key={rec.role}
                className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-indigo-200"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{rec.role}</h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Entry Salary: {rec.salary_entry} • Demand: {rec.demand}
                    </p>
                  </div>
                  <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                    {rec.match_score}% Match
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-600">{rec.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Student Profile Summary */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <GraduationCap className="h-5 w-5 text-violet-600" />
              Student Profile
            </h2>
            <Link
              to="/dashboard/settings"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Edit Profile
            </Link>
          </div>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">College</span>
              <span className="font-semibold text-slate-900">{user.profile?.college_name}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Degree / Major</span>
              <span className="font-semibold text-slate-900">
                {user.profile?.degree} • {user.profile?.major}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Graduation</span>
              <span className="font-semibold text-slate-900">Class of {user.profile?.graduation_year}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Target Role</span>
              <span className="font-semibold text-indigo-600">{user.profile?.target_role}</span>
            </div>
            <p className="pt-1 text-xs leading-relaxed text-slate-600">
              {user.profile?.bio || 'Add a short career bio in Profile & Settings.'}
            </p>
          </div>
        </div>

        {/* Skill Progress */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <Target className="h-5 w-5 text-blue-600" />
              Skill Progress
            </h2>
            <Link
              to="/dashboard/skill-gap"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Analyze gaps <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4 space-y-3.5">
            {skills.slice(0, 5).map((skill) => (
              <div key={skill.id}>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800">{skill.name}</span>
                  <span className="text-slate-500">
                    {skill.proficiency}% / {skill.target_proficiency}%
                  </span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 transition-all"
                    style={{ width: `${skill.proficiency}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Roadmap + Recent Activities */}
        <div className="space-y-6 lg:col-span-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                <Map className="h-5 w-5 text-violet-600" />
                Learning Roadmap
              </h2>
              <Link
                to="/dashboard/roadmap"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Open Roadmap
              </Link>
            </div>

            {active_roadmap ? (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800">{active_roadmap.title}</span>
                  <span className="text-indigo-600">{active_roadmap.progress_pct}% complete</span>
                </div>
                <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600"
                    style={{ width: `${active_roadmap.progress_pct}%` }}
                  />
                </div>
                <div className="mt-3 space-y-1.5">
                  {active_roadmap.milestones.slice(0, 3).map((m) => (
                    <div key={m.id} className="flex items-center gap-2 text-xs text-slate-600">
                      <CheckCircle2
                        className={`h-4 w-4 shrink-0 ${
                          m.completed ? 'text-emerald-500' : 'text-slate-300'
                        }`}
                      />
                      <span className={m.completed ? 'line-through text-slate-400' : ''}>
                        {m.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
                You haven&apos;t generated a learning roadmap yet.{' '}
                <Link to="/dashboard/roadmap" className="font-semibold text-indigo-600 underline">
                  Generate one now
                </Link>
                .
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <Activity className="h-5 w-5 text-indigo-600" />
              Recent Activities
            </h2>
            <div className="mt-3 space-y-2.5">
              {recent_activities.length === 0 ? (
                <p className="text-xs text-slate-500">No recent activities yet.</p>
              ) : (
                recent_activities.slice(0, 5).map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2 text-xs last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">{act.title}</p>
                      {act.detail && <p className="text-slate-500">{act.detail}</p>}
                    </div>
                    <span className="shrink-0 text-[11px] text-slate-400">
                      {new Date(act.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
