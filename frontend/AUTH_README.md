# MuscleFit Gym - Authentication System

## Overview
Complete authentication system with visitor registration, multi-method login (Email/OTP/Google OAuth), and role-based routing.

---

## Routes

### Public Routes
- `/` — Public portal (gym info, plans, batches, demo booking)
- `/login` — Login page (3 tabs: Email / OTP / Staff)
- `/register` — Visitor registration (3-step form)
- `/oauth2/callback` — Google OAuth redirect handler

### Protected Routes (Token-based)
- `/home` — Visitor landing page after login
- `/complete-profile` — Profile completion for new Google OAuth users

### Protected Routes (Role-based via AuthContext)
- `/admin-dashboard` — Admin dashboard (role: admin)
- `/member-dashboard/:memberId` — Member dashboard (role: member)
- `/trainer/dashboard` — Trainer dashboard (role: trainer)

---

## Login Methods

### 1. Email + Password (Visitor)
- **Endpoint:** `POST /api/auth/visitor/login`
- **Body:** `{ email, password }`
- **Response:** `{ visitorId, email, name, role, token }`
- **Redirect:** `/home`

### 2. Email + Password (Staff/Admin/Member)
- **Endpoint:** `POST /api/auth/member/login`
- **Body:** `{ email, password }`
- **Response:** `{ id, email, name, role, token }`
- **Redirect:** Based on role (admin → `/admin-dashboard`, member → `/member-dashboard`, trainer → `/trainer/dashboard`)

### 3. OTP Login
- **Step 1 — Send OTP:** `POST /api/auth/otp/send` → `{ phone }`
- **Step 2 — Verify OTP:** `POST /api/auth/otp/verify` → `{ phone, otp }`
- **Response:** `{ id, email, name, role, token }`
- **Redirect:** Based on role

### 4. Google OAuth2
- **Trigger:** `window.location.href = 'http://localhost:8080/oauth2/authorization/google'`
- **Backend redirects to:** `http://localhost:3000/oauth2/callback?token=...&visitorId=...&name=...&email=...&role=...&isNewVisitor=true/false`
- **Redirect:** If `isNewVisitor=true` → `/complete-profile`, else → `/home`

---

## Registration

### Visitor Registration
- **Endpoint:** `POST /api/auth/visitor/register`
- **3-Step Form:**
  1. **Basic Info:** name, email, password (optional), phone
  2. **Gym Preferences:** gymCenter, city, state, inquirySource, preferredBatches (array), interestedMembershipPlanId
  3. **Interests:** demoDatePreference, demoTimeSlotPreference, eventInterest (array), costumeInterest (boolean)
- **Auto-login:** If password provided, auto-login after registration
- **Redirect:** `/home` or `/login`

---

## API Setup

### Axios Instance (`src/api/axios.js`)
- **Base URL:** `http://localhost:8080`
- **Request Interceptor:** Attaches `Authorization: Bearer <token>` from localStorage
- **Response Interceptor:** On 401 → clears localStorage and redirects to `/login`

### Auth Service (`src/api/authService.js`)
- `visitorRegister(data)` — Register visitor
- `visitorLogin(email, password)` — Visitor login
- `memberLogin(email, password)` — Staff/Admin/Member login
- `sendOtp(phone)` — Send OTP
- `verifyOtp(phone, otp)` — Verify OTP
- `completeProfile(visitorId, data)` — Update visitor profile
- `storeAuth({ token, role, name, email, visitorId, id })` — Persist auth data to localStorage
- `getRoleRedirect(role)` — Get redirect path based on role

---

## Components

### PrivateRoute (`src/components/PrivateRoute.jsx`)
- Checks for `token` in localStorage
- If no token → redirects to `/login`
- Used for visitor-only routes (`/home`, `/complete-profile`)

### ProtectedRoute (`src/ProtectedRoute.jsx`)
- Uses `AuthContext` for role-based protection
- Checks `user.role` matches required role
- Used for admin/member/trainer routes

---

## File Structure

```
src/
  api/
    axios.js              # Axios instance with interceptors
    authService.js        # Auth API calls + helpers
  components/
    PrivateRoute.jsx      # Token-based route guard
  pages/
    Login.jsx             # 3-tab login (Email/OTP/Staff) + Google OAuth
    Register.jsx          # 3-step visitor registration
    OAuth2Callback.jsx    # Google OAuth redirect handler
    Home.jsx              # Visitor landing page
    CompleteProfile.jsx   # Profile completion for new OAuth users
    Auth.css              # Shared auth page styles
  PublicPortal.jsx        # Public landing page
  PublicPortal.css        # Public portal styles
  main.jsx                # Router configuration
```

---

## LocalStorage Keys

After successful login, the following keys are stored:
- `token` — JWT token
- `role` — User role (VISITOR, MEMBER, ADMIN, TRAINER)
- `name` — User name
- `email` — User email
- `visitorId` — Visitor ID (or member ID)

---

## Testing

1. **Start backend:** Ensure Spring Boot services are running on `http://localhost:8080`
2. **Start frontend:** `npm run dev` (Vite dev server on `http://localhost:3000`)
3. **Test flows:**
   - Public portal → `/`
   - Visitor registration → `/register`
   - Email login → `/login` (Email tab)
   - OTP login → `/login` (OTP tab)
   - Staff login → `/login` (Staff tab)
   - Google OAuth → Click "Login with Google" button
   - Complete profile → After Google OAuth with `isNewVisitor=true`

---

## Notes

- Password is **optional** during registration (visitors can login via OTP or Google later)
- All API errors are displayed inline (no alerts)
- Google OAuth requires backend to be configured with Google OAuth2 credentials
- OTP verification in dev mode returns OTP hint in response string for testing
- Role-based redirects ensure users land on the correct dashboard after login
