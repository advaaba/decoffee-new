require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config');
const authRoutes = require('./routes/authRoutes');
const drinkRoutes = require("./routes/drinkRoutes");
const dailyDataRoutes = require("./routes/dailyDataRoutes");
// const notificationsRoutes = require("./routes/notificationsRoutes");
const { startDailyNotifications } = require('./services/notificationsScheduler');
const predictionRoutes = require("./routes/predictionRoutes");
const generalDataRoutes = require("./routes/generalDataRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
// תזמון התראות ותזכורות
startDailyNotifications();

// שימוש בנתיבים
app.use('/api/auth', authRoutes);
app.use("/api/drinks", drinkRoutes);
app.use("/api/dailyData", dailyDataRoutes);
app.use("/api/prediction", predictionRoutes);
app.use("/api/generalData", generalDataRoutes);

// app.use("/api/notifications", notificationsRoutes);

// בדיקת חיבור לשרת
app.get('/', (req, res) => {
    res.send('🚀 Server is running!');
});

console.log("🔍 MONGO_URI בשימוש:", process.env.MONGO_URI);

// חיבור ל-MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// הפעלת השרת
// app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
app.listen(5000, '0.0.0.0', () => {
    console.log("✅ Server running on port 5000");
});
