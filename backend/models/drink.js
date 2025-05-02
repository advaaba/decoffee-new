const mongoose = require("mongoose");

const drinkSchema = new mongoose.Schema({
  name: String,             // שם בעברית
  value: String,            // מזהה ייחודי באנגלית
  caffeineMg: Number,       // כמות קפאין
  calories: Number,         // קלוריות
  servingSizeMl: Number,    // מ"ל
  ingredients: [String],    // רכיבים
  isCold: Boolean,          // האם קר
  milkBased: Boolean        // האם מבוסס חלב
});

module.exports = mongoose.model("Drink", drinkSchema);
