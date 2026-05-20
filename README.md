# 🎓 StudySphere

**StudySphere** is a premium, state-of-the-art student collaboration platform designed to make studying social, interactive, and gamified. Users can create study groups, schedule study sessions, share learning resources, chat in real-time, and earn XP and badges as they progress.

---

## 🚀 Key Features

*   **Gamified Learning:** Dynamic user profiles with leveling (XP system) and earned badges.
*   **Study Groups:** Collaborate on academic subjects with built-in admin approval moderation workflow.
*   **Study Sessions:** Create and join study sessions with location tagging, RSVPs, and attendance verification.
*   **Real-time Interaction:** Real-time session chats and shared session-resource lists.
*   **Modern Visuals:** Responsive glassmorphism cards, premium dark mode styling, and smooth interactions.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Core** | Next.js 16 (React 19), Radix UI | Performance-optimized React frameworks and accessible UI primitives |
| **Styling** | Tailwind CSS 4 | Modern utility-first CSS styling and custom glassmorphic properties |
| **Backend API** | Django 4.2, Django REST Framework | Robust REST endpoints and business logic handler |
| **Auth** | Simple JWT | Secure stateless authentication token management |
| **Database** | SQLite / PostgreSQL | Local file database with seamless migrations |

---

## 📂 Project Structure

```
studysphere/
├── app/                  # Next.js App Router (pages, layouts, globals)
├── components/           # Reusable UI components (buttons, dialogs, cards)
├── lib/                  # Application library (API Axios clients, auth state providers)
├── public/               # Static assets & public icons
├── styles/               # Legacy global CSS definitions
└── backend/              # Django Python project directory
    ├── api/              # Core API app (models, views, serializers, tests)
    ├── authentication/   # Custom Auth controller overrides
    └── studysphere/      # Main Django project settings & URL routes
```

---

## 💻 Getting Started (Frontend)

### Prerequisites

*   **Node.js** (v20+ recommended)
*   **npm** or **pnpm**

### Installation & Run

1.  **Install dependencies** using legacy peer-deps to resolve React 19 package matching:
    ```bash
    npm install --legacy-peer-deps
    ```

2.  **Start the local development server**:
    ```bash
    npm run dev
    ```

3.  Open [http://localhost:3000](http://localhost:3000) to view the client.

### Production Build

```bash
npm run build
npm start
```

---

## 🐍 Getting Started (Backend)

### Prerequisites

*   **Python 3.12+**
*   **pip**

### Setup Environment

1.  **Navigate into the backend directory and create a virtual environment**:
    ```bash
    cd backend
    python -m venv venv
    ```

2.  **Activate the virtual environment**:
    *   **Windows**: `.\venv\Scripts\activate`
    *   **macOS / Linux**: `source venv/bin/activate`

3.  **Install requirements**:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Create your local environment file**:
    Create a `.env` file (copied from `.env.example`) and edit accordingly:
    ```env
    DATABASE_URL=sqlite:///db.sqlite3
    SECRET_KEY=your-super-secret-key-here
    DEBUG=True
    ALLOWED_HOSTS=localhost,127.0.0.1
    CORS_ALLOWED_ORIGINS=http://localhost:3000
    ```

5.  **Run database migrations**:
    ```bash
    python manage.py migrate
    ```

6.  **Seed sample data** (users, study groups, sessions, badges):
    ```bash
    python manage.py seed
    ```
    *Seeding creates standard test credentials:*
    *   **Admin User:** `admin` / `admin123`
    *   **Standard Student User:** `razancodes` / `password123` (or `razan` / `password123@#`)

7.  **Start the Django REST server**:
    ```bash
    python manage.py runserver
    ```
    The server will listen at [http://localhost:8000](http://localhost:8000).

---

## 📊 XP & Leveling Engine

XP points are awarded dynamically based on student participation:

| Action | XP Earned |
| :--- | :--- |
| **Create a Study Session** | `+50 XP` |
| **Join a Study Group** | `+25 XP` |
| **RSVP to a Session** | `+10 XP` |
| **Mark Verified Attendance** | `+100 XP` |

### Level Bounds
*   **Level 1:** `0 – 499 XP`
*   **Level 2:** `500 – 999 XP`
*   **Level 3:** `1000 – 1499 XP`
*   **Level 4:** `1500 – 1999 XP`
*   **Level 5+:** `2000+ XP` (Increments by 1 level for every additional 1000 XP)

---

## ⚡ API Endpoints Reference

All API calls must include the authorization header where authentication is required:
`Authorization: Bearer <jwt_access_token>`

### Auth & User endpoints
*   `POST /api/auth/register/` - Create a student profile
*   `POST /api/auth/login/` - Acquire JWT access and refresh tokens
*   `POST /api/auth/refresh/` - Renew expired access tokens
*   `GET /api/auth/me/` - Retrieve details of the current logged-in user

### Study Sessions
*   `GET /api/sessions/` - Retrieve available study sessions
*   `POST /api/sessions/` - Create a new study session (`+50 XP` host reward)
*   `GET /api/sessions/{id}/` - Detailed session information
*   `POST /api/sessions/{id}/rsvp/` - RSVP to attend the session
*   `POST /api/sessions/{id}/mark_attendance/` - Submit verification code to mark attendance (`+100 XP` reward)

### Study Groups
*   `GET /api/groups/` - List all approved groups
*   `POST /api/groups/` - Propose a new group (creates a pending approval request)
*   `POST /api/groups/{id}/join/` - Join an approved group (`+25 XP`)

### Leaderboard & Gamification
*   `GET /api/leaderboard/?period=week` - Retrieve leaderboard rankings for the current week
*   `GET /api/leaderboard/?period=all` - Retrieve all-time rankings

### Admin Dashboard (Staff Only)
*   `GET /api/admin/groups/` - View pending/approved/rejected group queries
*   `PATCH /api/admin/groups/{id}/approve/` - Approve and publish a group request
*   `PATCH /api/admin/groups/{id}/reject/` - Reject a group request

---

## ⚙️ Development & Production Commands

| Task | Command |
| :--- | :--- |
| **Frontend Dev** | `npm run dev` |
| **Frontend Lint** | `npm run lint` |
| **Backend Shell** | `python manage.py shell` |
| **Run Migrations** | `python manage.py migrate` |
| **Check Backend** | `python manage.py check` |
| **View Migrations** | `python manage.py showmigrations` |

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
