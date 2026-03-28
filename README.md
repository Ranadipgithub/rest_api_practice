# Scalable REST API & React Dashboard

A production-ready full-stack application featuring a scalable Node.js/Express backend with MongoDB, JWT Authentication, Role-Based Access Control, and a premium React (Vite) frontend.

## 🚀 Features

### Backend
- **Node.js + Express** RESTful API with versioned routing (`/api/v1`)
- **MongoDB + Mongoose** schema validation and indexing
- **Automated API Documentation** via Swagger UI
- **JWT Authentication** and password hashing (bcryptjs)
- **Role-Based Access Control** (RBAC) - User vs Admin privileges
- **Security Middleware**: Helmet, Rate Limiting, Mongo Data Sanitization
- **Global Error Handling** with structured JSON responses
- **Input Validation** via express-validator

### Frontend
- **React + Vite** for blazing fast development
- **Context API** for global authentication state management
- **React Router** with protected routes
- **Axios Interceptors** for automatic token attachment
- **Premium UI** with dark-mode, glassmorphism cards, and dynamic micro-animations using Vanilla CSS
- **Lucide React** implementation for scalable SVG icons
- **Real-Time UI Updates** (status toggling, error alerts, badges)

---

## 🛠️ Project Structure

```text
├── server/                 # Backend API
│   ├── src/
│   │   ├── config/         # DB connection & Swagger setup
│   │   ├── controllers/    # API Route handlers
│   │   ├── middleware/      # Auth, RBAC, Validation, Errors
│   │   ├── models/         # Mongoose User & Task schema
│   │   └── routes/v1/      # API Endpoints
│   ├── .env
│   ├── server.js           # API Entry Point
│   └── package.json
└── client/                 # React Frontend
    ├── src/
    │   ├── context/        # AuthProvider context
    │   ├── pages/          # Login, Register, Dashboard
    │   ├── services/       # Axios API integration
    │   ├── App.jsx         # Routing configuration
    │   └── index.css       # Premium global styles
    └── package.json
```

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally (default: `mongodb://localhost:27017/scalable_rest_api`) or a MongoDB Atlas URI.

### 1. Setup Backend
```bash
cd server
npm install
npm run dev
```
The backend server will start at `http://localhost:5000`

### 2. Setup Frontend
```bash
cd client
npm install
npm run dev
```
The React app will run at `http://localhost:5173`

---

## 📚 API Documentation

Once the server is running, the **Swagger API Documentation** is accessible at:
👉 **[http://localhost:5000/api-docs](http://localhost:5000/api-docs)**

Includes full schema definitions and allows you to test endpoints interactively.

---

## 📈 Scalability Note

This project was built with scaling in mind:
1. **Microservices Architecture Potential**: The folder structure (`routes`, `controllers`, `models`) is decoupled. Currently a majestic monolith, it can be easily snapped into microservices (e.g., extracting an Auth service vs Task service).
2. **Database Indexing**: The `Task` model has compound indexes on `{ user: 1, status: 1 }` to support fast queries as data grows.
3. **Caching**: A Redis layer can easily be introduced to cache frequently accessed routes (e.g., `/api/v1/tasks`).
4. **Load Balancing & Docker**: The stateless JWT approach ensures the API can be horizontally scaled behind an Nginx load balancer or deployed across multiple stateless Docker containers via Kubernetes.
5. **Security**: Integrated security middleware (`helmet`, `express-rate-limit`, `express-mongo-sanitize`) protects against DDoS and NoSQL injection at scale.

---

*Built for the 3-day Full-Stack Assignment.*
