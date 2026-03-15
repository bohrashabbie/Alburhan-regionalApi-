# Alburhan Regional Platform

A full-stack platform for managing Alburhan Regional Co. data. The backend is a FastAPI service with PostgreSQL via SQLAlchemy, and the frontend is a Next.js dashboard powered by Material UI.

## Project Structure

```text
.
├── main.py                  # FastAPI entry point
├── init_db.py               # Utility for initializing database tables
├── requirements.txt         # Backend dependencies
├── src/
│   ├── connections/         # Database configuration
│   ├── models/              # SQLAlchemy models
│   ├── routers/             # API routers (banners, branches, etc.)
│   └── schemas/             # Pydantic schemas & responses
└── frontend-next/
    ├── app/                 # Next.js app router pages
    ├── public/              # Static assets (logos, icons)
    └── theme/               # Shared theme registry
```

## Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL 13+ (or any DB compatible with SQLAlchemy URI in `.env`)

---

## Backend (FastAPI)

1. **Install dependencies**
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   pip install -r requirements.txt
   ```

2. **Configure environment**
   - Copy `.env.example` (if provided) to `.env`.
   - Set `DATABASE_URL`, JWT secrets, etc.

3. **Initialize database (optional)**
   ```bash
   python init_db.py
   ```

4. **Run the API**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

5. **API Documentation**
   - Interactive docs: <http://127.0.0.1:8000/docs>
   - Media uploads served from `/media`.

### Available Routers
- `/api/banners`
- `/api/branches`
- `/api/countries`
- `/api/project-categories`
- `/api/project-images`
- `/api/projects`
- `/api/auth`
- `/api/users`

Each router wraps CRUD endpoints returning the shared `ApiResult` envelope.

---

## Frontend (Next.js Dashboard)

1. **Install dependencies**
   ```bash
   cd frontend-next
   npm install
   ```

2. **Environment variables**
   - Create `frontend-next/.env.local` if needed.
   - Configure `NEXT_PUBLIC_API_BASE` if you don’t use the default `http://localhost:8000/api` assumption.

3. **Run dev server**
   ```bash
   npm run dev
   ```
   App runs on <http://localhost:3000> (Next.js picks another port if 3000 is busy).

4. **Build for production**
   ```bash
   npm run build
   npm run start
   ```

### Frontend Highlights
- Material UI 7 with a cohesive theme (`theme/theme.ts`).
- Dashboard layout under `app/dashboard/layout.tsx` with responsive drawer + theme toggle.
- Feature pages for banners, branches, countries, categories, projects, images, and users.
- Shared context for theme switching (`context/ThemeContext.tsx`).

---

## Useful Commands

| Task                    | Command                                  |
|-------------------------|-------------------------------------------|
| Lint frontend           | `cd frontend-next && npm run lint`        |
| Check backend deps      | `pip list` (within virtualenv)            |
| Run FastAPI             | `uvicorn main:app --reload`               |
| Run Next dev            | `cd frontend-next && npm run dev`        |

---

## Deployment Notes

- **Backend**: containerize with Uvicorn/Gunicorn or deploy to services like Azure App Service, AWS ECS, etc. Ensure `DATABASE_URL` and secrets are configured.
- **Frontend**: `npm run build` artifacts can be hosted on Vercel, Netlify, or any static host supporting Next.js SSR (if needed).
- Remember to allow CORS for the frontend origin with `CORSMiddleware` settings in `main.py`.

---

## Contributing

1. Fork the repo & create a branch (`feature/my-change`).
2. Follow existing code style (black/flake8 for backend, ESLint/Prettier for frontend).
3. Add tests or manual verification steps where possible.
4. Submit a PR describing changes, screenshots, and testing steps.

---

## Troubleshooting

- **Port conflicts**: Next.js automatically switches ports (logged in terminal). FastAPI requires you to specify a free port via `--port`.
- **Database errors**: verify credentials and run `init_db.py` to ensure tables exist.
- **Missing modules**: run `pip install -r requirements.txt` or `npm install` inside the respective folders after pulling updates.

---

## License

Internal project for Alburhan Regional Co. — distribution or reuse requires company approval.
