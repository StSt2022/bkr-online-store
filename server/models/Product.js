// server/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: Number,
  name: String,
  price: Number,
  image: String,
  category: String,
  description: String,
  tags: [String],
  popularity: Number,
  related_products: [Number],
  
  priceGroup: String,     // 'budget' | 'mid' | 'premium'
  isSafeForKids: Boolean, 
  isSafeForPets: Boolean,
  brand: String,
  isNewProduct: { type: Boolean, default: false },
  discount: { type: Number, default: 0 },
  avgRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('Product', productSchema);