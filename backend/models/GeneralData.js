const mongoose = require("mongoose");

const generalDataSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    coffeeType: [
      {
        name: String,
        size: String,
        cups: Number,
      },
    ],
    servingSize: { type: String, enum: ["Small", "Medium", "Large"] },
    cupsPerDay: Number,
    consumptionTime: [String],
    isWorking: { type: String, enum: ["yes", "no"] },
    workStartHour: Number,
    workEndHour: Number,
    sleepFromHour: Number,
    sleepToHour: Number,
    sleepDurationAverage: Number,
    workDurationAverage: Number,
    effects: { type: String, enum: ["physically", "mentally", "both", "none"] },
    isTryingToReduce: { type: String, enum: ["yes", "no"] },
    reductionExplanation: String,
    isMotivation: Boolean,
    importanceLevel: Number,
    selfDescription: String,
    averageCaffeinePerDay: { type: Number },
    workingDays: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("GeneralData", generalDataSchema);
