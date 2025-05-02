const mongoose = require('mongoose');

const dailyDataSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: Date, default: Date.now },
  sleepHours: { type: Number },
  mood: { type: String },
  focusLevel: { type: String },
  tirednessLevel: { type: String },  
  drankCoffee: { type: Boolean },
  coffeeDetails: { type: mongoose.Schema.Types.Mixed }, // נתונים גמישים אם שתה
  noCoffeeDetails: { type: mongoose.Schema.Types.Mixed }, // נתונים גמישים אם לא שתה
}, { timestamps: true });

module.exports = mongoose.model('DailyData', dailyDataSchema);
