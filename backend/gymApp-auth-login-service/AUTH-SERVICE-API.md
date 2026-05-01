# gymApp-auth-login-service — API Reference

**Base URL:** `http://localhost:2000`  
**Auth:** All protected endpoints require `Authorization: Bearer <token>` header.

---

## 1. Login

### POST `/api/auth/login`
**Auth:** Public

**Request Body:**
```json
{
  "email": "john@gym.com",
  "password": "secret123"
}
```

**Response `200`:**
```json
{
  "memberId": 1,
  "email": "john@gym.com",
  "name": "John Doe",
  "role": "MEMBER",
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

> Role can be `ADMIN`, `TRAINER`, `MEMBER`, or `VISITOR`.

---

## 2. Registration

### POST `/api/auth/visitor/register`
**Auth:** Public — visitor self-registers from the gym portal

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@gmail.com",
  "phone": "9876543210",
  "gymCenter": "Pixelbloom Fitness",
  "preferredBatches": [
    { "batchType": "ZUMBA", "timeSlot": "07:00-08:00" },
    { "batchType": "YOGA",  "timeSlot": "06:00-07:00" }
  ]
}
```

**Response `200`:**
```json
{
  "visitorId": 5,
  "status": "VISITOR",
  "name": "Jane Smith",
  "email": "jane@gmail.com",
  "phone": "9876543210",
  "gymCenter": "Pixelbloom Fitness",
  "preferredBatches": [
    { "batchType": "ZUMBA", "timeSlot": "07:00-08:00" },
    { "batchType": "YOGA",  "timeSlot": "06:00-07:00" }
  ]
}
```

---

### POST `/api/auth/admin/register`
**Auth:** Public — first-time setup only (lock down after first admin is created)

**Request Body:**
```json
{
  "name": "Admin User",
  "email": "admin@gym.com",
  "phone": "9000000001",
  "gymCenter": "Pixelbloom Fitness",
  "password": "adminPass@123"
}
```

**Response `200`:**
```
"Admin registered successfully"
```

---

### POST `/api/auth/admin/register-trainer`
**Auth:** `ADMIN` only

**Request Body:**
```json
{
  "name": "Trainer Raj",
  "email": "raj@gym.com",
  "phone": "9000000002",
  "password": "trainerPass@123",
  "gymCenter": "Pixelbloom Fitness"
}
```

**Response `200`:**
```
"Trainer registered successfully"
```

---

### POST `/api/auth/convert-to-member`
**Auth:** `ADMIN` or `TRAINER`

Converts an existing Visitor to a Member after in-gym registration is complete.  
Member is created with status `INACTIVE` — `gymApp-core-service` sets it to `ACTIVE` after membership payment.

**Request Body:**
```json
{
  "visitorId": 5,
  "password": "memberPass@123",
  "gymCenter": "Pixelbloom Fitness"
}
```

**Response `200`:**
```json
{
  "memberId": 12,
  "name": "Jane Smith",
  "email": "jane@gmail.com",
  "phone": "9876543210",
  "gymCenter": "Pixelbloom Fitness",
  "role": "MEMBER",
  "memberStatus": "INACTIVE",
  "preferredBatches": [
    { "batchType": "ZUMBA", "timeSlot": "07:00-08:00" }
  ],
  "joinedAt": "2026-03-21T10:30:00",
  "message": "Member created successfully. Status will become ACTIVE after membership purchase."
}
```

---

### PATCH `/api/auth/members/{memberId}/status?status={status}`
**Auth:** `ADMIN` only — called internally by `gymApp-core-service` after membership payment

**Path Param:**

| Param | Type | Description |
|---|---|---|
| `memberId` | Long | ID of the member to update |

**Query Param:**

| Param | Type | Values |
|---|---|---|
| `status` | Enum | `INACTIVE` \| `ACTIVE` \| `SUSPENDED` |

**No request body.**

**Response `200`:**
```
"Member 12 status updated to ACTIVE"
```

---

## 3. Google OAuth2

### GET `/oauth2/authorization/google`
**Auth:** Public — browser redirect, not a direct REST call

Initiates the Google OAuth2 login flow. Spring Security handles this automatically.

#### Flow Diagram

```
Frontend                     Backend                        Google
   |                            |                              |
   |-- redirect browser to ---->|                              |
   |  /oauth2/authorization/    |                              |
   |  google                    |-- redirect to Google ------->|
   |                            |                              |
   |                            |<-- user approves, code sent -|
   |                            |                              |
   |                            |-- exchanges code for token   |
   |                            |-- OAuth2SuccessHandler fires |
   |<-- JSON { token, userId } -|                              |
```

#### Step-by-step Flow

**Step 1 — Frontend triggers Google login**

Do NOT use `fetch`/`axios`. Redirect the browser directly:
```js
window.location.href = 'http://localhost:2000/oauth2/authorization/google';
```

**Step 2 — Google authenticates the user**

Spring Security redirects to Google's consent screen automatically. User logs in with Gmail.

**Step 3 — Backend returns JSON directly**

After Google confirms, `OAuth2SuccessHandler` fires and writes JSON to the response — no redirect:

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "visitorId": 5,
  "name": "Jane Smith",
  "email": "jane@gmail.com",
  "role": "VISITOR",
  "providerType": "GOOGLE",
  "isNewVisitor": true
}
```

**Step 4 — Frontend reads the JSON and stores the token**

```js
const data = await response.json();

localStorage.setItem('token', data.token);
localStorage.setItem('visitorId', data.visitorId);

if (data.isNewVisitor) {
  // show complete-profile form (collect phone + gymCenter)
} else {
  // redirect to dashboard
}
```

**Step 5 — If new visitor, complete the profile**

Google only provides name + email. Collect phone and gymCenter from the user:
```js
fetch(`http://localhost:2000/api/auth/oauth2/complete-profile?visitorId=${data.visitorId}`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.token}`
  },
  body: JSON.stringify({
    phone: '9876543210',
    gymCenter: 'Pixelbloom Fitness'
  })
});
> Returning visitors (matched by `providerId` or email) get a fresh JWT with `isNewVisitor=false` — no profile completion needed.
```

**Step 6 — If new visitor, wants to book demo**

Google only provides name + email. Collect phone and gymCenter from the user:
```js
fetch(`http://localhost:2000/api/auth/oauth2//visitor/book-demo}`, {}
  ####if visitor has authenticated from google http://localhost:2000/oauth2/authorization/google  then again get that login token from google and use it 
{ "visitorId": 1, "couponCode": "FREEDEMO" }
{ "visitorId": 1, "couponCode": "HALF50" }
{ "visitorId": 1, "couponCode": "HALF50" }
coupoun Table in DB should have these entries 
INSERT INTO coupon (code, discount_type, discount_value, active) VALUES ('FREEDEMO', 'FLAT', 99, true);
INSERT INTO coupon (code, discount_type, discount_value, active) VALUES ('HALF50', 'PERCENT', 50, true);



```

**Step 7 - OPT Based login***
 POST /api/auth/otp/send      { "phone": "9876543210" }
→ generates 6-digit OTP, saves with 5min expiry

POST /api/auth/otp/verify    { "phone": "9876543210", "otp": "482910" }
→ validates OTP → finds user by phone (Member or Visitor) → returns JWT with correct role

```


#### Required `application.properties` config
```properties
spring.security.oauth2.client.registration.google.client-id=YOUR_GOOGLE_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_GOOGLE_CLIENT_SECRET
spring.security.oauth2.client.registration.google.scope=email,profile

app.oauth2.redirect-uri=http://localhost:3000/oauth2/callback
```

> In Google Cloud Console → Authorized redirect URIs, add:
> `http://localhost:2000/login/oauth2/code/google` (Spring's internal callback — not the frontend URL)

---

### PATCH `/api/auth/oauth2/complete-profile?visitorId={visitorId}`
**Auth:** `VISITOR` — use the token received from the OAuth2 redirect

Called by frontend after Google login to fill in phone and gymCenter (not provided by Google).

**Query Param:**

| Param | Type | Description |
|---|---|---|
| `visitorId` | Long | Visitor ID from the OAuth2 redirect |

**Request Body:**
```json
{
  "phone": "9876543210",
  "gymCenter": "Pixelbloom Fitness"
}
```

**Response `200`:**
```json
{
  "visitorId": 5,
  "status": "VISITOR",
  "name": "Jane Smith",
  "email": "jane@gmail.com",
  "phone": "9876543210",
  "gymCenter": "Pixelbloom Fitness",
  "preferredBatches": null
}
```

---

### GET `/api/auth/oauth2/failure`
**Auth:** Public — triggered automatically by Spring on OAuth2 failure

**Response `401`:**
```json
{
  "error": "Google login failed or was cancelled"
}
```

---

## 4. Role → Endpoint Access Matrix

| Endpoint | PUBLIC | VISITOR | MEMBER | TRAINER | ADMIN |
|---|:---:|:---:|:---:|:---:|:---:|
| `POST /api/auth/login` | ✅ | | | | |
| `POST /api/auth/visitor/register` | ✅ | | | | |
| `POST /api/auth/admin/register` | ✅ | | | | |
| `POST /api/auth/admin/register-trainer` | | | | | ✅ |
| `POST /api/auth/convert-to-member` | | | | ✅ | ✅ |
| `PATCH /api/auth/members/{id}/status` | | | | | ✅ |
| `PATCH /api/auth/oauth2/complete-profile` | | ✅ | | | |
| `GET /oauth2/authorization/google` | ✅ | | | | |
| `GET /api/auth/oauth2/failure` | ✅ | | | | |

---

## 5. Provider Type Reference

| `providerType` | Description |
|---|---|
| `EMAIL` | Manual registration via username/password |
| `GOOGLE` | Registered/logged in via Google OAuth2 |
| `GITHUB` | Reserved for future use |
| `FACEBOOK` | Reserved for future use |
| `TWITTER` | Reserved for future use |

---

## 6. Swagger UI

Available at: `http://localhost:2000/swagger-ui.html`

To test protected endpoints in Swagger:
1. Call `POST /api/auth/login` and copy the `token` from the response
2. Click **Authorize** (top right)
3. Enter `Bearer <token>` and confirm
