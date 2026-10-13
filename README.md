# FORMA | Modern Everyday Clothing & Streetwear

![FORMA Banner](frontend/public/next.svg)

> **FORMA** is a modern, high-aesthetic e-commerce clothing brand crafted for everyday fashion and performance streetwear. Designed and developed with a sleek monochrome editorial aesthetic, smooth micro-interactions, responsive glassmorphism navigation, full PayHere payment integration, and a comprehensive operations admin dashboard.

---

## 🌟 Key Features

### 🛍️ Customer Experience (Storefront)
- **Adaptive Floating Navbar:** High-contrast glassmorphism pill navigation that seamlessly adapts between dark hero overlay and crisp light mode upon scrolling, with instant live search and cart drawer preview.
- **Dynamic Product Catalog:** Multi-category browsing (Men, Women, Kids, Accessories, Sale) with live color swatches, price filtering, category filtering, and responsive grid layouts.
- **Interactive Product Detail Pages:** Dynamic colorway switching, size selectors (XS to XXL), real-time stock indicator, and interactive "fly-to-cart" animation physics.
- **Seamless Shopping Cart:** Slide-out drawer and dedicated `/cart` page with quantity adjustment, real-time subtotal calculations, and an island-wide free shipping progress bar (threshold: LKR 7,500).
- **Secure Checkout & PayHere Gateway:** Server-side price recalculation to prevent client tampering, automated hash generation, and Instant Payment Notification (IPN) status updates.

### ⚙️ Operations & Management (Admin Suite)
- **Admin Operations Hub (`/admin`):**
  - **Live Overview & KPIs:** Real-time revenue flow charts, order counts, catalog valuation, and top-performing products.
  - **Catalog Management:** Create, edit, and delete products with custom slugs, categories, tags, pricing, and sizing arrays.
  - **Cloudinary Image Upload:** Direct preset-based image upload pipeline for rapid product listing.
  - **Order Fulfillment Drawer:** View order details, customer addresses, purchased items, and toggle statuses (`pending`, `paid`, `processing`, `shipped`, `delivered`, `cancelled`).
  - **Role-Based Admin Access:** Secure access control with development mode shortcut support on the `/account` portal.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | [Next.js](https://nextjs.org/) (App Router), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), Modular CSS |
| **Backend API** | [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/), CORS, Dotenv |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL) with local in-memory fallback |
| **Payments** | [PayHere](https://www.payhere.lk/) Sandbox Payment Gateway (LKR) |
| **Media Assets** | [Cloudinary](https://cloudinary.com/) (Product asset uploads & CDN delivery) |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.x or higher
- **npm** or **pnpm** / **yarn**

### 2. Installation

Clone the repository and install dependencies for both the frontend and backend:

```powershell
# 1. Install Backend Dependencies
cd Backend
npm install

# 2. Install Frontend Dependencies
cd ../frontend
npm install
```

### 3. Environment Configuration

#### Backend Configuration (`Backend/.env`)
Create or edit `Backend/.env`:

```env
PORT=5000
PAYHERE_MERCHANT_ID=your_payhere_merchant_id
PAYHERE_MERCHANT_SECRET=your_payhere_merchant_secret
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
DELIVERY_FEE=350

# Optional: Supabase Database Integration
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=your-supabase-anon-key
```

#### Frontend Configuration (`frontend/.env.local`)
Create or edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_DELIVERY_FEE=350
```

---

## 💻 Running the Application

Run both servers in separate terminal sessions:

### Terminal 1: Backend API (Port 5000)
```powershell
cd Backend
npm start
# Server runs on: http://localhost:5000
```

### Terminal 2: Frontend Client (Port 3000)
```powershell
cd frontend
npm run dev
# Web application opens on: http://localhost:3000
```

---

## 🔐 Admin Dashboard Access

The administrative dashboard is located at **`/admin`** and is protected by role-based session verification.

1. Open your browser and navigate to: **[http://localhost:3000/account](http://localhost:3000/account)**
2. Select the **Admin** tab.
3. Enter your authorized administrator credentials (or click the **FILL** button provided in the local development environment).
4. Click **Open admin** to enter the **FORMA Operations Suite**.

> [!NOTE]
> For security, production administrator credentials, payment gateway keys, and database tokens must be configured in your local environment files (`.env`) and kept confidential. Never commit raw passwords or merchant secrets to public version control.

---

## 💳 PayHere Sandbox Checkout Setup

1. **Register Merchant Account:** Create an account at [PayHere Sandbox](https://www.payhere.lk/).
2. **Set Origin:** Under Sandbox merchant settings, register `http://localhost:3000` as the authorized domain.
3. **Expose Notification Webhook (for IPN notifications):**
   PayHere cannot send IPN notifications to local `localhost`. Use a tunnel (e.g. ngrok):
   ```powershell
   ngrok http 5000
   ```
   Copy the generated HTTPS URL (e.g. `https://xxxx.ngrok-free.app`) and update `BASE_URL` in `Backend/.env`:
   ```env
   BASE_URL=https://xxxx.ngrok-free.app
   ```
4. **Test Cards:** Use standard PayHere Sandbox test cards from the [PayHere Documentation](https://support.payhere.lk/api-%26-mobile-sdk/payhere-checkout) with any future expiry date and OTP.
5. **Verify Payment:** Once paid, PayHere calls `POST /api/payhere/notify`, marking the order as `paid` in real-time.

---

## 📂 Project Structure

```text
forma-online-clothing-store/
├── Backend/
│   ├── data/
│   │   ├── orders.json           # Order store (local fallback)
│   │   └── products.json         # Master product catalog data
│   ├── routes/
│   │   ├── auth.js               # Login and registration routes
│   │   ├── cart.js               # Cart checkout logic
│   │   ├── payhere.js            # PayHere checkout, hash & IPN webhook
│   │   └── products.js           # Catalog endpoints & filtering
│   ├── index.js                  # Express application entrypoint
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── account/              # Sign in, Sign up & Admin login portal
│   │   ├── admin/                # Forma Operations admin suite
│   │   ├── cart/                 # Full shopping cart page
│   │   ├── checkout/             # Checkout overview & PayHere redirect
│   │   ├── components/           # Shared UI components (SiteHeader, Motion, etc.)
│   │   ├── product/[slug]/       # Dynamic product detail page
│   │   ├── shop/                 # Filterable product catalog
│   │   ├── layout.tsx            # Global root layout
│   │   └── page.tsx              # Homepage with hero & drop showcases
│   └── package.json
│
└── README.md
```

---

## 🧪 Testing

Run backend hash generation and validation unit tests:

```powershell
cd Backend
npm test
```

---

## 📄 License
This project is for educational and commercial demonstration purposes. All rights reserved by **FORMA Clothing Store**.
