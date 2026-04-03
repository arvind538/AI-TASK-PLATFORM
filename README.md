# 🤖 TaskAI — AI Task Processing Platform

A full-stack MERN application for creating and managing AI text-processing tasks with real-time status tracking, background job processing, and JWT authentication.

---

## ✨ Features

- 🔐 **JWT Authentication** — Register & Login with bcrypt password hashing
- ✅ **Task Management** — Create, run, delete tasks
- ⚡ **Background Processing** — Async Node.js worker processes tasks in the background
- 📊 **Real-time Status** — Dashboard auto-polls for live status updates (pending → running → success/failed)
- 📋 **Live Logs** — View execution logs per task with timestamps
- 🔍 **Filter & Paginate** — Filter tasks by status; paginated results
- 🛡️ **Security** — Helmet, rate limiting, CORS, no hardcoded secrets

---

## 🛠️ Tech Stack

| Layer     | Technology                       |
|-----------|----------------------------------|
| Frontend  | React 18, Tailwind CSS, Vite     |
| Backend   | Node.js, Express.js              |
| Database  | MongoDB + Mongoose               |
| Auth      | JWT + bcryptjs                   |
| Security  | Helmet, express-rate-limit, CORS |

---

## 📁 Project Structure

```
ai-task-platform/
├── client/                    # React frontend
│   ├── src/
│   │   ├── api/axios.js       # Axios instance with JWT interceptor
│   │   ├── context/           # AuthContext (global auth state)
│   │   ├── pages/             # Login, Register, Dashboard
│   │   └── components/        # Navbar, TaskCard, Modals
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── server/                    # Node.js + Express backend
    └── src/
        ├── config/db.js       # MongoDB connection
        ├── middleware/         # JWT auth, rate limiter
        ├── models/            # User, Task schemas
        ├── routes/            # auth.js, tasks.js
        ├── worker/            # processor.js (background queue)
        └── index.js           # Express server entry
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **MongoDB** — Local install or [MongoDB Atlas](https://www.mongodb.com/atlas) (free)
- **npm** or **yarn**

---

### Step 1 — Clone & Install

```bash
# Clone the project
git clone <your-repo-url>
cd ai-task-platform

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

---

### Step 2 — Configure Backend Environment

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ai-task-platform
JWT_SECRET=change_this_to_a_long_random_secret_string
JWT_EXPIRE=7d
NODE_ENV=development
```

> **MongoDB Atlas?** Replace `MONGO_URI` with your Atlas connection string:
> `mongodb+srv://<user>:<password>@cluster.mongodb.net/ai-task-platform`

---

### Step 3 — Run the Application

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
# Server running at http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
# Frontend running at http://localhost:5173
```

Open your browser at **http://localhost:5173** 🎉

---

## 📡 API Endpoints

### Auth Routes (`/api/auth`)

| Method | Route         | Description           | Auth |
|--------|---------------|-----------------------|------|
| POST   | `/register`   | Create new account    | ❌   |
| POST   | `/login`      | Login and get token   | ❌   |
| GET    | `/me`         | Get current user info | ✅   |

### Task Routes (`/api/tasks`)

| Method | Route           | Description              | Auth |
|--------|-----------------|--------------------------|------|
| GET    | `/`             | Get all tasks (paginated)| ✅   |
| POST   | `/`             | Create new task          | ✅   |
| GET    | `/:id`          | Get single task          | ✅   |
| POST   | `/:id/run`      | Run/queue a task         | ✅   |
| GET    | `/:id/logs`     | Get task execution logs  | ✅   |
| DELETE | `/:id`          | Delete a task            | ✅   |

---

## ⚙️ Supported Operations

| Operation   | Description                              |
|-------------|------------------------------------------|
| `uppercase` | Converts input text to UPPERCASE         |
| `lowercase` | Converts input text to lowercase         |
| `reverse`   | Reverses the entire input string         |
| `wordcount` | Counts words and characters in the text  |

---

## 🔄 Task Lifecycle

```
User clicks Run
      │
      ▼
  status: "pending"  ← Task created & queued
      │
      ▼ (Node.js worker picks it up)
  status: "running"  ← Worker is processing
      │
      ├──► status: "success"  ← Result saved, logs updated
      │
      └──► status: "failed"   ← Error saved in logs
```

---

## 🔒 Security Implemented

- Passwords hashed with **bcryptjs** (12 salt rounds)
- **JWT tokens** expire in 7 days
- **Helmet** sets secure HTTP headers
- **Rate limiting** — 20 req/15 min on auth, 100 req/min on API
- **No hardcoded secrets** — all via `.env`
- CORS restricted to frontend origin

---

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| `MongoDB connection failed` | Check MONGO_URI in `.env`, ensure MongoDB is running |
| `Port already in use` | Change `PORT` in `.env` (backend) or update `vite.config.js` |
| `CORS error` | Make sure `CLIENT_URL` in `.env` matches your frontend URL |
| Tasks stuck on "pending" | Server restart — the in-memory queue resets on restart |

---

## 📝 Notes

- The background worker uses an **in-memory queue** (no Redis needed). If the server restarts, in-flight tasks revert — re-run them manually.
- For production, replace with **BullMQ + Redis** for persistent queuing.
