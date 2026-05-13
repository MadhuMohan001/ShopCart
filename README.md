# ShopCart — MERN E-Commerce Platform

A full-stack e-commerce web application built with the MERN stack. Built as a portfolio project covering authentication, payments, admin dashboard, and more.

**Live Demo:** [your-app.vercel.app](https://your-app.vercel.app)

**Demo Credentials:**
| Role  | Email             | Password  |
|-------|-------------------|-----------|
| Admin | admin@demo.com    | admin123  |
| User  | user@demo.com     | user123   |

---

## Tech Stack

**Frontend:** React 18, Redux Toolkit, React Router DOM, Tailwind CSS, Recharts, Axios  
**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt  
**Services:** Cloudinary (images), Razorpay (payments), Nodemailer (emails)  
**Deployment:** Vercel (frontend), Render (backend), MongoDB Atlas (database)

---

## Features

- JWT authentication with refresh token rotation
- Product listing, filtering, sorting, search & pagination
- Shopping cart (DB-persisted for logged-in users)
- Wishlist
- Checkout with Razorpay payment gateway + webhook verification
- Cash on Delivery option
- Coupon system with percentage/fixed discounts
- Order tracking with status machine
- Email notifications on order
- Product reviews (only after purchase)
- Admin dashboard with analytics charts
- Admin: manage products, orders, users
- Dark / light mode
- Responsive UI

---

## Project Structure

```
mern-ecommerce/
├── client/                 # React frontend
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── pages/          # Route-level page components
│       │   └── admin/      # Admin-only pages
│       ├── redux/slices/   # Redux state slices
│       ├── routes/         # PrivateRoute, AdminRoute guards
│       └── services/       # Axios instance with interceptors
└── server/                 # Express backend
    ├── controllers/        # Route handler logic
    ├── middleware/         # Auth, error, validation middleware
    ├── models/             # Mongoose schemas
    ├── routes/             # Express routers
    ├── services/           # Email service
    ├── config/             # DB, Cloudinary config
    └── utils/              # JWT helpers, seed script
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Git

### Step 1 — Clone & install

```bash
git clone https://github.com/yourusername/mern-ecommerce.git
cd mern-ecommerce

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Step 2 — Configure server environment

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/mern-ecommerce
# OR use MongoDB Atlas URI

JWT_ACCESS_SECRET=your_very_long_random_secret_string_here
JWT_REFRESH_SECRET=another_very_long_random_secret_here
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
BCRYPT_SALT_ROUNDS=10

CLIENT_URL=http://localhost:5173

# Cloudinary — get free account at cloudinary.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay — get test keys at razorpay.com (Dashboard > Settings > API Keys)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=your_key_secret

# Gmail — create App Password: Google Account > Security > 2FA > App Passwords
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_16_char_app_password
```

### Step 3 — Configure client environment

```bash
cd client
cp .env.example .env
```

Edit `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 4 — Seed the database

```bash
cd server
npm run seed
```

This creates demo admin/user accounts and 10 sample products.

### Step 5 — Run in development

Open **two terminals**:

```bash
# Terminal 1 — Backend
cd server
npm run dev
# Runs on http://localhost:5000

# Terminal 2 — Frontend
cd client
npm run dev
# Runs on http://localhost:5173
```

Open http://localhost:5173 and log in with demo credentials.

---

## API Endpoints

| Method | Endpoint                        | Auth     | Description              |
|--------|---------------------------------|----------|--------------------------|
| POST   | /api/auth/register              | Public   | Register user            |
| POST   | /api/auth/login                 | Public   | Login                    |
| POST   | /api/auth/refresh               | Public   | Refresh access token     |
| POST   | /api/auth/logout                | User     | Logout                   |
| GET    | /api/auth/me                    | User     | Get current user         |
| GET    | /api/products                   | Public   | List products (filtered) |
| GET    | /api/products/:id               | Public   | Get single product       |
| POST   | /api/products                   | Admin    | Create product           |
| PUT    | /api/products/:id               | Admin    | Update product           |
| GET    | /api/cart                       | User     | Get cart                 |
| POST   | /api/cart                       | User     | Add to cart              |
| POST   | /api/orders                     | User     | Place order              |
| GET    | /api/orders/user                | User     | Get user's orders        |
| POST   | /api/payment/razorpay/create    | User     | Create Razorpay order    |
| POST   | /api/payment/razorpay/verify    | User     | Verify payment signature |
| POST   | /api/reviews/:productId         | User     | Add product review       |
| GET    | /api/admin/dashboard            | Admin    | Dashboard analytics      |
| GET    | /api/admin/orders               | Admin    | All orders               |
| PUT    | /api/admin/orders/:id/status    | Admin    | Update order status      |

---

## Deployment Guide (Free Tier)

### 1. MongoDB Atlas (Free — M0 cluster)

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → Create free account
2. Create a new project → Build a Database → **M0 Free**
3. Choose region → Create cluster
4. Set username & password → Add IP: `0.0.0.0/0` (allow all)
5. Connect → Compass → Copy the connection string
6. Replace `<password>` in the string → save as `MONGO_URI`

### 2. Cloudinary (Free — 25GB)

1. Go to [cloudinary.com](https://cloudinary.com) → Sign up free
2. Dashboard shows **Cloud name**, **API Key**, **API Secret**
3. Copy all three into your `.env`

### 3. Razorpay (Free test mode)

1. Go to [razorpay.com](https://razorpay.com) → Sign up
2. Dashboard → Settings → API Keys → Generate test keys
3. Copy **Key ID** and **Key Secret** into your `.env`

### 4. Gmail App Password (for emails)

1. Enable 2-Factor Authentication on your Google account
2. Go to: Google Account → Security → App Passwords
3. Select app: Mail → Generate → Copy the 16-char password
4. Use it as `EMAIL_PASS` in your `.env`

### 5. Deploy Backend to Render (Free)

1. Push your project to GitHub
2. Go to [render.com](https://render.com) → New → **Web Service**
3. Connect GitHub → Select your repo
4. Settings:
   - **Name:** mern-ecommerce-api
   - **Root Directory:** server
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add **Environment Variables** (all from `server/.env`):
   - `NODE_ENV` = production
   - `MONGO_URI` = your Atlas URI
   - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
   - `CLOUDINARY_*` keys
   - `RAZORPAY_*` keys
   - `EMAIL_*` settings
   - `CLIENT_URL` = https://your-app.vercel.app (add after step 6)
6. Click **Create Web Service** → Wait for deploy (~3 min)
7. Copy your Render URL: `https://mern-ecommerce-api.onrender.com`

> ⚠️ Free Render instances spin down after 15 min of inactivity. First request after sleep takes ~30s.

### 6. Deploy Frontend to Vercel (Free)

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Settings:
   - **Framework Preset:** Vite
   - **Root Directory:** client
   - **Build Command:** `npm run build`
   - **Output Directory:** dist
4. Add **Environment Variable**:
   - `VITE_API_URL` = `https://mern-ecommerce-api.onrender.com/api`
5. Click **Deploy** → Your app is live in ~2 min!

### 7. Update CORS (final step)

Go to Render → your service → Environment → Update:
```
CLIENT_URL=https://your-actual-app.vercel.app
```
Then redeploy.

### 8. Seed production database

After deployment, temporarily add this script to run once:

```bash
# In server/package.json scripts, seed is already there
# Set your production MONGO_URI locally then run:
MONGO_URI=your_atlas_uri node utils/seed.js
```

---

## Architecture Decisions

**Why httpOnly cookies weren't used here:** Tokens are stored in localStorage for simplicity with Razorpay's cross-origin flows. In production, migrate to httpOnly cookies with SameSite=Strict.

**Why MongoDB transactions for orders:** Inventory decrement and order creation must be atomic. If payment fails mid-flow, stock must be restored — transactions guarantee this.

**Why RTK Query isn't used:** Standard Redux Toolkit slices with Axios are used for explicitness and interview readability. RTK Query would be the next upgrade.

**Why soft delete for products:** Orders reference products by ID. Hard-deleting products would break order history display — soft delete (isActive: false) preserves data integrity.

---

## Interview Topics This Project Covers

- JWT auth flow with refresh token rotation
- Role-based access control (RBAC)
- MongoDB schema design and indexing
- Atomic operations with MongoDB transactions
- Payment gateway integration + webhook signature verification
- Redux state management patterns
- Protected routes on both client and server
- Server-side pagination for scalability
- Cloudinary image upload pipeline
- Deployment pipeline (Vercel + Render + Atlas)
