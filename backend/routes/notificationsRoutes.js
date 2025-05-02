// routes/notificationsRoutes.js
const express = require("express");
const router = express.Router();
const axios = require("axios");

// שליחת Notification דרך שרת Expo
router.post("/send", async (req, res) => {
  const { expoPushToken, title, body, data } = req.body;

  if (!expoPushToken) {
    return res.status(400).json({ success: false, message: "❌ חסר expoPushToken" });
  }

  try {
    const message = {
      to: expoPushToken,
      sound: "default",
      title: title || "📣 תזכורת",
      body: body || "היי! יש לך תזכורת מ-DeCoffee!",
      data: data || {},
    };

    const response = await axios.post("https://exp.host/--/api/v2/push/send", message, {
      headers: {
        "Accept": "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
    });

    console.log("✅ התראה נשלחה:", response.data);
    res.json({ success: true, message: "התראה נשלחה בהצלחה", expoResponse: response.data });
  } catch (error) {
    console.error("❌ שגיאה בשליחת התראה:", error.message);
    res.status(500).json({ success: false, message: "❌ שגיאה בשליחת התראה", error: error.message });
  }
});

module.exports = router;
