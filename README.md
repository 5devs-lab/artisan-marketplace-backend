# Artisan Service Marketplace - Backend

A professional, security-hardened backend for a hyper-local artisan marketplace, built with TypeScript and Express.

## 🚀 Tech Stack
- **Core**: Node.js, Express, TypeScript
- **Database**: MongoDB (Mongoose)
- **Authentication**: Kroxt Auth (v1.3.10)
- **Security**: JWT, HTTP-Only Cookies, Brute-Force Protection, Helmet, CORS
- **Documentation**: Swagger/OpenAPI 3.0
- **Validation**: Strict environment variable validation

## 🛠️ Getting Started

### Prerequisites
- Node.js (v24+)
- MongoDB (Running locally or via Atlas)

### Setup
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env`.
   - Update `MONGO_URI`, `JWT_SECRET`, and `JWT_PEPPER`.

### Development
Start the server in watch mode:
```bash
npm run dev
```

### Production Build
Build the TypeScript source:
```bash
npm run build
```

---

## 📖 API Documentation
Once the server is running, you can explore the interactive API documentation at:
- **`http://localhost:5000/api-docs`**

The documentation is modular and covers:
- **Auth**: Register, Login, Logout, Refresh, Change Password
- **Users**: Profile management (/me)
- **Health**: System status checks

## 🏗️ Architecture
The project follows a **Feature-Based Folder Structure**:
- `src/features/auth/`: Identity management and session rotation.
- `src/features/user/`: Profile-specific logic and domain models.
- `src/features/health/`: System monitoring.
- `src/config/`: Centralized configuration (Auth, DB, Env, Swagger).
- `src/middlewares//`: Global guards and protection.

---

## 🔒 Security Features
- **Hash-Linked Revocation**: Password changes globally invalidate all other active sessions.
- **Secure Sessions**: Refresh tokens are stored in `HttpOnly`, `SameSite=Strict` cookies.
- **CSRF Mitigation**: Proper CORS and secure cookie configuration.
- **Credential Protection**: Sensitive fields like `passwordHash` are stripped from all API responses.
