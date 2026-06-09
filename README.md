<div align="center">

<img src="https://img.shields.io/badge/PERN-Stack-4A90D9?style=for-the-badge&logo=postgresql&logoColor=white" />
<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
<img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" />
<img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
<img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />

<br/><br/>

# 🏆 Sports Department Data Management System

### A comprehensive, role-based web platform for managing university sports departments — built with the PERN stack.

*Dr. Sivanthi Aditanar College of Engineering, Tiruchendur · Anna University · May 2026*

**Developed by:** Kumutha R (950522104023) &nbsp;·&nbsp; Pavithra S (950522104034)

<br/>

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Role-Based Access](#-role-based-access)
- [Module Breakdown](#-module-breakdown)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [Getting Started](#-getting-started)
- [Future Enhancements](#-future-enhancements)
- [Project Report](#-project-report)

---

## 🌐 Overview

The **Sports Department Data Management System** is a full-stack web application that digitizes and centralizes the administration of a college sports department. It replaces fragmented paper registers and spreadsheets with a secure, real-time, role-aware platform accessible to all stakeholders — Admins, Directors, Staff, and Students.

> **Built as a B.E. Computer Science & Engineering final-year project**, the system has been successfully tested for all core operations including event creation, enrollment tracking, attendance marking, performance recording, kit management, audit logging, selection reports, and student history summaries.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔐 **Secure Authentication** | bcrypt password hashing + JWT session tokens |
| 👥 **Role-Based Access Control** | Four distinct roles with strictly enforced permissions at frontend and backend |
| 📅 **Event Management** | Create, schedule, and manage internal/external sports events |
| 📋 **Training Programs** | Build training schedules, manage sessions, and track participants |
| ✅ **Attendance Tracking** | Mark and summarize daily attendance per session |
| 📊 **Performance Monitoring** | Record per-session metrics and ratings for each student |
| 🏅 **Selection Reports** | Auto-rank students by attendance percentage and performance rating |
| 🎽 **Kit Management** | Issue, track, and return sports kits (jerseys, shorts, tracksuits, etc.) |
| 🏆 **Achievement Records** | Hall of Champions with department leaderboards and medal counts |
| 🗂️ **Student History Reports** | Comprehensive, downloadable sports history reports per student |
| 🪵 **Audit Logs** | Full system activity tracking with CSV export |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (React.js)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │  Admin   │ │ Director │ │  Staff   │ │   Student    │   │
│  │Dashboard │ │Dashboard │ │Dashboard │ │  Dashboard   │   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬───────┘   │
└───────┼────────────┼────────────┼──────────────┼───────────┘
        │            │            │              │
        └────────────┴────────────┴──────────────┘
                             │ Axios (REST API Calls)
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   SERVER (Node.js + Express.js)              │
│                                                             │
│   Auth Middleware (JWT Verify) → Role Middleware (RBAC)      │
│                                                             │
│   /api/admin    /api/director    /api/staff    /api/student  │
└──────────────────────────┬──────────────────────────────────┘
                           │ pg (node-postgres)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     PostgreSQL Database                      │
│  users · events · event_registrations · training_programs   │
│  training_sessions · training_participants · attendance      │
│  performance · kits · kit_assignments · achievements        │
│  audit_logs                                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js, React Context API, Axios |
| **Backend** | Node.js, Express.js (MVC pattern) |
| **Database** | PostgreSQL (raw SQL via `node-postgres`) |
| **Authentication** | JSON Web Tokens (JWT), bcrypt |
| **Reporting** | CSV export via `json2csv`, PDF via browser print |
| **Dev Tools** | dotenv, nodemon, CORS |

---

## 👤 Role-Based Access

The system enforces strict role-based access control (RBAC) at both the frontend route level and every API endpoint.

```
Admin
  ├── Manage Director accounts (create, edit, delete)
  ├── View all Audit Logs (filter by role/date, export CSV)
  └── Monitor system-wide activity

Director
  ├── Manage Staff accounts
  ├── Create & manage Sports Events (internal/external)
  ├── View Achievement Records (Hall of Champions)
  └── Review Selection Reports

Staff
  ├── Manage Student profiles (CRUD)
  ├── Create & manage Training Programs and Sessions
  ├── Mark Attendance per session (bulk)
  ├── Record Performance metrics and ratings
  ├── Generate Selection Reports with configurable thresholds
  ├── Issue & manage Sports Kits
  ├── View Student Records & downloadable history reports
  └── Update Achievement Records

Student
  ├── Browse & register for Available Events
  ├── View My Registrations
  ├── Track My Training Programs and session details
  ├── View issued Sports Kits and request returns
  └── View personal Achievements
```

---

## 📦 Module Breakdown

### 🔐 Authentication (`/api/auth`)
- Role-selection login screen (Admin / Director / Staff / Student)
- JWT issued on successful login; stored client-side for session management
- Every protected route validates the token and checks role permissions

### 📅 Event Management (`/api/director/events`)
- Create internal/external events with title, description, date, and registration deadline
- Director-level CRUD; Staff can view events for training assignment
- Events feed directly into training program creation and student enrollment

### 🏋️ Training Management (`/api/staff/training-programs`)
- Create training programs linked to an event; sessions auto-generated per date range
- Students enrolled in the linked event are auto-added as participants
- Manage individual sessions (add, edit, delete)
- View per-program participant lists

### ✅ Attendance (`/api/staff/attendance`)
- Mark attendance per session with bulk save support
- Present/Absent toggle with optional remarks per student
- Attendance summary per program: total sessions, present count, percentage

### 📊 Performance (`/api/staff/performance`)
- Record metric value, unit, free-text notes, and numeric rating (1–10) per session per student
- Upsert design: re-entering performance for the same session/student updates the record
- Aggregate averages and bests computed at report generation

### 🏅 Selection Report (`/api/staff/selection`)
- Configurable thresholds: minimum attendance % and minimum average rating
- Selection score computed as: `(attendance% / 100 × 60) + (avg_rating / 10 × 40)`
- Students sorted by score; "recommended" flag applied automatically
- Per-student drill-down with full session history

### 🎽 Kit Management (`/api/staff/kits`)
- Kit types with stock tracking (total vs. issued)
- Issue kits to students with size, quantity, return deadline, and linked event
- Students can request returns; staff confirms receipt
- Overdue tracking with status indicators

### 🏆 Achievements (`/api/director/achievements`)
- Hall of Champions: medal tally (gold/silver/bronze), department leaderboard, top sports
- Log external competition results for students
- Historical achievement cards with event and student details

### 🗂️ Student Records (`/api/staff/students`)
- Comprehensive student profile (roll no., reg. no., department, batch, contact, status)
- Sports History Report: filterable by period (today / week / month / year / custom)
- Print and PDF download support

### 🪵 Audit Logs (`/api/admin/audit-logs`)
- Every CREATE, UPDATE, DELETE action logged with actor role, description, and timestamp
- Filter by role and date range; export as CSV

---

## 🗄️ Database Schema

Core tables and their relationships:

```sql
users            -- id, username, password (hashed), role, name, rollno,
                 --   reg_number, department, batch, email, phone,
                 --   gender, dob, blood_group, status, created_by

events           -- id, title, description, event_type, event_date,
                 --   last_registration_date, created_by, creator_role, status

event_registrations  -- id, student_id → users, event_id → events, registered_at

training_programs    -- id, event_id → events, title, from_date, to_date,
                     --   start_time, end_time, location, description, created_by

training_sessions    -- id, program_id → training_programs, session_date,
                     --   start_time, end_time, location, notes

training_participants -- program_id, student_id, added_by  [UNIQUE program+student]

attendance       -- id, session_id → training_sessions, student_id → users,
                 --   present (bool), remarks

performance      -- id, session_id, program_id, student_id, metric_value,
                 --   metric_unit, performance_text, rating  [UNIQUE session+student]

kit_types        -- id, name, category, description, total_stock
kit_assignments  -- id, kit_type_id, student_id, size, qty, issued_on,
                 --   return_by, event_id, status, issued_by

achievements     -- id, student_id, event_name, competition_level,
                 --   medal_type, sport, achieved_on

audit_logs       -- id, actor_id, actor_role, action, target_user_id,
                 --   target_role, description, created_at
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | All | Login and receive JWT |
| `POST` | `/api/auth/logout` | All | Logout |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/users` | List all users |
| `POST` | `/api/admin/create-director` | Create a director account |
| `PUT` | `/api/admin/update-director-password` | Reset director password |
| `DELETE` | `/api/admin/delete-director/:id` | Delete a director |
| `GET` | `/api/admin/audit-logs` | Fetch audit logs (filterable) |
| `GET` | `/api/admin/audit-logs/export` | Export audit logs as CSV |

### Director
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/director/create-staff` | Create a staff account |
| `GET` | `/api/director/staff` | List all staff |
| `DELETE` | `/api/director/delete-staff/:id` | Delete a staff member |
| `POST` | `/api/director/events` | Create a sports event |
| `GET` | `/api/director/events` | List all events |
| `PUT` | `/api/director/events/:id` | Update an event |
| `DELETE` | `/api/director/events/:id` | Delete an event |

### Staff (selected)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/staff/students` | Register a new student |
| `GET` | `/api/staff/students` | List students (filterable) |
| `POST` | `/api/staff/training-programs` | Create a training program |
| `POST` | `/api/staff/attendance/session/:id/bulk` | Bulk-save attendance |
| `GET` | `/api/staff/attendance/program/:id/summary` | Attendance summary |
| `POST` | `/api/staff/performance` | Record performance |
| `GET` | `/api/staff/selection/program/:id` | Selection report |
| `GET` | `/api/staff/student-records/:id` | Full student history |

### Student
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/student/events` | Browse available events |
| `POST` | `/api/student/events/:eventId/register` | Register for an event |
| `GET` | `/api/student/my-registrations` | View own registrations |
| `GET` | `/api/student/my-training` | View training programs |
| `GET` | `/api/student/my-kits` | View issued kits |

> All endpoints (except `/api/auth/login`) require `Authorization: Bearer <token>` in the request header.

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL 14+
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/sports-dept-management.git
cd sports-dept-management
```

### 2. Set Up the Database

```bash
psql -U postgres -c "CREATE DATABASE sports_dept;"
psql -U postgres -d sports_dept -f database/schema.sql
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:<password>@localhost:5432/sports_dept
JWT_SECRET=your_jwt_secret_key_here
BCRYPT_ROUNDS=10
```

### 4. Install Dependencies & Start Backend

```bash
cd backend
npm install
npm run dev        # starts with nodemon on port 5000
```

### 5. Install Dependencies & Start Frontend

```bash
cd frontend
npm install
npm start          # starts React dev server on port 3000
```

### 6. Seed Initial Admin Account

```bash
cd backend
node scripts/seedAdmin.js
```

> Default admin credentials — `username: admin` · `password: Admin@123` — **change immediately after first login.**

---


## 🔮 Future Enhancements

- **Advanced Analytics** — Chart.js / D3.js dashboards for performance trends and participation rates
- **Real-time Notifications** — Email alerts (Nodemailer) and SMS (Twilio) for event updates, registration confirmations, and overdue kit reminders
- **Mobile Application** — React Native app with offline support and QR-code attendance check-in
- **Database Optimization** — Composite indexes on frequently joined columns; Redis caching for common queries
- **PDF / Excel Export** — One-click export for any report with college letterhead
- **Machine Learning** — Predictive analytics to identify high-potential athletes based on historical performance trends
- **Multi-Factor Authentication** — OTP-based second factor for Admin and Director roles
- **Calendar Integration** — Sync training schedules and event deadlines with Google Calendar

---

## 📄 Project Report

This system was submitted as a B.E. Computer Science & Engineering final-year project to **Anna University, Chennai**, under the supervision of **Dr. D. Kesavaraja, M.E., Ph.D.**, Professor, Department of CSE, Dr. Sivanthi Aditanar College of Engineering, Tiruchendur.

---

## 📜 License

This project is developed for academic purposes. All rights reserved by the authors and Dr. Sivanthi Aditanar College of Engineering.

---

<div align="center">

Made with ❤️ by **Kumutha R** & **Pavithra S**

*Department of Computer Science and Engineering*
*Dr. Sivanthi Aditanar College of Engineering, Tiruchendur — 2026*

</div>
