const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true, index: true },
  price: { type: Number, required: true, min: 0 },
  compareAt: { type: Number, min: 0 },
  rating: { type: Number, default: 4.8, min: 0, max: 5 },
  badge: { type: String, trim: true },
  image: { type: String, required: true },
  description: { type: String, default: '' },
}, { timestamps: true })

module.exports = mongoose.model('Product', productSchema)