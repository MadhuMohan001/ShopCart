# ShopCart

A full-stack e-commerce platform built with the MERN stack, featuring JWT authentication, Razorpay payments, an admin dashboard, and real-time order tracking.

**Live Demo:** [shop-cart-gray-gamma.vercel.app](https://shop-cart-gray-gamma.vercel.app)

---

## Features

**Customer**
- JWT authentication with refresh token rotation
- Product browsing with search, filter, and sort
- Shopping cart and wishlist
- Checkout with Cash on Delivery or Razorpay (online payment)
- Order tracking and history
- Product reviews and ratings
- Coupon code support
- Dark / light mode

**Admin**
- Dashboard with revenue analytics (Recharts)
- Product, order, and user management
- Inventory tracking
- Order status updates with tracking number

---

## Tech Stack

| Layer      | Technologies                                      |
|------------|---------------------------------------------------|
| Frontend   | React, Redux Toolkit, React Router, Tailwind CSS  |
| Backend    | Node.js, Express.js                               |
| Database   | MongoDB, Mongoose                                 |
| Auth       | JWT (access + refresh tokens), bcrypt             |
| Payments   | Razorpay                                          |
| Storage    | Cloudinary                                        |
| Email      | Nodemailer (Gmail SMTP)                           |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas|

---

## Project Structure

```
ShopCart/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route-level pages
│   │   ├── redux/           # Store, slices (auth, cart, products, orders)
│   │   ├── services/        # Axios instance with interceptors
│   │   ├── hooks/           # Custom React hooks
│   │   └── utils/           # Helpers and constants
│   └── vercel.json
│
└── server/                  # Express backend
    ├── controllers/         # Route handlers
    ├── middleware/          # Auth, error handling, rate limiting
    ├── models/              # Mongoose schemas
    ├── routes/              # API route definitions
    ├── services/            # Email, Cloudinary
    └── utils/               # Seed script, helpers
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)

### 1. Clone and install

```bash
git clone https://github.com/MadhuMohan001/ShopCart.git
cd ShopCart

cd server && npm install
cd ../client && npm install
```

### 2. Configure environment

Create `server/.env`:

```env
NODE_ENV=development
PORT=5000

MONGO_URI=mongodb://localhost:27017/shopcart

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_key_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
```

> Cloudinary, Razorpay, and Email are optional for local development. The server starts without them; only those specific features will error if triggered.

### 3. Seed the database

```bash
cd server
node utils/seed.js
```

Creates 2 demo users and 10 sample products.

### 4. Run

```bash
# Terminal 1 — backend
cd server && npm run dev      # http://localhost:5000

# Terminal 2 — frontend
cd client && npm run dev      # http://localhost:5173
```

---

## API Reference

| Method | Endpoint                        | Auth     | Description              |
|--------|---------------------------------|----------|--------------------------|
| POST   | /api/auth/register              | —        | Register user            |
| POST   | /api/auth/login                 | —        | Login, returns tokens    |
| POST   | /api/auth/refresh               | —        | Refresh access token     |
| GET    | /api/products                   | —        | List with filters        |
| GET    | /api/products/:id               | —        | Single product           |
| POST   | /api/cart                       | User     | Add item to cart         |
| GET    | /api/cart                       | User     | Get cart                 |
| POST   | /api/orders                     | User     | Place order              |
| GET    | /api/orders/user                | User     | Order history            |
| POST   | /api/payment/create-order       | User     | Create Razorpay order    |
| POST   | /api/payment/verify             | User     | Verify payment signature |
| GET    | /api/admin/dashboard            | Admin    | Revenue and stats        |
| PUT    | /api/admin/orders/:id/status    | Admin    | Update order status      |

Full collection available — import `ShopCart.postman_collection.json` and set `baseUrl = http://localhost:5000/api`.

---

## Deployment

### Services used (all free tier)

| Service       | Purpose              |
|---------------|----------------------|
| MongoDB Atlas | Database (M0 free)   |
| Cloudinary    | Image storage        |
| Razorpay      | Payments (test mode) |
| Render        | Backend hosting      |
| Vercel        | Frontend hosting     |

### Steps

1. **MongoDB Atlas** — create cluster, whitelist `0.0.0.0/0`, copy connection string into `MONGO_URI`
2. **Render** — connect GitHub repo, set root directory to `server/`, add all env vars from `.env`
3. **Vercel** — connect GitHub repo, set root directory to `client/`, add `VITE_API_URL=https://your-render-url.onrender.com/api`
4. **Update CORS** — set `CLIENT_URL` on Render to your Vercel URL, then redeploy
5. **Seed production** — run `node utils/seed.js` locally with Atlas `MONGO_URI`

---

## Architecture Notes

**Auth flow** — Access tokens expire in 15 minutes. A refresh token (7 days, httpOnly cookie) is used to silently renew them via an Axios interceptor, so users stay logged in without re-entering credentials.

**Payment flow** — Razorpay order created server-side → popup opened client-side → payment signature verified server-side using HMAC-SHA256 before order is confirmed. Webhook endpoint handles async payment events.

**Concurrency** — MongoDB transactions are used when placing orders to atomically deduct stock and create the order record, preventing overselling when multiple users buy the last item simultaneously.

---