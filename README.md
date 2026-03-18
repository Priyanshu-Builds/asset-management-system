# 🏢 AssetVault — Enterprise Asset Management System

<div align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.0-000000?logo=flask&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

**A full-stack enterprise asset management platform with role-based access control, real-time analytics, and a premium dark glassmorphism UI.**

[Live Demo](https://asset-management-system-wine.vercel.app/) · [API Endpoint](https://asset-management-system-qqk0.onrender.com/) · [Report Bug](https://github.com/Priyanshu-Builds/asset-management-system/issues)

</div>

---

## 📋 Table of Contents

- [About](#about)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Database Schema](#-database-schema)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Demo Credentials](#-demo-credentials)
- [API Reference](#-api-reference)
- [Role-Based Access Matrix](#-role-based-access-matrix)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)
- [License](#-license)

---

## About

AssetVault is an enterprise-grade asset management system designed for organizations to track hardware, software, furniture, and vehicles throughout their lifecycle. It provides different dashboards and permissions based on user roles — administrators see system-wide analytics and manage resources, while employees view only their assigned assets and report issues.

The application features a premium dark-themed SaaS-style interface with glassmorphism cards, smooth animations, and responsive design built entirely with vanilla CSS.

---

## 🌐 Live Demo

| Service | URL |
|---|---|
| **Frontend (Vercel)** | [asset-management-system-wine.vercel.app](https://asset-management-system-wine.vercel.app/) |
| **Backend API (Render)** | [asset-management-system-qqk0.onrender.com](https://asset-management-system-qqk0.onrender.com/) |
| **Database** | Railway MySQL |

> **Note:** The Render free tier spins down after 15 minutes of inactivity. The first request after a cold start may take ~30 seconds.

---

## ✨ Features

### Core Functionality
- **Asset Management** — Full CRUD for assets across 4 categories (Electronics, Software, Furniture, Vehicles) with serial numbers, purchase dates, warranty tracking, and status management (available, assigned, under maintenance, retired)
- **Asset Assignments** — Assign and return assets to employees with complete assignment history
- **Issue Tracking** — Employees report issues on their assigned assets; managers triage and update status through a workflow (open → in progress → resolved → closed)
- **Maintenance Records** — Schedule and track maintenance with technician details, dates, descriptions, and cost tracking
- **User Management** — Admin can create, edit, deactivate users and assign roles (admin, it_manager, employee)
- **Activity Logs** — Full audit trail of all actions across the system

### Dashboard & Analytics
- **Role-Based Dashboard** — Admins and IT managers see system-wide statistics with pie charts (asset categories) and bar charts (monthly issues). Employees see a personalized view with only their assigned assets and reported issues
- **Overview Cards** — Total users, total assets, assigned count, open issues — all linked to their respective pages

### User Experience
- **Live Global Search** — Real-time search across assets, users, and issues with categorized dropdown results
- **Role-Based Notifications** — Dynamic notifications pulled from real system data. Admins see system events (new issues, assignments, new users); employees see their own asset assignments and issue status updates
- **Quick Create** — Top-nav Create button opens forms directly: admins get "New Asset" and "Schedule Maintenance"; employees get "Report Issue"
- **Centered Profile Modal** — Full profile view with avatar, name, email, role, and department
- **Self Registration** — New users can register; admins assign roles afterward

### Design
- **Premium Dark Theme** — Consistent dark SaaS aesthetic across all pages
- **Glassmorphism Cards** — Frosted glass effect with subtle backdrop blur
- **Micro-Animations** — Smooth transitions, hover effects, and animated modals
- **Responsive Tables** — Horizontal scroll with pagination for large datasets

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI component library |
| Vite 8 | Build tool and dev server |
| React Router v7 | Client-side routing with role guards |
| Axios | HTTP client with JWT interceptors |
| Recharts | Dashboard charts (Pie, Bar) |
| Lucide React | Icon library |
| Vanilla CSS | Custom styling with glassmorphism effects |

### Backend
| Technology | Purpose |
|---|---|
| Flask 3.0 | Python web framework |
| Flask-SQLAlchemy | ORM for database operations |
| Flask-JWT-Extended | JWT authentication and authorization |
| Flask-Bcrypt | Password hashing |
| Flask-CORS | Cross-origin request handling |
| PyMySQL | MySQL database driver |
| Gunicorn | Production WSGI server |

### Infrastructure
| Service | Purpose |
|---|---|
| Vercel | Frontend hosting and CDN |
| Render | Backend hosting |
| Railway | MySQL database hosting |

---

## 🏗️ Architecture

```
┌──────────────────┐     HTTPS      ┌──────────────────┐     TCP      ┌──────────────────┐
│                  │ ──────────────► │                  │ ──────────► │                  │
│   React + Vite   │                 │   Flask API      │              │   MySQL (Railway) │
│   (Vercel)       │ ◄────────────── │   (Render)       │ ◄────────── │                  │
│                  │     JSON        │                  │   SQLAlchemy │                  │
└──────────────────┘                 └──────────────────┘              └──────────────────┘
        │                                    │
        │                                    │
   React Router                         JWT Auth
   Role Guards                      Role-Based Endpoints
   Axios + Token                    Bcrypt Password Hash
```

**Authentication Flow:**
1. User logs in → Backend validates credentials → Returns JWT token
2. Frontend stores token in `localStorage` → Attached to every API request via Axios interceptor
3. Backend decodes JWT on each request → Extracts user role → Returns role-appropriate data
4. 401 responses auto-redirect to login page

---

## 🗄️ Database Schema

```
┌─────────────┐       ┌──────────────────┐       ┌─────────────┐
│    Users     │       │ AssetAssignments │       │   Assets    │
├─────────────┤       ├──────────────────┤       ├─────────────┤
│ id (PK)     │◄──┐   │ id (PK)          │   ┌──►│ id (PK)     │
│ name        │   ├───│ employee_id (FK)  │   │   │ asset_name  │
│ email       │   │   │ asset_id (FK) ────│───┘   │ category    │
│ password    │   │   │ assigned_date     │       │ brand       │
│ role        │   │   │ return_date       │       │ model       │
│ department  │   │   │ status            │       │ serial_num  │
│ status      │   │   └──────────────────┘       │ status      │
│ created_at  │   │                               │ created_at  │
└─────────────┘   │   ┌──────────────────┐       └─────────────┘
                  │   │     Issues       │              │
                  │   ├──────────────────┤              │
                  ├───│ employee_id (FK)  │              │
                  │   │ asset_id (FK) ────│──────────────┘
                  │   │ description       │              │
                  │   │ status            │              │
                  │   └──────────────────┘              │
                  │                                      │
                  │   ┌──────────────────┐              │
                  │   │  Maintenance     │              │
                  │   ├──────────────────┤              │
                  │   │ asset_id (FK) ────│──────────────┘
                  │   │ technician        │
                  │   │ date              │
                  │   │ cost              │
                  │   └──────────────────┘
                  │
                  │   ┌──────────────────┐
                  │   │  ActivityLogs    │
                  │   ├──────────────────┤
                  └───│ user_id (FK)      │
                      │ action            │
                      │ module            │
                      │ timestamp         │
                      └──────────────────┘
```

---

## 📁 Project Structure

```
asset-management-system/
│
├── backend/
│   ├── app.py                    # Flask app, blueprint registration, db.create_all()
│   ├── config.py                 # DB URI, JWT secrets (reads from env vars)
│   ├── models.py                 # 6 SQLAlchemy models
│   ├── seed.py                   # Populates database with demo data
│   ├── requirements.txt          # Python dependencies
│   └── routes/
│       ├── auth.py               # POST /auth/login, POST /auth/register
│       ├── users.py              # GET/POST/PUT/DELETE /users
│       ├── assets.py             # GET/POST/PUT/DELETE /assets
│       ├── assignments.py        # GET/POST /assignments, return asset
│       ├── issues.py             # GET/POST/PUT /issues
│       ├── maintenance.py        # GET/POST/PATCH /maintenance
│       ├── dashboard.py          # GET /dashboard-stats (role-based)
│       ├── search.py             # GET /search?q= (global search)
│       ├── notifications.py      # GET /notifications (role-based)
│       └── activity_logs.py      # GET /activity-logs
│
├── frontend/
│   ├── src/
│   │   ├── api/client.js         # Axios instance with JWT interceptor
│   │   ├── context/AuthContext.jsx # Auth state, login/logout, role helpers
│   │   ├── components/
│   │   │   ├── Layout.jsx        # Sidebar + TopNav wrapper
│   │   │   ├── Sidebar.jsx       # Navigation with role-based menu items
│   │   │   └── TopNav.jsx        # Search, notifications, create, profile
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Login with demo credential buttons
│   │   │   ├── Register.jsx      # Self-registration form
│   │   │   ├── Dashboard.jsx     # Role-based dashboard with charts
│   │   │   ├── Assets.jsx        # Asset CRUD with search and filters
│   │   │   ├── Assignments.jsx   # Assign/return assets
│   │   │   ├── Issues.jsx        # Report and manage issues
│   │   │   ├── Maintenance.jsx   # Maintenance scheduling
│   │   │   ├── Users.jsx         # User management (admin only)
│   │   │   ├── MyAssets.jsx      # Employee's assigned assets
│   │   │   ├── ActivityLogs.jsx  # System audit trail
│   │   │   └── Settings.jsx      # User settings
│   │   ├── App.jsx               # Routes with role-based guards
│   │   └── index.css             # Global styles, dark theme, glassmorphism
│   ├── vercel.json               # SPA rewrite rules
│   ├── package.json
│   └── .npmrc                    # Legacy peer deps for build compatibility
│
├── .gitignore
├── LICENSE                       # MIT License
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **Python** 3.9+
- **MySQL** 8.0+

### 1. Clone

```bash
git clone https://github.com/Priyanshu-Builds/asset-management-system.git
cd asset-management-system
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
```

Create the database and update credentials in `config.py` if needed:

```sql
CREATE DATABASE asset_management;
```

Start the server:

```bash
python app.py
# API runs at http://localhost:5000
```

### 3. Seed Demo Data (Optional)

```bash
python seed.py
```

This creates 7 users, 15 assets, 5 assignments, 4 issues, 2 maintenance records, and 8 activity logs.

### 4. Frontend

```bash
cd ../frontend
npm install
npm run dev
# App runs at http://localhost:5173
```

---

## 👥 Demo Credentials

| Role | Email | Password | What they see |
|---|---|---|---|
| **Admin** | admin@company.com | admin123 | Full analytics, all modules, user management |
| **IT Manager** | rahul@company.com | password123 | Full analytics, all modules except user management |
| **Employee** | priyanshu@company.com | password123 | Personal dashboard, my assets, report issues |

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | Returns JWT token |
| POST | `/auth/register` | Create new user account |

### Dashboard & Search
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard-stats` | Role-based statistics and chart data |
| GET | `/search?q={query}` | Global search across assets, users, issues |
| GET | `/notifications` | Role-based notifications from system data |

### Assets
| Method | Endpoint | Description |
|---|---|---|
| GET | `/assets?page=1&per_page=10&search=&status=` | Paginated asset list with filters |
| GET | `/assets/all` | All assets (no pagination) |
| POST | `/assets` | Create new asset |
| PUT | `/assets/:id` | Update asset |
| DELETE | `/assets/:id` | Delete asset |

### Assignments
| Method | Endpoint | Description |
|---|---|---|
| GET | `/assignments` | All assignments |
| POST | `/assignments` | Assign asset to employee |
| PUT | `/assignments/:id/return` | Return assigned asset |
| GET | `/assignments/my-assets` | Current user's assigned assets |

### Issues
| Method | Endpoint | Description |
|---|---|---|
| GET | `/issues` | All issues (filtered by role) |
| POST | `/issues` | Report new issue |
| PUT | `/issues/:id` | Update issue status |

### Maintenance
| Method | Endpoint | Description |
|---|---|---|
| GET | `/maintenance` | All maintenance records |
| POST | `/maintenance` | Create maintenance record |
| PATCH | `/maintenance/:id/complete` | Mark as completed |

### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | `/users` | All users (admin only) |
| POST | `/users` | Create user |
| PUT | `/users/:id` | Update user details/role |
| DELETE | `/users/:id` | Delete user |

### Activity Logs
| Method | Endpoint | Description |
|---|---|---|
| GET | `/activity-logs` | Paginated audit trail |

> All endpoints except `/auth/login` and `/auth/register` require a valid JWT token in the `Authorization: Bearer <token>` header.

---

## 🔒 Role-Based Access Matrix

| Module | Admin | IT Manager | Employee |
|---|:---:|:---:|:---:|
| Dashboard (System Analytics) | ✅ | ✅ | — |
| Dashboard (Personal View) | — | — | ✅ |
| Asset Management (CRUD) | ✅ | ✅ | — |
| My Assets (Read Only) | — | — | ✅ |
| Asset Assignments | ✅ | ✅ | — |
| Report Issues | — | — | ✅ |
| Manage Issues (Status) | ✅ | ✅ | — |
| Maintenance Records | ✅ | ✅ | — |
| User Management | ✅ | — | — |
| Activity Logs | ✅ | ✅ | — |
| Settings | ✅ | ✅ | ✅ |
| Global Search | ✅ | ✅ | ✅ |
| Notifications | ✅ | ✅ | ✅ |

---

## 🌐 Deployment

The app is deployed across three services:

### Railway (MySQL Database)
1. Create a project at [railway.app](https://railway.app) → Add MySQL
2. Enable **Public Networking** in the MySQL service settings
3. Copy the public `MYSQL_URL` and change `mysql://` to `mysql+pymysql://`

### Render (Flask Backend)
1. Create a Web Service at [render.com](https://render.com) → Connect GitHub
2. Set **Root Directory** to `backend`, **Runtime** to Python 3
3. **Build Command:** `pip install -r requirements.txt`
4. **Start Command:** `gunicorn app:app --bind 0.0.0.0:$PORT`
5. Environment variables:
   - `DATABASE_URL` — Railway MySQL public URL (with `mysql+pymysql://`)
   - `SECRET_KEY` — Random secret string
   - `JWT_SECRET_KEY` — Random secret string

### Vercel (React Frontend)
1. Import repo at [vercel.com](https://vercel.com)
2. Set **Root Directory** to `frontend`, **Framework** to Vite
3. Environment variable:
   - `VITE_API_URL` — Your Render backend URL

---

## 📸 Screenshots

> Login with demo credentials at the [live demo](https://asset-management-system-wine.vercel.app/) to explore the full interface.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

