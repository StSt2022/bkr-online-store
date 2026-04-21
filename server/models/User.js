// server/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  phone: String,
  addresses: [{ city: String, street: String, postalCode: String }],

  // Профіль домогосподарства — для рекомендацій
  household: {
    people: Number,          
    hasKids: Boolean,
    hasPets: Boolean,
    housingType: String      
  },

  // Персональний запас
  stock: [{
    productId: mongoose.Schema.Types.ObjectId,
    intervalDays: Number,    
    lastBought: Date
  }],

  viewedProducts: [mongoose.Schema.Types.ObjectId],  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);