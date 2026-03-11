# 🚀 E-Commerce Backend API

A robust, scalable, and secure RESTful API built with **Express.js**, **TypeScript**, and **Prisma ORM**. This backend powers modern e-commerce applications with complete authentication, product management, order processing, and payment integration.

## ✨ Features

### 🔐 Authentication & Authorization

- **JWT Authentication** - Secure token-based authentication
- **Role-based Access** - Admin, Vendor, Customer roles
- **OAuth2 Integration** - Google, Facebook login
- **Email Verification** - Account confirmation
- **Password Reset** - Secure password recovery
- **Refresh Tokens** - Seamless token rotation

### 📦 Product Management

- **CRUD Operations** - Full product lifecycle management
- **Categories & Subcategories** - Hierarchical organization
- **Inventory Tracking** - Real-time stock management
- **Product Variants** - Size, color, options
- **Reviews & Ratings** - Customer feedback system
- **Search & Filtering** - Advanced product discovery
- **Bulk Operations** - Import/export products

### 🛒 Shopping Cart

- **Persistent Cart** - Save cart for logged-in users
- **Guest Cart** - Temporary cart for non-logged users
- **Cart Merging** - Merge guest cart on login
- **Price Calculations** - Subtotal, tax, shipping, discounts
- **Coupon System** - Percentage and fixed discounts

### 📋 Order Management

- **Order Processing** - Create, update, track orders
- **Multiple Statuses** - Pending, Processing, Shipped, Delivered, Cancelled
- **Payment Integration** - Stripe, PayPal, COD
- **Invoice Generation** - PDF invoices
- **Email Notifications** - Order confirmations, updates
- **Refund Processing** - Full/partial refunds

### 👥 User Management

- **Profile Management** - Update personal info
- **Address Book** - Multiple shipping addresses
- **Order History** - View past purchases
- **Wishlist** - Save favorite items
- **Password Management** - Change/forgot password

### 👑 Admin Dashboard API

- **Dashboard Stats** - Sales, revenue, users, orders
- **User Management** - CRUD operations for users
- **Product Management** - Approve/reject products
- **Order Management** - Update order status
- **Discount Management** - Create/manage coupons
- **Analytics** - Sales reports and charts data

### 🛡️ Security Features

- **Helmet.js** - Secure HTTP headers
- **CORS** - Controlled cross-origin requests
- **Rate Limiting** - Prevent brute force attacks
- **Input Validation** - Sanitize user input
- **SQL Injection Prevention** - Parameterized queries
- **XSS Protection** - Escape user input
- **CSRF Protection** - Cross-site request forgery prevention

### 📊 Performance

- **Caching** - Redis for frequently accessed data
- **Pagination** - Efficient data retrieval
- **Compression** - Gzip compression
- **Database Indexing** - Optimized queries
- **Lazy Loading** - Efficient relation loading

## 🏗️ Tech Stack

### Core

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma ORM** - Database toolkit
- **PostgreSQL/MySQL** - Database

### Authentication

- **JWT** - JSON Web Tokens
- **bcrypt** - Password hashing
- **Passport.js** - OAuth strategies

### Validation

- **Zod** - Schema validation
- **express-validator** - Request validation

### File Upload

- **Multer** - File handling
- **Cloudinary** - Cloud storage
- **Sharp** - Image optimization

### Security

- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **express-rate-limit** - Rate limiting
- **express-mongo-sanitize** - NoSQL injection prevention

### Utilities

- **Winston** - Logging
- **Morgan** - HTTP request logging
- **Nodemailer** - Email sending
- **Bull** - Queue management
- **Redis** - Caching
- **Stripe SDK** - Payment processing

### Testing

- **Jest** - Unit testing
- **Supertest** - API testing
- **Postman** - Manual testing

## 📁 Project Structure

ecommerce-backend/
ecommerce-backend/
├── src/
│   ├── Modules/
│   │   ├── Products/
│   │   │   ├── Controllers/
│   │   │   ├── Routes/
│   │   │   ├── Validation/
│   │   │   └── Module/
│   │   │
│   │   ├── Payment/
│   │   │   ├── Controllers/
│   │   │   ├── Routes/
│   │   │   ├── Validation/
│   │   │   └── Module/
│   │   │
│   │   ├── Categories/
│   │   │   ├── Controllers/
│   │   │   ├── Routes/
│   │   │   ├── Validation/
│   │   │   └── Module/
│   │   │
│   │   ├── Orders/
│   │   │   ├── Controllers/
│   │   │   ├── Routes/
│   │   │   ├── Validation/
│   │   │   └── Module/
│   │   │
│   │   ├── Order_Items/
│   │   │   ├── Controllers/
│   │   │   ├── Routes/
│   │   │   ├── Validation/
│   │   │   └── Module/
│   │   │
│   │   └── Users/
│   │       ├── Auth/
│   │       │   ├── Controllers/
│   │       │   ├── Routes/
│   │       │   ├── Validation/
│   │       │   └── Module/
│   │       │
│   │       ├── Controllers/
│   │       ├── Routes/
│   │       ├── Validation/
│   │       └── Module/
│   │
│   ├── config/
│   ├── middleware/
│   ├── utils/
│   ├── constants/
│   └── types/
│
├── prisma/
│   └── schema.prisma
│
├── index.ts
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
└── server.ts

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL/MySQL
- Redis (optional)
- npm/yarn/pnpm

### Installation

1. **Clone the repository**

## bash

git clone https://github.com/momen-x/back-e-commerce.git

### Install dependencies

## npm install

# or

yarn install

# or

## pnpm install

## Set up environment variables

# cp .env.example .env

# Server

PORT=5000
NODE_ENV=development

# Database

DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce"

# JWT

JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# OAuth

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Email

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Payment

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# Cloud Storage

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Redis

REDIS_URL=redis://localhost:6379

# Frontend URL

FRONTEND_URL=http://localhost:3000

## Set up database

# Run Prisma migrations

npx prisma migrate dev --name init

# Generate Prisma client

npx prisma generate

# Seed database (optional)

npm run seed

# Start development server

npm run dev

# or

yarn dev

# or

pnpm dev

### Build for production

npm run build
npm start
