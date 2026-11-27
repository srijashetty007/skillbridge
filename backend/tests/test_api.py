import os
import sys

# Ensure backend root is on sys.path and use an isolated test database
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TEST_DB_FILE = "test_skillbridge.db"
os.environ["DATABASE_URL"] = f"sqlite:///./{TEST_DB_FILE}"

from fastapi.testclient import TestClient
from app.main import app


def run_e2e_checks():
    if os.path.exists(TEST_DB_FILE):
        os.remove(TEST_DB_FILE)

    with TestClient(app) as client:
        # 1. Health & Chat Status
        r = client.get("/api/health")
        assert r.status_code == 200, r.text
        assert r.json()["status"] == "ok"

        r = client.get("/api/chat/status")
        assert r.status_code == 200, r.text
        assert r.json()["configured"] is False

        # 2. Contact Form
        r = client.post(
            "/api/contact",
            json={
                "name": "Test Student",
                "email": "contact@university.edu",
                "subject": "Inquiry",
                "message": "Interested in SkillBridge for our CS club.",
            },
        )
        assert r.status_code == 201, r.text

        # 3. Signup & Login
        signup_res = client.post(
            "/api/auth/signup",
            json={
                "full_name": "Jordan Lee",
                "email": "jordan@university.edu",
                "password": "password123",
                "confirm_password": "password123",
                "college_name": "Metro Tech University",
                "graduation_year": 2027,
            },
        )
        assert signup_res.status_code == 201, signup_res.text
        token = signup_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        login_res = client.post(
            "/api/auth/login",
            json={"email": "jordan@university.edu", "password": "password123"},
        )
        assert login_res.status_code == 200, login_res.text

        # 4. Dashboard Overview & Profile Update
        dash = client.get("/api/dashboard/overview", headers=headers)
        assert dash.status_code == 200, dash.text
        assert dash.json()["user"]["full_name"] == "Jordan Lee"

        prof = client.put(
            "/api/dashboard/profile",
            headers=headers,
            json={"major": "Computer Engineering", "target_role": "AI / Machine Learning Engineer"},
        )
        assert prof.status_code == 200, prof.text
        assert prof.json()["profile"]["major"] == "Computer Engineering"

        # 5. Career Assessment
        assess = client.post(
            "/api/careers/assessments",
            headers=headers,
            json={
                "interests": ["AI & Machine Learning", "Python"],
                "strengths": ["Mathematics", "Problem Solving"],
                "work_style": "Analytical",
                "preferred_industries": ["AI Research"],
                "experience_level": "Intermediate",
            },
        )
        assert assess.status_code == 200, assess.text
        assert len(assess.json()["recommended_careers"]) >= 3

        # 6. Skills & Gap Analyzer
        sk = client.post(
            "/api/skills",
            headers=headers,
            json={"name": "PyTorch / Scikit-Learn", "category": "ML Frameworks", "proficiency": 70, "target_proficiency": 85},
        )
        assert sk.status_code == 200, sk.text

        gap = client.post(
            "/api/skills/analyze-gap",
            headers=headers,
            json={"target_role": "AI / Machine Learning Engineer"},
        )
        assert gap.status_code == 200, gap.text
        assert "readiness_score" in gap.json()

        # 7. Learning Roadmap
        rm = client.post(
            "/api/roadmaps/generate",
            headers=headers,
            json={"target_role": "AI / Machine Learning Engineer", "weekly_hours": 15},
        )
        assert rm.status_code == 200, rm.text
        rm_id = rm.json()["id"]
        first_m_id = rm.json()["milestones"][0]["id"]

        rm_toggle = client.patch(
            f"/api/roadmaps/{rm_id}/milestones",
            headers=headers,
            json={"milestone_id": first_m_id, "completed": True},
        )
        assert rm_toggle.status_code == 200, rm_toggle.text
        assert rm_toggle.json()["progress_pct"] == 25

        # 8. Resumes
        res_list = client.get("/api/resumes", headers=headers)
        assert res_list.status_code == 200 and len(res_list.json()) >= 1
        resume_id = res_list.json()[0]["id"]

        ai_rev = client.post(f"/api/resumes/{resume_id}/ai-review", headers=headers)
        assert ai_rev.status_code == 503, ai_rev.text  # Honest error when GEMINI_API_KEY missing

        # 9. Interviews
        iv_start = client.post(
            "/api/interviews/start",
            headers=headers,
            json={"role": "AI / Machine Learning Engineer", "interview_type": "technical", "difficulty": "entry"},
        )
        assert iv_start.status_code == 200, iv_start.text
        iv_id = iv_start.json()["id"]

        iv_sub = client.post(
            f"/api/interviews/{iv_id}/submit",
            headers=headers,
            json={
                "answers": [
                    {
                        "question": iv_start.json()["questions"][0]["question"],
                        "answer": "I focus on modular architecture, input validation, automated tests, and monitoring latency metrics across endpoints to ensure production reliability.",
                    }
                ]
            },
        )
        assert iv_sub.status_code == 200, iv_sub.text
        assert iv_sub.json()["status"] == "completed"

        # 10. Jobs
        jobs_res = client.get("/api/jobs?job_type=internship", headers=headers)
        assert jobs_res.status_code == 200 and len(jobs_res.json()) >= 1
        job_id = jobs_res.json()[0]["id"]

        apply_res = client.post(
            f"/api/jobs/{job_id}/apply",
            headers=headers,
            json={"status": "applied", "notes": "Applied via portal"},
        )
        assert apply_res.status_code == 200, apply_res.text

        # 11. Chat validation & unconfigured check + mocked Gemini flow
        empty_chat = client.post(
            "/api/chat",
            headers=headers,
            json={"message": "   "},
        )
        assert empty_chat.status_code == 400, empty_chat.text

        chat_res = client.post(
            "/api/chat",
            headers=headers,
            json={"message": "What should I learn next?"},
        )
        assert chat_res.status_code == 503, chat_res.text

        from unittest.mock import MagicMock, patch
        mock_response = MagicMock()
        mock_response.text = "Focus on PyTorch, FastAPI model serving, and SQL fundamentals."
        with patch("app.services.ai_service.get_gemini_config", return_value=("AIzaTestMockKey123456", "gemini-2.5-flash")), \
             patch("app.services.ai_service.genai.Client") as mock_client_cls:
            mock_client_cls.return_value.models.generate_content.return_value = mock_response
            live_chat = client.post(
                "/api/chat",
                headers=headers,
                json={"message": "What should I learn next?"},
            )
            assert live_chat.status_code == 200, live_chat.text
            chat_data = live_chat.json()
            assert chat_data["reply"] == mock_response.text
            assert len(chat_data["messages"]) == 2
            conv_id = chat_data["id"]

            # Clear messages inside conversation
            cleared = client.delete(f"/api/chat/conversations/{conv_id}/messages", headers=headers)
            assert cleared.status_code == 200, cleared.text
            assert cleared.json()["messages"] == []

            # Delete conversation
            deleted = client.delete(f"/api/chat/conversations/{conv_id}", headers=headers)
            assert deleted.status_code == 200, deleted.text

        # 12. Forgot / Reset Password
        fp = client.post("/api/auth/forgot-password", json={"email": "jordan@university.edu"})
        assert fp.status_code == 200 and fp.json()["reset_token"]
        rp = client.post(
            "/api/auth/reset-password",
            json={"token": fp.json()["reset_token"], "new_password": "newpassword123"},
        )
        assert rp.status_code == 200, rp.text

        login_new = client.post(
            "/api/auth/login",
            json={"email": "jordan@university.edu", "password": "newpassword123"},
        )
        assert login_new.status_code == 200, login_new.text

    print("ALL BACKEND E2E CHECKS PASSED!")
    from app.database import engine
    engine.dispose()
    if os.path.exists(TEST_DB_FILE):
        os.remove(TEST_DB_FILE)


if __name__ == "__main__":
    run_e2e_checks()
