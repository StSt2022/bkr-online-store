// server/models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  productId: { type: Number, required: true }, // Зв'язок з нашим id товару
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Зв'язок з юзером
  rating: { type: Number, min: 1, max: 5, required: true },
  text: { type: String, maxLength: 500 },
  createdAt: { type: Date, default: Date.now }
});

// Робимо так, щоб один юзер міг залишити тільки один відгук на один товар
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);