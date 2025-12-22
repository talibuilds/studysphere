# StudySphere Demo — Next.js Frontend + Django Backend (studyspheredemo)

[![GitHub stars](https://img.shields.io/github/stars/your-username/studyspheredemo?style=flat)](https://github.com/your-username/studyspheredemo)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Overview
--------

StudySphere is a demo/starter kit for a student collaboration platform. It includes:
- A modern Next.js 16 (React 19) frontend with accessible UI components and Tailwind styling.
- A complete Django 4.2 + Django REST Framework backend (inside `backend/`) implementing JWT auth, user XP/leveling, study sessions, study groups, leaderboards, admin workflows, and a seeded dataset for local testing.

This repository is intended as a reference/demo to show a fullstack architecture (Next.js frontend + Django REST API backend) you can extend for production.

Table of contents
-----------------
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Frontend — Getting Started](#frontend--getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development](#development)
  - [Building for Production](#building-for-production)
  - [Linting & Formatting](#linting--formatting)
  - [Frontend Project Structure](#frontend-project-structure)
- [Backend — Getting Started (Django REST API)](#backend--getting-started-django-rest-api)
  - [Install Dependencies](#install-dependencies)
  - [Configure Environment](#configure-environment)
  - [Run Migrations](#run-migrations)
  - [Seed Database (Optional)](#seed-database-optional)
  - [Start Server](#start-server)
  - [Authentication & Security](#authentication--security)
  - [API Endpoints (Reference)](#api-endpoints-reference)
  - [Django Admin](#django-admin)
  - [XP & Leveling System](#xp--leveling-system)
  - [Backend Project Structure](#backend-project-structure)
  - [Database Models (Overview)](#database-models-overview)
  - [Development Tips](#development-tips)
  - [Production Deployment Checklist](#production-deployment-checklist)
- [Support & Contributing](#support--contributing)
- [License](#license)

Features
--------
- Dynamic Next.js frontend with App Router and accessible UI components (Radix UI)
- Tailwind CSS-based responsive styling and animations
- Form handling with react-hook-form + zod
- Django REST backend with:
  - JWT authentication (Simple JWT)
  - Custom User model with XP and leveling
  - Study Sessions (create, RSVP, manage)
  - Study Groups with approval workflows
  - Leaderboard and badges
  - Admin moderation and seed data
- CORS configured for frontend-backend integration

Tech Stack
----------
- Frontend: Next.js 16 (React 19), Tailwind CSS 4, Radix UI, Lucide-React
- Backend: Django 4.2, Django REST Framework 3.16, Simple JWT
- Database: SQLite for local / PostgreSQL supported for production
- Language: Python 3.12 (backend), Node.js 20+ (frontend)

Frontend — Getting Started
--------------------------

Prerequisites
- Node.js (v20+) — https://nodejs.org/
- npm (comes with Node) or pnpm

Installation
```bash
# Clone the repository
git clone https://github.com/your-username/studyspheredemo.git
cd studyspheredemo

# Install frontend dependencies
npm install
```

Development
```bash
# Run the Next.js frontend dev server
npm run dev
```
Open http://localhost:3000 in your browser. Hot reloading is enabled.

Building for Production
```bash
npm run build
npm start
```

Linting & Formatting
```bash
npm run lint
# npm run format (if configured)
```

Frontend Project Structure
```
studyspheredemo/
├─ app/                # Next.js App Router pages & layout files
├─ components/         # Re-usable UI components (Radix, custom)
├─ hooks/              # Custom React hooks
├─ lib/                # Utility libraries (e.g., API client)
├─ public/             # Static assets (favicon, images)
├─ styles/             # Global CSS / Tailwind config
├─ next.config.mjs
├─ package.json
└─ README.md
```

Backend — Getting Started (Django REST API)
-------------------------------------------

Location: `backend/` inside this repository. The backend implements the API consumed by the frontend and can be run independently for development.

Prerequisites
- Python 3.12
- pip
- virtualenv (optional but recommended)

Install dependencies
```bash
cd backend

# Create virtual environment
python -m venv venv
# Activate it:
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install packages
pip install -r requirements.txt
```

Configure Environment
Copy `.env.example` to `.env` and edit values:
```env
DATABASE_URL=sqlite:///db.sqlite3
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```
Notes:
- For production, use PostgreSQL and set `DEBUG=False`.
- Keep SECRET_KEY secure.

Run Migrations
```bash
python manage.py migrate
```

Seed Database (Optional)
A management command seeds sample users, groups, and sessions:
```bash
python manage.py seed
```
Seed creates example accounts:
- Admin: `admin` / `admin123`
- User: `razancodes` / `password123`

(Or create a superuser manually: `python manage.py createsuperuser`.)

Start Server
```bash
python manage.py runserver
```
The backend will be available at http://localhost:8000

Authentication & Security
-------------------------
- Authentication: JWT via Simple JWT.
- Include the access token in requests:
  Authorization: Bearer <access_token>
- Auth endpoints protect resources and return 401 for unauthorized requests.

API Endpoints (Reference)
-------------------------
Base path: `/api/`

Authentication
- POST /api/auth/register/ — Register new user (username, email, password)
- POST /api/auth/login/ — Login and get access & refresh tokens
- POST /api/auth/refresh/ — Refresh access token
- GET /api/auth/me/ — Get current user profile (requires auth)

Study Sessions
- GET /api/sessions/ — List sessions
- POST /api/sessions/ — Create session (+50 XP to creator)
- GET /api/sessions/{id}/ — Session details
- PUT /api/sessions/{id}/ — Update session (host only)
- DELETE /api/sessions/{id}/ — Delete session (host only)
- POST /api/sessions/{id}/rsvp/ — RSVP to session (+10 XP)
- DELETE /api/sessions/{id}/cancel_rsvp/ — Cancel RSVP

Study Groups
- GET /api/groups/ — List approved groups
- POST /api/groups/ — Create group (pending approval, +30 XP)
- GET /api/groups/{id}/ — Group details
- PUT /api/groups/{id}/ — Update group (creator only)
- DELETE /api/groups/{id}/ — Delete group (creator only)
- POST /api/groups/{id}/join/ — Join group (+25 XP)
- DELETE /api/groups/{id}/leave/ — Leave group

Dashboard
- GET /api/dashboard/ — User dashboard data (upcoming sessions, stats)

Leaderboard
- GET /api/leaderboard/?period=week — Weekly leaderboard
- GET /api/leaderboard/?period=all — All-time leaderboard

Admin (Staff Only)
- GET /api/admin/groups/ — View all group requests with stats
- PATCH /api/admin/groups/{id}/approve/ — Approve group
- PATCH /api/admin/groups/{id}/reject/ — Reject group

Django Admin
------------
Access: http://localhost:8000/admin

Use seeded admin credentials or create a superuser:
```bash
python manage.py createsuperuser
```
Admin allows moderation of groups, sessions, badges, and user accounts.

XP & Leveling System
--------------------
XP is tracked on the custom User model. XP is automatically awarded on actions:
- Create session: +50 XP
- RSVP to session: +10 XP
- Join group: +25 XP
- Create group: +30 XP

Leveling scheme:
- Level 1: 0–499 XP
- Level 2: 500–999 XP
- Level 3: 1000–1499 XP
- Level 4: 1500–1999 XP
- Level 5+: 2000+ XP (every additional 1000 XP = +1 level)

Helper utilities live in `backend/api/utils.py`.

Backend Project Structure
-------------------------
```
backend/
├── api/                    # Main API app
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── permissions.py
│   ├── utils.py
│   └── management/
│       └── commands/
│           └── seed.py
├── authentication/         # Auth app
│   ├── views.py
│   └── serializers.py
├── studysphere/            # Project settings
│   ├── settings.py
│   └── urls.py
├── manage.py
├── requirements.txt
└── .env.example
```
(Adjust paths if your repo layout differs.)

Database Models (Overview)
--------------------------
- User — Extended Django user with XP, level, and profile metadata
- StudyGroup — name, description, creator, approval status
- StudySession — host, time, location, topic, capacity
- SessionRSVP — RSVPs to sessions
- GroupMembership — group members and roles
- Badge — Achievements awarded to users

Refer to `backend/api/models.py` for full definitions.

Development Tips
----------------
- Django shell:
```bash
python manage.py shell
```
- DB shell (configured DB):
```bash
python manage.py dbshell
```
- Validate configuration:
```bash
python manage.py check
```
- View migrations:
```bash
python manage.py showmigrations
```

Production Deployment Checklist
-------------------------------
1. Set `DEBUG=False` and secure `SECRET_KEY`.
2. Use PostgreSQL (update `DATABASE_URL` accordingly).
3. Set `ALLOWED_HOSTS` for production domains.
4. Run `python manage.py collectstatic`.
5. Use Gunicorn:
```bash
gunicorn studysphere.wsgi:application
```
6. Configure Nginx to serve static files and proxy to Gunicorn.
7. Set up HTTPS (Let's Encrypt or managed TLS).
8. Store secrets in a secure manager.

Support & Contributing
----------------------
Contributions are welcome!

To contribute:
1. Fork the repository
2. Create a feature branch (`git checkout -b feat/awesome-feature`)
3. Commit changes with clear messages
4. Open a Pull Request describing the changes

Please follow linting rules and add tests where applicable.

If you encounter issues or have feature requests, open an issue in the repository.

License
-------
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file.

Contact
-------
- Author: Your Name (<studysphere@outlook.com>)

- GitHub: https://github.com/maayaankmehta/ |  https://github.com/razancodes/


Acknowledgements
----------------
Built with Next.js, Tailwind CSS, Radix UI, Django, and Django REST Framework and Google Antigravity IDE.
