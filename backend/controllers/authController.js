const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

function createSession(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    token: jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' }),
  }
}

async function register(req, res) {
  const name = req.body.name?.trim()
  const email = req.body.email?.trim().toLowerCase()
  const password = req.body.password

  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required.' })
  if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' })

  try {
    if (await User.exists({ email })) return res.status(409).json({ message: 'An account with that email already exists.' })
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 12) })
    return res.status(201).json(createSession(user))
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'An account with that email already exists.' })
    throw error
  }
}

async function login(req, res) {
  const email = req.body.email?.trim().toLowerCase()
  const password = req.body.password
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' })

  const user = await User.findOne({ email }).select('+password')
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Email or password is incorrect.' })
  }
  return res.json(createSession(user))
}

module.exports = { register, login }