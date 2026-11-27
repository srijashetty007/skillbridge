from sqlalchemy.orm import Session

from app.models import ActivityLog, JobOpportunity


SEED_JOBS = [
    {
        "title": "Software Engineering Intern (Full-Stack)",
        "company": "Nebula Cloud Systems",
        "location": "San Francisco, CA",
        "job_type": "internship",
        "remote": True,
        "salary_range": "$38 - $48 / hr",
        "required_skills": ["TypeScript", "React", "Python", "FastAPI / Node.js", "SQL & Databases"],
        "description": "Build customer-facing workflow dashboards in React + TypeScript and scalable REST microservices in Python FastAPI.",
        "apply_url": "https://example.com/careers/nebula-fullstack-intern",
    },
    {
        "title": "Junior AI / ML Engineer",
        "company": "Vortex Intelligence",
        "location": "New York, NY",
        "job_type": "full_time",
        "remote": False,
        "salary_range": "$105,000 - $125,000",
        "required_skills": ["Python", "PyTorch / Scikit-Learn", "LLM & Prompt Engineering", "FastAPI Model Serving"],
        "description": "Train, evaluate, and deploy generative AI pipelines and retrieval-augmented assistants for enterprise teams.",
        "apply_url": "https://example.com/careers/vortex-junior-ml",
    },
    {
        "title": "Data Analytics Summer Intern",
        "company": "FinPulse Analytics",
        "location": "Austin, TX",
        "job_type": "internship",
        "remote": True,
        "salary_range": "$32 - $40 / hr",
        "required_skills": ["SQL", "Python (Pandas)", "Data Visualization", "Statistics & A/B Testing"],
        "description": "Partner with product managers to analyze user funnels, write SQL queries, and craft interactive executive dashboards.",
        "apply_url": "https://example.com/careers/finpulse-data-intern",
    },
    {
        "title": "Associate Product Designer (UI/UX)",
        "company": "Lumina Studio",
        "location": "Seattle, WA",
        "job_type": "full_time",
        "remote": True,
        "salary_range": "$82,000 - $98,000",
        "required_skills": ["Figma & Design Systems", "User Research & Testing", "Wireframing & Prototyping", "Accessibility (WCAG)"],
        "description": "Design intuitive SaaS interfaces, evolve our Figma component library, and run usability sessions with students.",
        "apply_url": "https://example.com/careers/lumina-product-designer",
    },
    {
        "title": "Cloud & DevOps Engineering Intern",
        "company": "Stratos Infrastructure",
        "location": "Boston, MA",
        "job_type": "internship",
        "remote": False,
        "salary_range": "$36 - $45 / hr",
        "required_skills": ["Linux & Networking", "Docker & Containers", "CI/CD Pipelines", "Cloud (AWS / GCP)"],
        "description": "Automate build pipelines, containerize microservices, and improve observability across staging clusters.",
        "apply_url": "https://example.com/careers/stratos-devops-intern",
    },
    {
        "title": "Graduate Frontend Developer",
        "company": "BrightPath EdTech",
        "location": "Chicago, IL",
        "job_type": "full_time",
        "remote": True,
        "salary_range": "$85,000 - $102,000",
        "required_skills": ["React", "TypeScript", "Git & CI/CD", "HTML & CSS Basics"],
        "description": "Craft accessible, responsive learning tools for millions of university learners using React, TypeScript, and Tailwind CSS.",
        "apply_url": "https://example.com/careers/brightpath-frontend",
    },
]


def seed_jobs_if_empty(db: Session) -> None:
    if db.query(JobOpportunity).count() == 0:
        for job_data in SEED_JOBS:
            db.add(JobOpportunity(**job_data))
        db.commit()


def log_activity(db: Session, user_id: int, action_type: str, title: str, detail: str = "") -> None:
    db.add(
        ActivityLog(
            user_id=user_id,
            action_type=action_type,
            title=title,
            detail=detail,
        )
    )
    db.commit()
