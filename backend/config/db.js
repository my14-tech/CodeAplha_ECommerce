const mongoose = require('mongoose')
const Product = require('../models/Product')

const starterProducts = [
  { name: 'Arc Table Lamp', category: 'Lighting', price: 148, compareAt: 185, rating: 4.9, badge: 'BESTSELLER', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85', description: 'A quiet statement in brushed brass and hand-blown glass. Warm, adjustable light for the corners you love most.' },
  { name: 'Form Lounge Chair', category: 'Furniture', price: 640, rating: 4.8, badge: 'NEW', image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=900&q=85', description: 'Sculpted oak, generous proportions, and a linen seat made for lingering. Designed to age beautifully.' },
  { name: 'Everyday Ceramic Set', category: 'Tableware', price: 72, rating: 5, image: 'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&w=900&q=85', description: 'Four hand-finished stoneware pieces with a soft, tactile glaze. Made for weekday breakfasts and long dinners.' },
  { name: 'Loom Throw Blanket', category: 'Textiles', price: 126, rating: 4.7, image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85', description: 'Woven from responsibly sourced cotton with a relaxed fringe edge. An easy extra layer for the sofa or bed.' },
  { name: 'Sculptural Oak Stool', category: 'Furniture', price: 225, rating: 4.9, image: 'https://images.unsplash.com/photo-1598300056393-4aac492f4344?auto=format&fit=crop&w=900&q=85', description: 'A solid oak accent stool with a carved seat and softened edges. Equally at home beside a chair or in an entryway.' },
  { name: 'Ripple Glass Vase', category: 'Objects', price: 58, rating: 4.8, badge: 'LOW STOCK', image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=900&q=85', description: 'A softly rippled glass silhouette that catches the light beautifully, with or without a few stems.' },
  { name: 'Arc Wall Sconce', category: 'Lighting', price: 186, rating: 4.6, image: 'https://images.unsplash.com/photo-1543198126-a8ad8e47fb22?auto=format&fit=crop&w=900&q=85', description: 'A considered wall light with a compact profile and a generous pool of ambient light. Hardware included.' },
  { name: 'Tapered Oak Side Table', category: 'Furniture', price: 310, rating: 4.9, image: 'https://images.unsplash.com/photo-1499933374294-4584851497cc?auto=format&fit=crop&w=900&q=85', description: 'A minimal side table in warm solid oak, finished by hand and built to stay in your home for years.' },
]

async function connectDatabase() {
  if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI is not set. Product browsing fallback is available; accounts and orders need MongoDB.')
    return
  }

  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to MongoDB')

  if (await Product.countDocuments() === 0) {
    await Product.insertMany(starterProducts)
    console.log(`Seeded ${starterProducts.length} starter products`)
  }
}

module.exports = connectDatabase