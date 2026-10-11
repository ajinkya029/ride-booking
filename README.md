# 🚗 Ride Booking Backend

A RESTful API backend for a ride-booking application built with **Node.js, Express.js, MongoDB, and Mongoose**. The application supports rider and driver accounts, ride requests, driver assignment, fare estimation, location updates, and ride lifecycle management.

## 🛠️ Tech Stack

<p align="left">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white" alt="Mongoose" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/REST_API-02569B?style=for-the-badge&logo=fastapi&logoColor=white" alt="REST API" />
  <img src="https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white" alt="npm" />
</p>

## ✨ Features

- **Authentication & Authorization**
  - User registration and login.
  - JWT-based authentication.
  - Password hashing with bcrypt.
  - Role-based access control for riders and drivers.

- **Ride Management**
  - Create ride requests with pickup and destination details.
  - Accept rides as a driver.
  - Start and complete trips.
  - Cancel eligible rides.
  - View ride details and ride history.

- **Driver Management**
  - Toggle driver availability.
  - Update driver coordinates.
  - Find nearby available drivers using MongoDB geospatial queries.
  - Support for bike, auto, car, and premium vehicle categories.

- **Fare Estimation**
  - Calculate fares based on base fare, distance, and duration.
  - Configure pricing through environment variables.

- **Security & Reliability**
  - Centralized error handling.
  - Request rate limiting.
  - Helmet security headers.
  - CORS configuration.
  - Input validation and protected routes.

## 📁 Project Structure

```text
ride-booking/
├── docs/
│   └── API_EXAMPLES.md
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── driverController.js
│   │   └── rideController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   └── Ride.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── driverRoutes.js
│   │   └── rideRoutes.js
│   ├── utils/
│   │   ├── asyncHandler.js
│   │   └── fare.js
│   ├── app.js
│   ├── seed.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## ⚙️ Getting Started

### Prerequisites

Install the following before running the project:

- [Node.js](https://nodejs.org/) — version 18.17 or later.
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account.
- [Git](https://git-scm.com/) (optional, for cloning the repository).

### 1. Clone the Repository

```bash
git clone https://github.com/ajinkya029/ride-booking.git
cd ride-booking
```

Replace `YOUR_USERNAME` with your GitHub username and update the repository URL if your repository has a different name.

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory by copying `.env.example`.

**Windows Command Prompt:**

```cmd
copy .env.example .env
```

**PowerShell / macOS / Linux:**

```bash
cp .env.example .env
```

Update the `.env` file:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://127.0.0.1:27017/ride_booking

JWT_SECRET=replace_this_with_a_long_random_secret
JWT_EXPIRES_IN=7d

CLIENT_ORIGIN=http://localhost:5173

BASE_FARE=40
PRICE_PER_KM=12
PRICE_PER_MINUTE=1.5
```

**Important:** Use a strong, unique JWT secret and never commit your `.env` file to GitHub.

For MongoDB Atlas, replace `MONGODB_URI` with your database connection string.

### 4. Start the Server

Run the development server:

```bash
npm run dev
```

Or run it in production mode:

```bash
npm start
```

The API will be available at:

```text
http://localhost:5000
```

### 5. Verify the Server

Open the following endpoint in your browser or API client:

```http
GET http://localhost:5000/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "Ride Booking API is running"
}
```

## 🔐 Authentication

Protected endpoints require a JWT access token in the request header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

Register a rider:

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "name": "Asha Rider",
  "email": "asha@example.com",
  "password": "SecurePass123!",
  "role": "rider"
}
```

Register a driver:

```json
{
  "name": "Rahul Driver",
  "email": "rahul@example.com",
  "password": "SecurePass123!",
  "role": "driver",
  "vehicle": {
    "type": "car",
    "make": "Hyundai",
    "model": "i20",
    "plateNumber": "MH01AB1234"
  }
}
```

Log in:

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "asha@example.com",
  "password": "SecurePass123!"
}
```

The response includes a JWT token and user details.

## 📡 API Endpoints

All request and response bodies use JSON unless otherwise specified.

### Authentication

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a rider or driver |
| POST | `/api/auth/login` | Public | Authenticate a user |
| GET | `/api/auth/me` | Authenticated | Get the current user |

### Driver Management

| Method | Endpoint | Access | Description |
|---|---|---|---|
| PATCH | `/api/drivers/availability` | Driver | Update availability |
| PATCH | `/api/drivers/location` | Driver | Update current location |
| GET | `/api/drivers/nearby?lng=72.8777&lat=19.0760` | Authenticated | Find nearby available drivers |

Update driver location:

```json
{
  "coordinates": [72.8777, 19.0760]
}
```

Coordinates use the GeoJSON order **[longitude, latitude]**.

Update availability:

```json
{
  "isAvailable": true
}
```

### Ride Management

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/rides/estimate` | Authenticated | Estimate the fare |
| POST | `/api/rides` | Rider | Create a ride request |
| GET | `/api/rides/my` | Rider / Driver | View ride history |
| GET | `/api/rides/:id` | Ride participant | Get ride details |
| PATCH | `/api/rides/:id/accept` | Driver | Accept a ride |
| PATCH | `/api/rides/:id/start` | Assigned driver | Start a ride |
| PATCH | `/api/rides/:id/complete` | Assigned driver | Complete a ride |
| PATCH | `/api/rides/:id/cancel` | Ride participant | Cancel an eligible ride |

### Create a Ride

```http
POST /api/rides
Authorization: Bearer YOUR_RIDER_TOKEN
Content-Type: application/json
```

Example request body:

```json
{
  "pickup": {
    "address": "Gateway of India, Mumbai",
    "coordinates": [72.8347, 18.9220]
  },
  "destination": {
    "address": "Bandra Station, Mumbai",
    "coordinates": [72.8402, 19.0544]
  },
  "distanceKm": 16.2,
  "durationMinutes": 42,
  "vehicleType": "car",
  "paymentMethod": "upi"
}
```

Supported vehicle types:

- `bike`
- `auto`
- `car`
- `premium`

Supported payment methods:

- `cash`
- `card`
- `upi`

### Fare Calculation

The fare is calculated using the configured pricing values:

```text
Fare = Base Fare + (Distance × Price per KM)
                     + (Duration × Price per Minute)
```

With the default configuration:

```text
Base Fare      = ₹40
Price per KM   = ₹12
Price per Min  = ₹1.50
```

The fare is calculated by the backend when creating a ride. The estimate endpoint returns a fare breakdown.

> For production, calculate route distance and duration on the server using a trusted mapping provider instead of accepting client-supplied values.

## 🔄 Ride Lifecycle

```text
              ┌─────────────┐
              │  Requested  │
              └──────┬──────┘
                     │ Driver accepts
                     ▼
              ┌─────────────┐
              │   Accepted  │
              └──────┬──────┘
                     │ Driver starts
                     ▼
              ┌─────────────┐
              │ In Progress │
              └──────┬──────┘
                     │ Driver completes
                     ▼
              ┌─────────────┐
              │  Completed  │
              └─────────────┘

    Requested / Accepted ──────► Cancelled
```

Ride status values:

- `requested`
- `accepted`
- `in_progress`
- `completed`
- `cancelled`

Only the assigned driver can start or complete a ride. Cancellation is allowed while a ride is requested or accepted.

## 🧪 Demo Data

The project includes a seed script to create sample rider and driver accounts.

Run:

```bash
npm run seed
```

Demo credentials:

| Role | Email | Password |
|---|---|---|
| Rider | `rider@example.com` | `Rider123!` |
| Driver | `driver@example.com` | `Driver123!` |

The seed script deletes and recreates these two demo accounts. Use it only with a development database, never a production database.

## 🧰 Testing the API

You can test endpoints using [Postman](https://www.postman.com/) or [Thunder Client](https://www.thunderclient.com/).

Recommended testing workflow:

1. Register a rider and a driver.
2. Log in and copy each user's JWT token.
3. Update the driver's location.
4. Set the driver as available.
5. Create a ride request using the rider token.
6. Accept the ride using the driver token.
7. Start and complete the ride using the assigned driver's token.
8. Check ride history using the appropriate account.

Additional `curl` examples are available in [`docs/API_EXAMPLES.md`](docs/API_EXAMPLES.md).

## 🔒 Security Considerations

- Passwords are hashed with bcrypt before storage.
- JWTs protect private endpoints.
- Role-based middleware restricts driver and rider actions.
- Helmet adds common HTTP security headers.
- Rate limiting helps reduce excessive API requests.
- Environment variables keep secrets and configuration outside source code.
- Centralized error handling standardizes API error responses.

## 🚀 Future Improvements

- Real-time driver tracking using Socket.IO.
- Maps and directions integration.
- Online payments through a payment gateway.
- Push notifications and SMS updates.
- Ride ratings and reviews.
- Driver verification and document uploads.
- Refresh tokens and session management.
- Automated unit and integration tests.
- Deployment with Docker and a cloud hosting provider.

## ⚠️ Limitations

This repository provides the backend foundation for a MERN ride-booking application. It does not include a React frontend, real-time socket communication, a payment gateway, or a live maps provider.

The project should be further tested and hardened before production deployment, especially around concurrent driver assignment, pricing validation, authorization, and operational monitoring.

## 👨‍💻 Author

**Ajinkya Dhatrak**

GitHub: [@ajinkya029](https://github.com/ajinkya029)

---

⭐ If you find this project useful, consider giving the repository a star!
