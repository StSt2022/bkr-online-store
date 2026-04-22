// server/models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // false, бо може купувати і гість
  orderId: { type: String, required: true, unique: true }, // Наприклад: 'SYV-12345'
  
  // Масив товарів, які були в кошику
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: Number
  }],
  
  total: { type: Number, required: true },
  status: { type: String, default: 'pending' }, // pending, confirmed, delivered
  
  // Дані доставки
  delivery: {
    method: String,
    city: String,
    address: String,
    postOffice: String
  },
  
  payment: String,
  
  // Контактні дані (на випадок, якщо це гість)
  contacts: {
    firstName: String,
    lastName: String,
    phone: String
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);