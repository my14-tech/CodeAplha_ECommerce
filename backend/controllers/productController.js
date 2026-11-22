const mongoose = require('mongoose')
const Product = require('../models/Product')

async function listProducts(req, res) {
  const query = {}
  if (req.query.category) query.category = req.query.category
  if (req.query.search) query.name = { $regex: req.query.search, $options: 'i' }
  const products = await Product.find(query).sort({ createdAt: 1 })
  res.json(products)
}

async function getProduct(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Product not found.' })
  const product = await Product.findById(req.params.id)
  if (!product) return res.status(404).json({ message: 'Product not found.' })
  return res.json(product)
}

module.exports = { listProducts, getProduct }