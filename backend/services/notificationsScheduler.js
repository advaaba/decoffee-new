const cron = require('node-cron');
const fetch = require('node-fetch'); // שליחה ישירה לשרת Expo

const sendPushNotification = async (expoPushToken) => {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: '🕘 תזכורת יומית',
    body: 'היי! אל תשכחי לשתות מים או קפה היום ☕🚰',
  };

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const data = await response.json();
    console.log('📩 שלחנו תזכורת:', data);
  } catch (error) {
    console.error('❌ שגיאה בשליחת תזכורת:', error);
  }
};

const startDailyNotifications = () => {
  // הרצת המשימה כל יום ב-9 בבוקר
  cron.schedule('0 16 * * *', async () => {
    console.log('⏰ שולחים תזכורת יומית...');

    // כאן תשלפי את כל ה-Expo Tokens של המשתמשים ממסד הנתונים
    const expoPushTokens = [
      'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]', // דוגמה
    ];

    for (const token of expoPushTokens) {
      await sendPushNotification(token);
    }
  });
};

module.exports = { startDailyNotifications };
