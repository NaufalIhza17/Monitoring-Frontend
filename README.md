# Staff Monitoring — Frontend

React + Vite application for the Staff Monitoring system. Provides role-based dashboards for Staff, HRD, and Admin.

---

## Tech Stack

| Purpose          | Library                      |
| ---------------- | ---------------------------- |
| Framework        | React 19 + Vite (TypeScript) |
| Styling          | Tailwind CSS v4              |
| UI Components    | shadcn/ui                    |
| Routing          | React Router v6              |
| HTTP Client      | Axios                        |
| State Management | Zustand (persisted)          |
| Charts           | Recharts (via shadcn)        |
| Forms            | React Hook Form              |

---

## Prerequisites

- Node.js 18+
- Backend server running on `http://localhost:3000`

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

App runs at `http://localhost:5173`

### Environment

No `.env` required for local development. API calls are proxied to `http://localhost:3000` via Vite's proxy config in `vite.config.ts`.

---

## Project Structure

```
src/
├── assets/
├── components/
│   ├── common/
│   ├── layout/          # Sidebar, SidebarLayout
│   └── ui/              # shadcn components
├── features/
│   ├── auth/            # LoginPage
│   ├── dashboard/       # DashboardPage + ClockInOut, WorkTimer, BreakTimer
│   ├── history/         # HistoryPage
│   ├── team/            # TeamPage
│   ├── approvals/       # ApprovalsPage (HRD + Admin)
│   ├── manage/          # ManagePage, UserFormModal, ChangePasswordModal
│   └── not-found/       # 404 page
├── lib/
│   └── axios.ts         # Axios instance with JWT interceptor
├── routes/
│   ├── AppRouter.tsx
│   └── ProtectedRoute.tsx
├── store/
│   └── authStore.ts     # Zustand auth store (persisted to localStorage)
└── types/
    ├── user.types.ts
    └── attendance.types.ts
```

---

## Roles & Pages

| Page      | Staff       | HRD                | Admin            |
| --------- | ----------- | ------------------ | ---------------- |
| Dashboard | ✅          | ✅                 | ✅ (no clock in) |
| History   | ✅ personal | ✅ personal + team | ❌               |
| Team      | ✅          | ✅                 | ✅               |
| Approvals | ❌          | ✅                 | ✅               |
| Manage    | ❌          | ✅ staff only      | ✅ all users     |

---

## Key Features

**Authentication** — JWT stored in Zustand + localStorage. Auto-redirects based on role on login.

**Clock In/Out** — Staff upload a proof photo on clock in. Status becomes `pending` until HRD approves. HRD is auto-approved. 8-hour countdown timer starts immediately after clock in regardless of approval status.

**Break Tracking** — Max 1 hour total break per day. Break progress bar shown in real time.

**Approvals** — HRD can view proof photos in a modal, approve (moves photo to `/uploads/approved`) or deny (deletes photo, prompts staff to resubmit).

**Team Page** — Live grid of all users with work status indicator dots.

**History** — Personal table for all roles. HRD sees an additional team-wide history table.

**Charts** — Donut chart on dashboard showing working days, working hours, and overtime.

---

## Demo

### Staff

<!-- Add screenshot or screen recording here -->

### HRD

<!-- Add screenshot or screen recording here -->

### Admin

https://github.com/user-attachments/assets/ea9992d5-82ca-4720-9571-070bda1fece9





---

## Running with Docker

If you want to run the full stack (frontend + backend + database) together, create a `docker-compose.yml` in your root folder with both repos cloned alongside each other:

```
root/
├── monitoring-app-react/     ← this repo
├── monitoring-app-nest/      ← backend repo
└── docker-compose.yml        ← create this
```

```yaml
services:
  frontend:
    build:
      context: ./monitoring-app-react
    container_name: monitoring_frontend
    ports:
      - "5173:5173"
    volumes:
      - ./monitoring-app-react:/app
      - /app/node_modules
    command: npm run dev -- --host
    depends_on:
      - backend

  backend:
    build:
      context: ./monitoring-app-nest
    container_name: monitoring_backend
    ports:
      - "3000:3000"
    volumes:
      - ./monitoring-app-nest:/app
      - ./monitoring-app-nest/uploads:/app/uploads
      - /app/node_modules
    command: npm run start:dev
    environment:
      DB_HOST: mysql
      DB_PORT: 3306
      DB_USERNAME: root
      DB_PASSWORD: yourpassword
      DB_NAME: monitoring_app
      JWT_SECRET: your_jwt_secret_here
    depends_on:
      - mysql

  mysql:
    image: mysql:8.0
    container_name: monitoring_mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: yourpassword
      MYSQL_DATABASE: monitoring_app
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

Then run:

```bash
docker-compose up -d --build
```

---

## Credits

Built by **[Mochammad Naufal Ihza Syahzada]** with AI assistance from [Claude](https://claude.ai) and [ChatGPT](https://chatgpt.com).
