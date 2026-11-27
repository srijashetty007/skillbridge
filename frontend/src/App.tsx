import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/DashboardLayout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import CareerAssessmentPage from './pages/CareerAssessmentPage'
import SkillGapPage from './pages/SkillGapPage'
import RoadmapPage from './pages/RoadmapPage'
import ResumeBuilderPage from './pages/ResumeBuilderPage'
import InterviewPrepPage from './pages/InterviewPrepPage'
import JobsPage from './pages/JobsPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="career-assessment" element={<CareerAssessmentPage />} />
            <Route path="skill-gap" element={<SkillGapPage />} />
            <Route path="roadmap" element={<RoadmapPage />} />
            <Route path="resume" element={<ResumeBuilderPage />} />
            <Route path="interviews" element={<InterviewPrepPage />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
