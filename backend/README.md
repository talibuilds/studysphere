# StudySphere Django Backend

Complete Django REST Framework backend for StudySphere student collaboration platform.

## Features

- **JWT Authentication** - Secure token-based authentication
- **User Management** - Custom user model with XP and leveling system
- **Study Sessions** - Create, join, and manage study sessions
- **Study Groups** - Create groups with admin approval workflow
- **Leaderboard** - Track student rankings and achievements
- **Admin Panel** - Django admin interface for content moderation
- **CORS** - Configured for Next.js frontend communication

## Tech Stack

- Django 4.2
- Django REST Framework 3.16
- PostgreSQL/SQLite
- JWT (Simple JWT)
- Python 3.12

## Setup Instructions

### 1. Install Dependencies

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install packages
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL=sqlite:///db.sqlite3
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### 3. Run Migrations

```bash
python manage.py migrate
```

### 4. Seed Database (Optional)

```bash
python manage.py seed
```

This creates sample users, groups, and sessions. Test credentials:
- Admin: `admin` / `admin123`
- User: `razancodes` / `password123`

### 5. Start Server

```bash
python manage.py runserver
```

Backend will run on **http://localhost:8000**

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login and get JWT tokens
- `POST /api/auth/refresh/` - Refresh access token
- `GET /api/auth/me/` - Get current user profile

### Study Sessions
- `GET /api/sessions/` - List all sessions
- `POST /api/sessions/` - Create session (+50 XP)
- `GET /api/sessions/{id}/` - Get session details
- `PUT /api/sessions/{id}/` - Update session (host only)
- `DELETE /api/sessions/{id}/` - Delete session (host only)
- `POST /api/sessions/{id}/rsvp/` - RSVP to session (+10 XP)
- `DELETE /api/sessions/{id}/cancel_rsvp/` - Cancel RSVP

### Study Groups
- `GET /api/groups/` - List approved groups
- `POST /api/groups/` - Create group (pending approval, +30 XP)
- `GET /api/groups/{id}/` - Get group details
- `PUT /api/groups/{id}/` - Update group (creator only)
- `DELETE /api/groups/{id}/` - Delete group (creator only)
- `POST /api/groups/{id}/join/` - Join group (+25 XP)
- `DELETE /api/groups/{id}/leave/` - Leave group

### Dashboard
- `GET /api/dashboard/` - Get user dashboard data (upcoming sessions, stats)

### Leaderboard
- `GET /api/leaderboard/?period=week` - Weekly leaderboard
- `GET /api/leaderboard/?period=all` - All-time leaderboard

### Admin (Staff Only)
- `GET /api/admin/groups/` - View all group requests with stats
- `PATCH /api/admin/groups/{id}/approve/` - Approve group
- `PATCH /api/admin/groups/{id}/reject/` - Reject group

## Django Admin

Access Django admin at **http://localhost:8000/admin**

Use the admin credentials created during seeding or create a superuser:

```bash
python manage.py createsuperuser
```

## XP System

Actions reward XP automatically:
- Create session: **+50 XP**
- RSVP to session: **+10 XP**
- Join group: **+25 XP**
- Create group: **+30 XP**

Levels are calculated from total XP:
- Level 1: 0-499 XP
- Level 2: 500-999 XP
- Level 3: 1000-1499 XP
- Level 4: 1500-1999 XP
- Level 5+: 2000+ XP (every 1000 XP = +1 level)

## Project Structure

```
backend/
├── api/                    # Main API app
│   ├── models.py          # Database models
│   ├── serializers.py     # DRF serializers
│   ├── views.py           # API ViewSets
│   ├── permissions.py     # Custom permissions
│   ├── utils.py           # XP utilities
│   └── management/
│       └── commands/
│           └── seed.py    # Database seeding
├── authentication/         # Auth app
│   ├── views.py           # Login/register
│   └── serializers.py     # Auth serializers
├── studysphere/           # Project settings
│   ├── settings.py        # Django configuration
│   └── urls.py            # Main URL routing
├── manage.py
├── requirements.txt
└── .env
```

## Database Models

- **User** - Extended Django user with XP/level
- **StudyGroup** - Groups with approval status
- **StudySession** - Study sessions with host and location
- **SessionRSVP** - Many-to-many for session attendance
- **GroupMembership** - Many-to-many for group members
- **Badge** - User achievements and badges

## Development Tips

- Use `python manage.py shell` to interact with models
- Use `python manage.py dbshell` for database access
- Run `python manage.py check` to validate configuration
- Use `python manage.py showmigrations` to view migration status

## Production Deployment

1. Set `DEBUG=False` in `.env`
2. Configure PostgreSQL database
3. Set strong `SECRET_KEY`
4. Configure `ALLOWED_HOSTS`
5. Run `python manage.py collectstatic`
6. Use gunicorn or similar WSGI server
7. Set up nginx for serving static files

## Support

For issues or questions, contact the development team.
