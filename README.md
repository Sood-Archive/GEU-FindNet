# GEU FindNet

A lost & found web application for Graphic Era University students. Students can report lost or found items, get matched with potential owners, and verify their identity via OTP email verification.

---

## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | React 19, TypeScript, Vite, React Router |
| Backend  | Spring Boot 4, Java 17, Spring Data JPA |
| Database | H2 (file-based, embedded)               |
| Email    | SendGrid (SMTP via Spring Mail)         |

---

## Project Structure

```
findnet/
├── backend/          # Spring Boot REST API
│   └── src/main/java/com/geu/findnet/
│       ├── controller/   # AuthController, ItemController, AdminController
│       ├── service/      # AuthService, OtpService, MatchEngineService, NLPService
│       ├── entity/       # User, Item, ActivityLog
│       ├── repository/   # JPA repositories
│       └── dto/          # LoginRequest, RegisterRequest, OtpVerifyRequest
└── frontend/         # React + TypeScript SPA
    └── src/
        ├── pages/        # LoginPage, RegisterPage, Dashboard, AdminDashboard
        └── AuthContext.tsx
```

---

## Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- A [SendGrid](https://sendgrid.com) account with a verified sender email

### Backend

1. Set your SendGrid API key as an environment variable:

   ```bash
   export SENDGRID_API_KEY=your_sendgrid_api_key
   ```

2. Run the backend:

   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

   The API starts at `http://localhost:8080`.  
   H2 console is available at `http://localhost:8080/h2-console`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app starts at `http://localhost:5173`.

---

## API Endpoints

### Auth

| Method | Endpoint                        | Description                        |
|--------|---------------------------------|------------------------------------|
| POST   | `/api/auth/register`            | Register a new student account     |
| POST   | `/api/auth/login`               | Login (requires verified email)    |
| POST   | `/api/auth/verify-otp`          | Verify email with OTP              |
| POST   | `/api/auth/resend-otp?email=..` | Resend OTP to college email        |

### Items

| Method | Endpoint                              | Description                  |
|--------|---------------------------------------|------------------------------|
| POST   | `/api/items/report?userId=..`         | Report a lost or found item  |
| GET    | `/api/items/my-activity?userId=..`    | Get user's activity timeline |

### Admin

| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| GET    | `/api/admin/accounts`     | List all user accounts   |
| POST   | `/api/admin/accounts`     | Create an account        |
| DELETE | `/api/admin/accounts/:id` | Delete an account        |
| GET    | `/api/admin/logs?category=ALL` | View activity logs  |

---

## Registration & OTP Flow

1. Student registers with their `@geu.ac.in` college email.
2. A 6-digit OTP is sent to that email (valid for 10 minutes).
3. Student submits the OTP via the verify screen.
4. Once verified, the student can log in.
5. Unverified accounts are blocked from logging in.
6. OTP can be resent if expired.

---

## Roles

- `USER` — regular student, can report lost/found items and view their activity.
- `ADMIN` — access to admin dashboard; manage accounts and view all activity logs. Default admin credentials: `admin@geu.ac.in` / `admin1234`.

---

## Environment Variables

| Variable          | Description                        |
|-------------------|------------------------------------|
| `SENDGRID_API_KEY` | Your SendGrid API key for sending OTP emails |

---

## Notes

- Passwords are stored in plain text currently — add `BCryptPasswordEncoder` before deploying to production.
- The H2 database persists to `backend/data/findnet.mv.db`.
- CORS is configured for `http://localhost:5173` (Vite dev server).
