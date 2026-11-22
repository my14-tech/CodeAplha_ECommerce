require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const connectDatabase = require('./config/db')

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET must be set in backend/.env')
  process.exit(1)
}

const app = express()
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (req, res) => res.json({
  status: 'ok',
  database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
}))
app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database is unavailable. Configure MONGODB_URI to use this endpoint.' })
  }
  return next()
})
app.use('/api/products', require('./routes/productRoutes'))
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/orders', require('./routes/orderRoutes'))
app.use((req, res) => res.status(404).json({ message: 'That address could not be found.' }))
app.use((error, req, res, next) => {
  console.error(error)
  if (res.headersSent) return next(error)
  return res.status(500).json({ message: 'Something went wrong. Please try again.' })
})

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Morrow API listening on http://localhost:${port}`))
connectDatabase().catch((error) => console.error(`MongoDB connection failed: ${error.message}`))