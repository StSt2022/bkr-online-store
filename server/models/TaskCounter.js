// server/models/TaskCounter.js
const mongoose = require('mongoose');

const taskCounterSchema = new mongoose.Schema({
  taskKey: { type: String, required: true }, // 'bathroom', 'kitchen', тощо
  date: { type: String, required: true },    // Формат 'YYYY-MM-DD' (щоб лічильник скидався щодня)
  count: { type: Number, default: 0 }
});

// Унікальний індекс: одна задача на один день
taskCounterSchema.index({ taskKey: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('TaskCounter', taskCounterSchema);