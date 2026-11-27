import { useEffect, useState } from 'react'
import { Bookmark, Briefcase, CheckCircle2, ExternalLink, MapPin, Search } from 'lucide-react'
import { apiRequest } from '../lib/api'
import { JobOpportunity } from '../types'

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobOpportunity[]>([])
  const [query, setQuery] = useState('')
  const [jobType, setJobType] = useState('all')
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (query.trim()) params.set('q', query.trim())
      if (jobType !== 'all') params.set('job_type', jobType)
      if (remoteOnly) params.set('remote', 'true')
      const data = await apiRequest<JobOpportunity[]>(`/api/jobs?${params.toString()}`)
      setJobs(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [jobType, remoteOnly])

  const handleStatusUpdate = async (jobId: number, status: 'saved' | 'applied' | 'interviewing') => {
    await apiRequest(`/api/jobs/${jobId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ status, notes: '' }),
    })
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, application_status: status } : j))
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2.5 text-2xl font-extrabold text-slate-900">
          <Briefcase className="h-6 w-6 text-indigo-600" />
          Job &amp; Internship Discovery
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Curated student internships and graduate roles scored against your SkillBridge skill profile.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-3 left-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
            placeholder="Search by role, company, or skill (e.g., React, Python, Intern)..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pr-4 pl-10 text-sm outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
          className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500"
        >
          <option value="all">All Types</option>
          <option value="internship">Internships</option>
          <option value="full_time">Full-Time New Grad</option>
        </select>

        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={remoteOnly}
            onChange={(e) => setRemoteOnly(e.target.checked)}
            className="accent-indigo-600"
          />
          Remote Only
        </label>

        <button
          type="button"
          onClick={fetchJobs}
          className="gradient-brand rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
        >
          Search
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading opportunities...</p>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          No jobs match your filters. Try broadening your search.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-200"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold uppercase text-indigo-700">
                      {job.job_type === 'internship' ? 'Internship' : 'Full-Time'}
                    </span>
                    <h2 className="mt-2 text-lg font-bold text-slate-900">{job.title}</h2>
                    <p className="text-sm font-semibold text-indigo-600">{job.company}</p>
                  </div>
                  <span className="rounded-xl bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700">
                    {job.match_score}% Match
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {job.location} {job.remote ? '(Remote)' : ''}
                  </span>
                  {job.salary_range && <span>• {job.salary_range}</span>}
                </div>

                <p className="mt-3 text-xs leading-relaxed text-slate-600">{job.description}</p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {job.required_skills.map((sk) => (
                    <span
                      key={sk}
                      className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate(job.id, 'saved')}
                    className={`inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-semibold ${
                      job.application_status === 'saved'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Bookmark className="h-3.5 w-3.5" />
                    {job.application_status === 'saved' ? 'Saved' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate(job.id, 'applied')}
                    className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold ${
                      job.application_status === 'applied'
                        ? 'bg-emerald-600 text-white'
                        : 'gradient-brand text-white'
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {job.application_status === 'applied' ? 'Applied' : 'Mark Applied'}
                  </button>
                </div>

                {job.apply_url && (
                  <a
                    href={job.apply_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
                  >
                    Role Info <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
