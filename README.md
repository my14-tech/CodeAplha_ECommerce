# Morrow Objects

A small full-stack home-goods store built with React, Vite, Express, and MongoDB. The catalog, product details, cart, sign-in/register, checkout, and order history API are included.

## Requirements

- Node.js 20.19+ or 22.12+
- MongoDB locally, or a MongoDB Atlas connection string

## Start the app

1. In `backend`, copy `.env.example` to `.env` and set `MONGODB_URI` and a private, random `JWT_SECRET`.
2. Start the API:

   ```powershell
   cd backend
   npm install
   npm run dev
   ```

3. In a second terminal, start the storefront:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

4. Open the Vite URL shown in the terminal (normally `http://localhost:5173`). The first successful database connection seeds eight starter products when the product collection is empty.

The storefront remains browseable with sample products if the API or database is unavailable. Accounts and order checkout require a running API connected to MongoDB. Orders are available to the signed-in account at `GET /api/orders`; create an order with `POST /api/orders`.

## API

- `GET /api/health`
- `GET /api/products` and `GET /api/products/:id`
- `POST /api/auth/register` and `POST /api/auth/login`
- `GET /api/orders` and `POST /api/orders` (JWT bearer token required)