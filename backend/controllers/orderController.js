const mongoose = require('mongoose')
const Order = require('../models/Order')
const Product = require('../models/Product')

async function createOrder(req, res) {
  const { items, shippingAddress } = req.body
  const requiredAddressFields = ['name', 'email', 'street', 'city', 'postalCode', 'country']
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'Your bag is empty.' })
  if (!shippingAddress || requiredAddressFields.some((field) => !shippingAddress[field]?.trim())) {
    return res.status(400).json({ message: 'Please provide complete delivery details.' })
  }

  const quantities = new Map()
  for (const item of items) {
    if (!mongoose.isValidObjectId(item.product) || !Number.isInteger(item.quantity) || item.quantity < 1) {
      return res.status(400).json({ message: 'One or more items in your bag are invalid.' })
    }
    quantities.set(item.product, (quantities.get(item.product) || 0) + item.quantity)
  }

  const products = await Product.find({ _id: { $in: [...quantities.keys()] } })
  if (products.length !== quantities.size) return res.status(400).json({ message: 'A product in your bag is no longer available.' })

  const orderItems = products.map((product) => ({
    product: product._id,
    name: product.name,
    image: product.image,
    price: product.price,
    quantity: quantities.get(product._id.toString()),
  }))
  const subtotal = orderItems.reduce((total, item) => total + item.price * item.quantity, 0)
  const order = await Order.create({ user: req.userId, items: orderItems, shippingAddress, subtotal })
  return res.status(201).json(order)
}

async function listOrders(req, res) {
  const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 })
  return res.json(orders)
}

module.exports = { createOrder, listOrders }