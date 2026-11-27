export interface StudentProfile {
  college_name: string
  graduation_year: number
  degree: string
  major: string
  target_role: string
  bio: string
  linkedin_url: string
  github_url: string
  portfolio_url: string
}

export interface User {
  id: number
  email: string
  full_name: string
  created_at: string
  profile: StudentProfile | null
}

export interface SkillItem {
  id: number
  name: string
  category: string
  proficiency: number
  target_proficiency: number
  status: 'proficient' | 'learning' | 'gap'
  updated_at?: string
}

export interface CareerRecommendation {
  role: string
  match_score: number
  salary_entry: string
  demand: string
  key_skills: string[]
  reason: string
}

export interface CareerAssessment {
  id: number
  interests: string[]
  strengths: string[]
  work_style: string
  preferred_industries: string[]
  experience_level: string
  recommended_careers: CareerRecommendation[]
  created_at: string
}

export interface RoadmapMilestone {
  id: string
  phase: string
  title: string
  duration: string
  skills: string[]
  resources: string[]
  completed: boolean
}

export interface LearningRoadmap {
  id: number
  target_role: string
  title: string
  description: string
  milestones: RoadmapMilestone[]
  progress_pct: number
  created_at: string
  updated_at: string
}

export interface ResumeData {
  id: number
  title: string
  target_role: string
  template: string
  personal_info: {
    full_name?: string
    email?: string
    location?: string
    linkedin?: string
    github?: string
  }
  summary: string
  education: Array<{
    school: string
    degree: string
    graduation: string
    gpa?: string
  }>
  experience: Array<{
    company: string
    role: string
    period: string
    bullets: string
  }>
  projects: Array<{
    name: string
    tech: string
    description: string
  }>
  skills: string[]
  ai_feedback: string
  updated_at: string
}

export interface InterviewSession {
  id: number
  role: string
  interview_type: string
  difficulty: string
  questions: Array<{ id: string; question: string; tip: string }>
  answers: Array<{ question: string; answer: string }>
  score: number | null
  feedback: string
  status: 'in_progress' | 'completed'
  created_at: string
}

export interface JobOpportunity {
  id: number
  title: string
  company: string
  location: string
  job_type: 'internship' | 'full_time'
  remote: boolean
  salary_range: string
  required_skills: string[]
  description: string
  apply_url: string
  posted_at: string
  application_status: 'saved' | 'applied' | 'interviewing' | null
  match_score: number
}

export interface ChatMessage {
  id: number
  conversation_id: number
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface ChatConversation {
  id: number
  title: string
  created_at: string
  updated_at: string
  messages: ChatMessage[]
}

export interface ActivityItem {
  id: number
  action_type: string
  title: string
  detail: string
  created_at: string
}
