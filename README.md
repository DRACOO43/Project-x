# Smart Platform for Project Management (MERN Stack)

A centralized, production-ready, full-stack web application designed for engineering teams and project managers to plan projects, orchestrate Kanban tasks, track velocity, monitor deadlines, and export executive reports.

Developed as a complete MERN Stack Internship Project with role-based access control (RBAC), automated progress formulas, deadline alerts, and rule-based heuristic recommendations.

---

## 📑 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Key Modules & Smart Features](#key-modules--smart-features)
4. [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
5. [Directory & Folder Structure](#directory--folder-structure)
6. [Prerequisites](#prerequisites)
7. [Installation & Setup Guide](#installation--setup-guide)
   - [Unified Full-Stack Startup (Recommended)](#unified-full-stack-startup-recommended)
   - [Local MongoDB & MongoDB Atlas Configuration](#local-mongodb--mongodb-atlas-configuration)
8. [Initial Administrator Account Creation](#initial-administrator-account-creation)
9. [Pre-Seeded Demonstration Accounts](#pre-seeded-demonstration-accounts)
10. [REST API Documentation](#rest-api-documentation)
11. [Testing & Verification Checklist](#testing--verification-checklist)
12. [Security & Production Hardening](#security--production-hardening)

---

## 1. Project Overview

The **Smart Platform for Project Management** solves fragmented team coordination and opaque milestone tracking by providing:
- **Real-Time Project Health**: Continuous status analysis (`On Track`, `At Risk`, `Delayed`, `Completed`) derived deterministically from task due dates and completion ratios.
- **Dynamic Progress Calculation**: Project completion percentage formula:  
  $$\text{Progress (\%)} = \left(\frac{\text{Completed Tasks}}{\text{Total Tasks}}\right) \times 100$$
- **Rule-Based Recommendations**: Backlog ranking engine that highlights high-priority overdue blockers and upcoming milestones without opaque AI black boxes.
- **Auditable Security**: Server-side enforced JWT cookie/header authorization, Bcrypt password hashing, and formula-injection-safe CSV reporting.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 19 (SPA with Vite build system)
- **Styling**: Tailwind CSS v4, Inter Typography, Responsive Mobile Drawers
- **Navigation**: React Router DOM (Protected Routes, Navigation Guards)
- **HTTP Client**: Axios (with base URL injection and token interceptors)
- **Data Visualization**: Recharts (Donut status charts, Task velocity bar charts)
- **Icons**: Lucide React
- **Theming**: Integrated Light & Dark mode toggle with `localStorage` persistence

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT) & Bcrypt password hashing
- **Validation**: express-validator request sanitization
- **Resilience**: Adaptive persistence layer (connects seamlessly to MongoDB Atlas or local MongoDB; falls back to an embedded in-memory database store if MongoDB is offline for zero-downtime grading).

---

## 3. Key Modules & Smart Features

### A. Automatic Progress Tracking
The platform calculates project completion on the fly from its tasks. If a project has 0 tasks, progress displays cleanly as 0%.

### B. Deadline Alerts
- **Overdue Tasks**: Highlighted with red visual flags when due date is in the past and status is not `completed`.
- **Due Soon**: Flagged with amber indicators when due within the next 3 days.

### C. Priority-Based Recommendations (Rule-Based Heuristic)
The recommendation engine prioritizes tasks in the following deterministic sequence:
1. Overdue high/critical-priority tasks (Critical Blockers)
2. Tasks due within the next 72 hours (Time-Sensitive)
3. High-priority backlog items
4. Standard backlog progression

### D. Project Health Indicator
- **Completed**: Status set to `completed` or progress equals 100%.
- **Delayed**: Due date is in the past and progress is below 100%.
- **At Risk**: Has overdue tasks or due date is within 3 days with progress below 60%.
- **On Track**: Normal timeline progression.

---

## 4. Role-Based Access Control (RBAC)

The application enforces permissions on the **backend API layer**:

| Permission / Capability | Administrator | Project Manager | Team Member |
| :--- | :---: | :---: | :---: |
| Platform statistics & KPI cards | ✅ Full | ✅ Full | ✅ Scoped |
| Create new projects | ✅ Yes | ✅ Yes | ❌ Read-Only |
| Edit & delete owned projects | ✅ Any project | ✅ Owned only | ❌ Forbidden |
| Add & remove team members | ✅ Yes | ✅ Yes (Owned) | ❌ Forbidden |
| Create, assign, and delete tasks | ✅ Yes | ✅ Yes | ❌ Forbidden |
| Update task status & post comments | ✅ Yes | ✅ Yes | ✅ Yes |
| Manage user roles & activate accounts | ✅ Yes | ❌ Forbidden | ❌ Forbidden |
| Export sanitized CSV reports | ✅ Yes | ✅ Yes | ✅ Scoped |

---

## 5. Directory & Folder Structure

```
smart-project-management/
│
├── server/                         # Express & Mongoose Backend
│   ├── config/
│   │   └── db.ts                   # MongoDB Mongoose connection handler
│   ├── controllers/
│   │   ├── authController.ts       # Registration, login, session, switch-demo
│   │   ├── userController.ts       # User lookup, profile update, admin role editor
│   │   ├── projectController.ts    # Project CRUD, member assignment
│   │   ├── taskController.ts       # Task CRUD, comments thread
│   │   ├── dashboardController.ts  # Summary metrics & Recharts payload
│   │   ├── reportController.ts     # Reports & sanitized CSV export
│   │   └── notificationController.ts# In-app notification management
│   ├── middleware/
│   │   ├── auth.ts                 # JWT verification & role authorization
│   │   ├── errorHandler.ts         # Central JSON error handler
│   │   └── validate.ts             # express-validator runner
│   ├── models/
│   │   ├── User.ts                 # User Mongoose schema & bcrypt methods
│   │   ├── Project.ts              # Project Mongoose schema with member refs
│   │   ├── Task.ts                 # Task Mongoose schema with sub-comments
│   │   └── Notification.ts         # Notification Mongoose schema
│   ├── routes/                     # Express REST route definitions
│   ├── services/
│   │   └── dataStore.ts            # Persistence manager (Mongo / Resilient store)
│   ├── scripts/
│   │   └── seed.ts                 # Standalone database seed script
│   ├── app.ts                      # Express app configuration & middleware
│   ├── server.ts                   # Standalone backend server entry point
│   └── .env.example                # Backend environment template
│
├── src/                            # React Frontend
│   ├── components/                 # Modals, Navbar, Sidebar, Badges, EmptyState
│   ├── context/                    # AuthContext, ThemeContext, ToastContext
│   ├── layouts/                    # DashboardLayout with responsive drawer
│   ├── pages/                      # 16 main application pages
│   ├── routes/                     # ProtectedRoute guard
│   ├── services/                   # Axios API client
│   ├── App.tsx                     # React Router tree
│   ├── index.css                   # Tailwind CSS imports
│   └── main.tsx                    # React DOM root entry
│
├── server.ts                       # Unified Full-Stack Dev Server (Vite + Express)
├── package.json                    # Project dependencies & scripts
├── tsconfig.json                   # TypeScript configuration
├── vite.config.ts                  # Vite build tooling
├── .env.example                    # Environment variable template
└── README.md                       # Complete documentation
```

---

## 6. Prerequisites

Ensure you have the following installed locally:
- **Node.js**: v18.0.0 or higher (Node 20+ recommended)
- **npm**: v9.0.0 or higher
- **MongoDB** (Optional for local testing):
  - Local Community Server on `mongodb://127.0.0.1:27017` **OR**
  - Free [MongoDB Atlas](https://www.mongodb.com/atlas/database) cloud cluster.

---

## 7. Installation & Setup Guide

### Step 1: Clone or Open Project
Open the project directory in Visual Studio Code:
```bash
cd smart-project-management
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
# On Windows PowerShell
cp .env.example .env

# On macOS / Linux
cp .env.example .env
```

Open `.env` and configure your settings:
```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/smart_project_management
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
VITE_API_URL=/api
```

### Step 3: Install Dependencies
Install all required frontend and backend packages:
```bash
npm install
```

### Step 4: Seed Initial Data (Optional)
Run the seed script to populate users, projects, and tasks into your database:
```bash
npm run seed
```

### Step 5: Start the Full-Stack Application
Start the unified application:
```bash
npm run dev
```

Open your browser to:
👉 **`http://localhost:3000`**

---

## 8. Initial Administrator Account Creation

To maintain strict security:
- Public self-registration (`/register`) creates standard user accounts (`team_member` or `project_manager`), **never** an administrator.
- The initial Administrator can be initialized through any of these secure paths:

### Method A: Automated Seed (Default)
Running `npm run seed` or booting the application with an empty database automatically sets up the initial Administrator account:
- **Email**: `admin@smartpm.local`
- **Password**: `admin123`

### Method B: Promoting via Existing Admin
An existing administrator can promote any registered user to an `admin` directly through the **Team Members Directory** (`/team`) using the role dropdown.

### Method C: MongoDB Shell / Compass
To elevate an account directly in MongoDB:
```javascript
use smart_project_management;
db.users.updateOne(
  { email: "your_registered_email@example.com" },
  { $set: { role: "admin" } }
);
```

---

## 9. Pre-Seeded Demonstration Accounts

For presentations and grading, 3 demonstration accounts are available with 1-click switcher buttons:

| Role | Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@smartpm.local` | `admin123` | Global analytics, user role updates, delete any project |
| **Project Manager** | `pm@smartpm.local` | `pm123` | Create projects, assign team members, create tasks |
| **Team Member** | `member@smartpm.local` | `member123` | View assigned tasks, change task status, post comments |

*(You can also click the quick **Role: Admin / PM / Member** pills in the top navigation bar at any time to demonstrate role-based access control instantly!)*

---

## 10. REST API Documentation

All API routes are served under `/api` and return standardized JSON responses:

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate credentials and receive JWT
- `GET /api/auth/me` - Get profile of authenticated user
- `POST /api/auth/logout` - Clear authentication session cookie
- `POST /api/auth/switch-demo` - Quick demo evaluation account switcher

### Projects
- `GET /api/projects` - List projects (supports `status`, `priority`, `search`, `sortBy`)
- `POST /api/projects` - Create project (Admin & PM only; validates dates)
- `GET /api/projects/:id` - Get project details with member list & tasks
- `PATCH /api/projects/:id` - Update project details (Owner or Admin)
- `DELETE /api/projects/:id` - Delete project and cascade-delete tasks
- `POST /api/projects/:id/members` - Add registered user to project team
- `DELETE /api/projects/:id/members/:userId` - Remove member from project

### Tasks
- `GET /api/tasks` - List tasks (supports `projectId`, `status`, `priority`, `search`)
- `POST /api/tasks` - Create task within project
- `GET /api/tasks/:id` - Get task details with comments thread
- `PATCH /api/tasks/:id` - Update task (status, priority, due date)
- `DELETE /api/tasks/:id` - Delete task (Creator or Admin)
- `POST /api/tasks/:id/comments` - Post comment to task discussion

### Dashboard & Analytics
- `GET /api/dashboard/summary` - Aggregate metrics, overdue alerts, Recharts data
- `GET /api/reports/projects` - Projects distribution by status and health
- `GET /api/reports/tasks` - Tasks velocity and completion breakdown
- `GET /api/reports/team` - Team member task workload distribution
- `GET /api/reports/export/csv?type=projects|tasks` - Download sanitized CSV

### Notifications
- `GET /api/notifications` - Retrieve in-app notifications
- `PATCH /api/notifications/:id/read` - Mark single notification as read
- `PATCH /api/notifications/read-all` - Mark all notifications as read

### System Health
- `GET /api/health` - MongoDB connection status & server timestamp

---

## 11. Testing & Verification Checklist

Use this checklist to verify application functionality:

- [x] **Registration**: Register new user via `/register` (verify standard non-admin account creation).
- [x] **Authentication**: Sign in with incorrect password (verify error message) and correct credentials.
- [x] **1-Click Demo Switcher**: Switch between Admin, Project Manager, and Team Member in the top navbar.
- [x] **RBAC Enforcement**: Verify Team Member cannot create projects or delete tasks created by others.
- [x] **Project CRUD**: Create project with due date earlier than start date (verify backend rejection).
- [x] **Dynamic Progress Formula**: Add 2 tasks to project, complete 1 (verify progress displays exactly 50%).
- [x] **Kanban Workflow**: Switch from List view to Kanban board on `/tasks`; click task to update status.
- [x] **Comments Feed**: Add a comment to a task (verify author name and timestamp appear).
- [x] **Deadline Alerts**: Check `/dashboard` for overdue milestones and items due within 3 days.
- [x] **Rule-Based Recommendations**: Verify overdue critical tasks are ranked #1 in recommendations.
- [x] **Calendar View**: Navigate to `/calendar` and verify milestone markers appear on correct dates.
- [x] **Reports & CSV Export**: Click "Export Tasks CSV" and "Export Projects CSV" (verify download).
- [x] **Notifications**: Assign a task to another user; verify that user receives a notification.
- [x] **Dark Mode Toggle**: Toggle theme in navbar or `/settings` (verify contrast and persistence).

---

## 12. Security & Production Hardening

- **No Plaintext Passwords**: Bcrypt with 10 salt rounds used for all user credentials.
- **CSV Formula Injection Defense**: Cells starting with `=`, `+`, `-`, or `@` are escaped with leading single quotes before export.
- **XSS & Injection Protection**: Input sanitization via `express-validator` and typed Mongoose schemas.
- **Environment Isolation**: `.env` files are excluded from git; only `.env.example` templates are tracked.
