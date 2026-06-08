# MemoryMate Backend API

Node.js, Express.js, MongoDB, and JWT backend for MemoryMate.

## Setup

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Set `MONGO_URI` and `JWT_SECRET` in `.env` before starting.

## Base URL

```text
http://localhost:5000/api
```

Send JWT tokens with:

```text
Authorization: Bearer <token>
```

## Main Endpoints

Authentication:

```text
POST /auth/signup
POST /auth/login
GET  /auth/me
```

Patient profile:

```text
GET /patient/profile
PUT /patient/profile
```

Caregivers can access a linked patient by adding:

```text
?patientId=<patient-user-id>
```

Reminders:

```text
POST   /reminders
GET    /reminders
PUT    /reminders/:id
DELETE /reminders/:id
```

Family memory:

```text
POST   /family
GET    /family
PUT    /family/:id
DELETE /family/:id
```

Brain activity:

```text
POST /brain-activity
GET  /brain-activity
```

Emergency:

```text
GET  /emergency
POST /emergency/share-location
PUT  /emergency/:id
```

Notifications:

```text
GET /notifications
PUT /notifications/:id/read
```

Analytics:

```text
GET /analytics
```

## Notes

- Patient signup creates a patient profile automatically.
- Passwords are hashed with bcrypt.
- JWT middleware protects all patient data routes.
- Reminder updates create a missed-reminder notification when `missed` changes to `true`.
- Analytics returns medicine completion percentage, missed reminder count, and a weekly report.
