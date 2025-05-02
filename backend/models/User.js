const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  birthDate: { type: Date, required: true },
  age: { type: Number, required: true },
  weight: { type: Number, required: true },
  height: { type: Number, required: true },
  gender: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  healthCondition: { type: String },
  activityLevel: { type: String },
  dietaryPreferences: { type: String },
  pregnant: { type: String },
  caffeineRecommendationMin: { type: Number },
  caffeineRecommendationMax: { type: Number },
  averageCaffeineRecommendation: { type: Number },
  customHealthDescription: { type: String },
  customDietaryPreference: { type: String },
  expoPushToken: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
