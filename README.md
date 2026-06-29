# Cinemagic - Movie Ticket Booking Platform

A premium, full-stack movie ticket booking web application designed with a BookMyShow-style user interface. It features real-time seat lock concurrency, secure payment flows, and an administrative control panel.

---

## 🚀 Key Features

*   **BookMyShow Visual Design:** Sleek, responsive crimson-accented interface with a full featured movie hero banner, movie catalog grid, horizontal showtimes selector, and custom digital tickets with bar codes.
*   **Real-Time Seat Concurrency:**
    *   **Live Status Polling:** The seat map page polls seat statuses every 3 seconds, instantly highlighting and disabling seats locked or booked by other users in real time.
    *   **Auto-Release Timeout:** Inactive or abandoned seat locks automatically expire and release back to "available" after 5 minutes.
*   **Secure Payment Integration:** Mock Razorpay payment checkout integration in the frontend, verified securely with payment signatures on the backend database.
*   **Administrative Control Panel:** A dedicated admin interface allowing authorized users to create movies (with poster uploads), theatres, screens, and schedule showtimes.
*   **User Authentication:** Complete user registration, login, and token-based state persistence using JSON Web Tokens (JWT).
*   **Pre-configured Seeder:** Includes a database seeding script to populate testing data immediately.

---

## 🛠️ Technology Stack

### Backend
*   **Runtime:** Node.js (v18+)
*   **Framework:** Express.js with TypeScript
*   **Database ORM:** Drizzle ORM
*   **Database:** PostgreSQL (Neon Postgres server)
*   **Security:** JSON Web Tokens (JWT) & bcryptjs passwords hashing
*   **Integrations:** ImageKit SDK (for poster storage), Razorpay SDK (payments checkout)

### Frontend
*   **Build Tool:** Vite
*   **Language:** Vanilla TypeScript (no bulky framework dependencies, loads under 100ms)
*   **Styling:** Custom CSS with CSS variables, responsive grids, and clean dark/light micro-animations.

---

## 📂 Project Structure

```
ticket_app/
├── client/                 # Frontend Vite project
│   ├── index.html          # HTML entry point (contains Razorpay Checkout script)
│   ├── package.json        # Frontend dependencies & scripts
│   ├── tsconfig.json       # TypeScript configuration
│   └── src/
│       ├── main.ts         # SPA logic, state management, API calls, and polling
│       └── style.css       # Premium BookMyShow-styled replica stylesheet
│
└── server/                 # Backend Express project
    ├── package.json        # Backend dependencies & scripts
    ├── drizzle.config.js   # Drizzle ORM configuration
    ├── .env                # Environment secrets (Neon URL, ImageKit, Razorpay keys)
    └── src/
        ├── index.ts        # Entry point (Server runs on port 8080)
        ├── env.ts          # Zod schema environment validation
        ├── db/
        │   ├── index.ts    # Drizzle client exports
        │   ├── schema.ts   # Database schema (users, movies, seats, bookings, etc.)
        │   └── seed.ts     # Standalone DB seeder script
        └── app/            # Express routers, controllers, and services
```

---

## ⚙️ Installation & Setup

### Prerequisite
Ensure you have [Node.js](https://nodejs.org/) installed (v18 or above recommended).

### 1. Configure Backend Secrets
Create a `.env` file in the `server` directory and paste your configuration:
```env
DATABASE_URL='YOUR_POSTGRESQL_CONNECTION_STRING'
IMAGEKIT_PUBLIC_KEY='YOUR_IMAGEKIT_PUBLIC_KEY'
IMAGEKIT_PRIVATE_KEY='YOUR_IMAGEKIT_PRIVATE_KEY'
IMAGEKIT_URL_ENDPOINT='YOUR_IMAGEKIT_URL_ENDPOINT'
RAZORPAY_KEY_ID='YOUR_RAZORPAY_KEY_ID'
RAZORPAY_KEY_SECRET='YOUR_RAZORPAY_KEY_SECRET'
```

### 2. Install & Run Server
Open a terminal in the `/server` folder:
```bash
# Install dependencies
npm install

# Run database migrations to construct tables
npm run db:generate
npm run db:migrate

# Seed database with movies, theatres, screens, and shows
npx tsx src/db/seed.ts

# Launch server in development mode (port 8080)
npm run dev
```

### 3. Install & Run Client
Open a new terminal in the `/client` folder:
```bash
# Install dependencies
npm install

# Start Vite dev server (runs on port 5173)
npm run dev
```

---

## 🔑 Test Credentials

Use these seeded credentials to test user roles out-of-the-box:

*   **Standard Customer Account:**
    *   **Email:** `user@ticketapp.com`
    *   **Password:** `User@123`
*   **Admin Dashboard Account:**
    *   **Email:** `admin@ticketapp.com`
    *   **Password:** `Admin@123`
