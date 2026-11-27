from typing import Any, Dict, List

ROLE_CATALOG: Dict[str, Dict[str, Any]] = {
    "Full-Stack Software Engineer": {
        "salary_entry": "$80,000 - $115,000",
        "demand": "Very High",
        "tags": ["Web Development", "Software Engineering", "Problem Solving", "Startups", "SaaS"],
        "required_skills": [
            {"name": "TypeScript", "category": "Programming", "target": 85},
            {"name": "React", "category": "Frontend", "target": 85},
            {"name": "Python", "category": "Backend", "target": 80},
            {"name": "FastAPI / Node.js", "category": "Backend", "target": 80},
            {"name": "SQL & Databases", "category": "Data", "target": 80},
            {"name": "Git & CI/CD", "category": "DevOps", "target": 75},
        ],
        "roadmap": [
            {
                "phase": "Phase 1: Foundations",
                "title": "Modern Web & TypeScript Core",
                "duration": "3 weeks",
                "skills": ["TypeScript", "HTML/CSS", "Git"],
                "resources": ["TypeScript Handbook", "MDN Web Docs", "Pro Git"],
            },
            {
                "phase": "Phase 2: Frontend Engineering",
                "title": "Component Architecture with React & Tailwind",
                "duration": "4 weeks",
                "skills": ["React", "Tailwind CSS", "State Management"],
                "resources": ["React Official Docs", "Tailwind CSS Docs"],
            },
            {
                "phase": "Phase 3: Backend & APIs",
                "title": "REST APIs, Authentication & SQL Modeling",
                "duration": "4 weeks",
                "skills": ["Python", "FastAPI", "SQL & PostgreSQL"],
                "resources": ["FastAPI Tutorial", "SQLBolt"],
            },
            {
                "phase": "Phase 4: Deployment & Portfolio",
                "title": "Testing, Docker & Production Capstone",
                "duration": "3 weeks",
                "skills": ["Docker", "Testing", "CI/CD"],
                "resources": ["Docker Getting Started", "Full-Stack Open"],
            },
        ],
    },
    "AI / Machine Learning Engineer": {
        "salary_entry": "$95,000 - $135,000",
        "demand": "Explosive",
        "tags": ["AI & Machine Learning", "Data Science", "Mathematics", "Research", "Python"],
        "required_skills": [
            {"name": "Python", "category": "Programming", "target": 90},
            {"name": "Linear Algebra & Stats", "category": "Foundations", "target": 80},
            {"name": "PyTorch / Scikit-Learn", "category": "ML Frameworks", "target": 85},
            {"name": "LLM & Prompt Engineering", "category": "Generative AI", "target": 80},
            {"name": "SQL & Data Pipelines", "category": "Data", "target": 75},
            {"name": "FastAPI Model Serving", "category": "Deployment", "target": 75},
        ],
        "roadmap": [
            {
                "phase": "Phase 1: Python & Math",
                "title": "NumPy, Pandas, Probability & Linear Algebra",
                "duration": "4 weeks",
                "skills": ["Python", "NumPy", "Statistics"],
                "resources": ["3Blue1Brown Essence of Linear Algebra", "Kaggle Learn"],
            },
            {
                "phase": "Phase 2: Classical ML",
                "title": "Supervised & Unsupervised Modeling with Scikit-Learn",
                "duration": "4 weeks",
                "skills": ["Scikit-Learn", "Feature Engineering", "Model Evaluation"],
                "resources": ["Hands-On ML", "Scikit-Learn User Guide"],
            },
            {
                "phase": "Phase 3: Deep Learning & LLMs",
                "title": "Neural Networks, Transformers & RAG Pipelines",
                "duration": "5 weeks",
                "skills": ["PyTorch", "Transformers", "Gemini API"],
                "resources": ["Fast.ai", "DeepLearning.AI Courses"],
            },
            {
                "phase": "Phase 4: MLOps & Capstone",
                "title": "Serve Models via FastAPI & Evaluate in Production",
                "duration": "3 weeks",
                "skills": ["FastAPI", "Docker", "Experiment Tracking"],
                "resources": ["Made With ML"],
            },
        ],
    },
    "Data Analyst / BI Engineer": {
        "salary_entry": "$70,000 - $95,000",
        "demand": "High",
        "tags": ["Data Analysis", "Analytics", "Business", "Visualization", "FinTech"],
        "required_skills": [
            {"name": "SQL", "category": "Data", "target": 90},
            {"name": "Python (Pandas)", "category": "Programming", "target": 80},
            {"name": "Data Visualization", "category": "BI Tools", "target": 85},
            {"name": "Statistics & A/B Testing", "category": "Analytics", "target": 80},
            {"name": "Excel / Spreadsheets", "category": "BI Tools", "target": 85},
        ],
        "roadmap": [
            {
                "phase": "Phase 1: Querying Data",
                "title": "Advanced SQL Joins, Window Functions & CTEs",
                "duration": "3 weeks",
                "skills": ["SQL", "Relational Modeling"],
                "resources": ["Mode SQL Tutorial", "DataLemur"],
            },
            {
                "phase": "Phase 2: Python Analysis",
                "title": "Data Cleaning & Exploration with Pandas",
                "duration": "3 weeks",
                "skills": ["Python", "Pandas", "Jupyter"],
                "resources": ["Kaggle Pandas Course"],
            },
            {
                "phase": "Phase 3: Storytelling & BI",
                "title": "Interactive Dashboards & KPI Design",
                "duration": "3 weeks",
                "skills": ["Tableau / Power BI", "Data Storytelling"],
                "resources": ["Storytelling with Data"],
            },
            {
                "phase": "Phase 4: Experimentation",
                "title": "Hypothesis Testing & Portfolio Case Studies",
                "duration": "3 weeks",
                "skills": ["Statistics", "A/B Testing"],
                "resources": ["StatQuest"],
            },
        ],
    },
    "Product Designer (UI/UX)": {
        "salary_entry": "$75,000 - $105,000",
        "demand": "Steady",
        "tags": ["UI/UX Design", "Creativity", "User Research", "Frontend", "Consumer Tech"],
        "required_skills": [
            {"name": "Figma & Design Systems", "category": "Design", "target": 90},
            {"name": "User Research & Testing", "category": "UX", "target": 85},
            {"name": "Wireframing & Prototyping", "category": "UX", "target": 85},
            {"name": "Accessibility (WCAG)", "category": "Design", "target": 80},
            {"name": "HTML & CSS Basics", "category": "Frontend", "target": 70},
        ],
        "roadmap": [
            {
                "phase": "Phase 1: Design Principles",
                "title": "Typography, Color Hierarchy & Visual Systems",
                "duration": "3 weeks",
                "skills": ["Visual Hierarchy", "Color Theory"],
                "resources": ["Refactoring UI", "Laws of UX"],
            },
            {
                "phase": "Phase 2: Figma Mastery",
                "title": "Auto-Layout, Components & Interactive Prototypes",
                "duration": "4 weeks",
                "skills": ["Figma", "Design Systems"],
                "resources": ["Figma Official Tutorials"],
            },
            {
                "phase": "Phase 3: UX Research",
                "title": "User Interviews, Journey Maps & Usability Testing",
                "duration": "3 weeks",
                "skills": ["User Research", "Usability Testing"],
                "resources": ["Nielsen Norman Group Articles"],
            },
            {
                "phase": "Phase 4: Case Studies",
                "title": "Build 3 End-to-End Product Case Studies",
                "duration": "4 weeks",
                "skills": ["Portfolio Storytelling", "Accessibility"],
                "resources": ["Cofolios", "Case Study Club"],
            },
        ],
    },
    "Cloud & DevOps Engineer": {
        "salary_entry": "$85,000 - $120,000",
        "demand": "High",
        "tags": ["Cloud Infrastructure", "Automation", "Security", "Linux", "Enterprise"],
        "required_skills": [
            {"name": "Linux & Networking", "category": "Systems", "target": 85},
            {"name": "Docker & Containers", "category": "DevOps", "target": 85},
            {"name": "CI/CD Pipelines", "category": "DevOps", "target": 85},
            {"name": "Cloud (AWS / GCP)", "category": "Cloud", "target": 80},
            {"name": "Terraform / IaC", "category": "Infrastructure", "target": 75},
        ],
        "roadmap": [
            {
                "phase": "Phase 1: Systems & Shell",
                "title": "Linux Administration, Bash & HTTP/DNS Networking",
                "duration": "3 weeks",
                "skills": ["Linux", "Bash", "Networking"],
                "resources": ["Linux Journey"],
            },
            {
                "phase": "Phase 2: Containers",
                "title": "Dockerfiles, Multi-Stage Builds & Compose",
                "duration": "3 weeks",
                "skills": ["Docker", "Container Security"],
                "resources": ["Docker Docs"],
            },
            {
                "phase": "Phase 3: Cloud & IaC",
                "title": "Deploy Scalable Apps on Cloud with Terraform",
                "duration": "4 weeks",
                "skills": ["AWS / GCP", "Terraform"],
                "resources": ["Cloud Skill Boost", "HashiCorp Learn"],
            },
            {
                "phase": "Phase 4: Observability",
                "title": "GitHub Actions CI/CD, Logging & Kubernetes Basics",
                "duration": "4 weeks",
                "skills": ["CI/CD", "Kubernetes", "Monitoring"],
                "resources": ["Kubernetes Basics"],
            },
        ],
    },
}


def compute_career_recommendations(
    interests: List[str],
    strengths: List[str],
    work_style: str,
    preferred_industries: List[str],
) -> List[Dict[str, Any]]:
    user_tokens = {t.lower() for t in (interests + strengths + preferred_industries + [work_style])}
    results = []
    for role_name, info in ROLE_CATALOG.items():
        role_tokens = {t.lower() for t in info["tags"]}
        overlap = sum(
            1
            for ut in user_tokens
            if any(ut in rt or rt in ut for rt in role_tokens)
        )
        base_score = 68 + min(overlap * 8, 28)
        results.append(
            {
                "role": role_name,
                "match_score": base_score,
                "salary_entry": info["salary_entry"],
                "demand": info["demand"],
                "key_skills": [s["name"] for s in info["required_skills"][:4]],
                "reason": f"Matches your interest in {', '.join(interests[:2])} and strengths in {', '.join(strengths[:2])}.",
            }
        )
    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results


def build_roadmap_milestones(target_role: str) -> List[Dict[str, Any]]:
    role_data = ROLE_CATALOG.get(target_role)
    if not role_data:
        # Match closest role or return structured generic tech roadmap
        for key, val in ROLE_CATALOG.items():
            if target_role.lower() in key.lower() or key.lower() in target_role.lower():
                role_data = val
                break

    template_phases = (
        role_data["roadmap"]
        if role_data
        else [
            {
                "phase": "Phase 1: Core Fundamentals",
                "title": f"Essential Concepts for {target_role}",
                "duration": "3 weeks",
                "skills": ["Core Principles", "Tooling Setup", "Version Control"],
                "resources": ["Official Documentation", "Interactive Labs"],
            },
            {
                "phase": "Phase 2: Practical Application",
                "title": f"Build Guided {target_role} Mini-Projects",
                "duration": "4 weeks",
                "skills": ["Project Architecture", "Debugging", "Testing"],
                "resources": ["Project-Based Tutorials", "Open Source Issues"],
            },
            {
                "phase": "Phase 3: Portfolio & Collaboration",
                "title": "Ship Capstone & Prepare Resume Case Studies",
                "duration": "4 weeks",
                "skills": ["Capstone Delivery", "Documentation", "Code Review"],
                "resources": ["GitHub Portfolio Guide"],
            },
            {
                "phase": "Phase 4: Interview Readiness",
                "title": f"Mock Interviews & {target_role} Applications",
                "duration": "3 weeks",
                "skills": ["Technical Q&A", "Behavioral STAR Stories"],
                "resources": ["SkillBridge Interview Prep"],
            },
        ]
    )

    milestones = []
    for idx, phase in enumerate(template_phases, start=1):
        milestones.append(
            {
                "id": f"m-{idx}",
                "phase": phase["phase"],
                "title": phase["title"],
                "duration": phase["duration"],
                "skills": phase["skills"],
                "resources": phase["resources"],
                "completed": False,
            }
        )
    return milestones


def get_interview_questions(role: str, interview_type: str, difficulty: str) -> List[Dict[str, Any]]:
    if interview_type == "behavioral":
        return [
            {
                "id": "q1",
                "question": f"Tell me about a challenging team or academic project related to {role}. How did you handle disagreements or blockers?",
                "tip": "Use the STAR method (Situation, Task, Action, Result) and quantify your impact.",
            },
            {
                "id": "q2",
                "question": "Describe a time you had to learn a brand-new technology or skill under a tight deadline.",
                "tip": "Highlight your learning strategy, prioritization, and final outcome.",
            },
            {
                "id": "q3",
                "question": "Tell me about a mistake or bug you introduced. How did you detect, fix, and prevent it from happening again?",
                "tip": "Show ownership, root-cause thinking, and process improvement.",
            },
        ]
    if interview_type == "system_design":
        return [
            {
                "id": "q1",
                "question": f"How would you design a scalable URL shortener or student career portal API for a {role} role?",
                "tip": "Cover requirements, data model, API endpoints, caching, and bottlenecks.",
            },
            {
                "id": "q2",
                "question": "Explain how you would design authentication, rate limiting, and database indexing for high-traffic endpoints.",
                "tip": "Discuss JWTs, token expiry, Redis/rate limits, and query index selection.",
            },
            {
                "id": "q3",
                "question": "How would you migrate an application from SQLite to PostgreSQL with zero or minimal downtime?",
                "tip": "Mention schema parity, connection pooling, data migration, and verification.",
            },
        ]
    return [
        {
            "id": "q1",
            "question": f"[{difficulty.title()}] Explain the core principles and trade-offs you consider when building production features as a {role}.",
            "tip": "Structure your answer around maintainability, performance, and reliability.",
        },
        {
            "id": "q2",
            "question": "Walk through how you debug a slow API endpoint or UI rendering bottleneck end-to-end.",
            "tip": "Mention profiling, network/SQL inspection, and targeted fixes.",
        },
        {
            "id": "q3",
            "question": "Compare REST APIs, state management strategies, and automated testing approaches in modern web apps.",
            "tip": "Give concrete examples from projects you have built.",
        },
    ]


def evaluate_interview_answers(answers: List[Dict[str, str]]) -> Dict[str, Any]:
    if not answers:
        return {"score": 0, "feedback": "No answers were submitted."}

    total_score = 0
    item_feedback = []
    for idx, item in enumerate(answers, start=1):
        ans = (item.get("answer") or "").strip()
        word_count = len(ans.split())
        if word_count >= 45:
            pts = 92
            note = "Strong, detailed explanation with solid structure."
        elif word_count >= 20:
            pts = 78
            note = "Good foundation; add concrete metrics, examples, or trade-offs to stand out."
        elif word_count >= 5:
            pts = 58
            note = "Too brief. Expand with context, technical specifics, and measurable outcomes."
        else:
            pts = 30
            note = "Incomplete response. Aim for 3-5 clear sentences covering context and action."
        total_score += pts
        item_feedback.append(f"Q{idx}: {note} ({word_count} words)")

    avg_score = round(total_score / len(answers))
    summary = (
        f"Overall Score: {avg_score}/100.\n"
        + "\n".join(item_feedback)
        + "\nTip: Pair technical specifics with measurable outcomes (latency, users served, test coverage)."
    )
    return {"score": avg_score, "feedback": summary}
