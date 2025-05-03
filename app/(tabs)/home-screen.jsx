import React, { useEffect, useState, useCallback } from "react";
import {
  ScrollView,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
  View,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import axios from "axios";
import BASE_URL from "../../utils/apiConfig";
import * as Notifications from "expo-notifications";
import { useFocusEffect } from "@react-navigation/native";

export default function HomeScreen() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dailyStatus, setDailyStatus] = useState(null);
  const router = useRouter();
  const [generalSurvey, setGeneralSurvey] = useState(null);

  const saveExpoPushToken = async (token) => {
    const userId = await AsyncStorage.getItem("userId");

    if (!userId) return;

    try {
      await axios.put(`${BASE_URL}/api/auth/save-push-token`, {
        userId,
        expoPushToken: token,
      });
      console.log("✅ Expo Push Token נשמר במסד הנתונים");
    } catch (error) {
      console.error("❌ שגיאה בשמירת הטוקן:", error);
    }
  };

  const checkDailyData = async () => {
    const userId = await AsyncStorage.getItem("userId");
    const today = new Date().toISOString().split("T")[0]; // תאריך היום בתבנית yyyy-mm-dd

    try {
      const response = await axios.get(`${BASE_URL}/api/dailyData/check`, {
        params: { userId, date: today },
      });

      if (response.data.exists) {
        setDailyStatus("מילאת את הסקירה היומית!"); // אם מילא, הצג את המצב החיובי
      } else {
        setDailyStatus("עוד לא התחלת לעקוב אחרי צריכת הקפה שלך היום."); // אם לא מילא, הצג הודעה שתעודד את המשתמש למלא
      }
    } catch (error) {
      console.error("❌ שגיאה בבדיקת הסקירה היומית:", error);
    }
  };
  const handleMissedNotification = async (timeLabel, hour, minute) => {
    const today = new Date().toISOString().split("T")[0];
    const key = `notificationSent_${timeLabel}_${today}`;

    const alreadySent = await AsyncStorage.getItem(key);
    if (alreadySent) {
      console.log(`🔁 תזכורת עבור ${timeLabel} כבר נשלחה היום`);
      return;
    }

    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, minute, 0, 0);

    if (now > scheduledTime) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "☕ זמן קפה שהוחמץ!",
          body: `שכחת את הקפה של ${timeLabel}? עדיין יש זמן לקחת רגע לעצמך.`,
        },
        trigger: null, // שליחה מיידית
      });
      console.log(`📨 תזכורת ${timeLabel} נשלחה באיחור`);
      await AsyncStorage.setItem(key, "true");
    }
  };

  const scheduleNotificationsForConsumptionTimes = async (consumptionTimes) => {
    if (!consumptionTimes || consumptionTimes.length === 0) {
      console.log("⚠️ אין זמני שתיית קפה להגדיר תזכורות.");
      return;
    }

    const notificationTimes = {
      Morning: { hour: 9, minute: 0 },
      Afternoon: { hour: 15, minute: 0 },
      evening: { hour: 19, minute: 0 },
      night: { hour: 22, minute: 0 },
    };

    const existingNotifications =
      await Notifications.getAllScheduledNotificationsAsync();

    for (const time of consumptionTimes) {
      const identifier = `coffeeReminder_${time}`;
      const alreadyScheduled = existingNotifications.some(
        (notif) => notif.identifier === identifier
      );

      const { hour, minute } = notificationTimes[time];
      const now = new Date();
      const triggerDate = new Date();
      triggerDate.setHours(hour, minute, 0, 0);

      if (triggerDate <= now) {
        await handleMissedNotification(time, hour, minute);
      } else if (!alreadyScheduled) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "☕ זמן קפה הגיע!",
            body: `זה הזמן המושלם להפסקת קפה (${time}) 🌟`,
          },
          trigger: {
            date: triggerDate,
          },
          identifier, // ייחודי לכל תזכורת
        });

        console.log(`✅ תזכורת עתידית נקבעה ל־${time}: ${triggerDate}`);
      } else {
        console.log(`🔁 תזכורת ${time} כבר מתוזמנת`);
      }
    }
  };

  const sendImmediateNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "☕ בדיקה מיידית!",
          body: "זו תזכורת שנשלחה עכשיו 🎯",
        },
        trigger: null, // שולח את ההתראה מיידית
      });
      console.log("✅ נשלחה תזכורת מיידית");
    } catch (error) {
      console.error("❌ שגיאה בשליחת תזכורת מיידית:", error);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");

        const response = await axios.get(
          `${BASE_URL}/api/auth/get-user/${userId}`
        );
        if (response.data.success) {
          setUser(response.data.user);
          await checkDailyData();

          const surveyResponse = await axios.get(
            `${BASE_URL}/api/generalData/get-survey/${userId}`
          );
          const survey = surveyResponse.data?.survey;

          setGeneralSurvey(survey);

          await scheduleNotificationsForConsumptionTimes(
            survey?.consumptionTime || []
          );
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const requestNotificationPermission = async () => {
      try {
        const alreadyAsked = await AsyncStorage.getItem(
          "hasAskedNotificationPermission"
        );
        if (alreadyAsked) {
          console.log("🔔 כבר ביקשנו הרשאה להתראות.");
          return;
        }

        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus === "granted") {
          console.log("🔔 קיבלנו הרשאת Notifications! שולחים הודעת תודה...");
          const token = (await Notifications.getExpoPushTokenAsync()).data;
          console.log("Expo Push Token:", token);
          await saveExpoPushToken(token);
        } else {
          Alert.alert(
            "שים לב",
            "כדי לקבל תזכורות יומיות, נא לאשר קבלת התראות."
          );
        }

        await AsyncStorage.setItem("hasAskedNotificationPermission", "true");
      } catch (error) {
        console.error("❌ שגיאה בבקשת הרשאות Notifications:", error);
      }
    };

    requestNotificationPermission();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      " התנתקות",
      "האם את בטוחה שברצונך להתנתק?",
      [
        {
          text: "ביטול",
          style: "cancel",
        },
        {
          text: "התנתק/י",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("userToken");
              await AsyncStorage.removeItem("userId");
              router.replace("/open-screen");
            } catch (error) {
              console.error("❌ שגיאה בהתנתקות:", error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("התראה התקבלה:", notification);
        Alert.alert("התראה התקבלה", notification.request.content.body);
      }
    );

    return () => subscription.remove();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const refreshData = async () => {
        await checkDailyData();

        try {
          const userId = await AsyncStorage.getItem("userId");
          const surveyResponse = await axios.get(
            `${BASE_URL}/api/generalData/get-survey/${userId}`
          );
          const survey = surveyResponse.data?.survey;
          setGeneralSurvey(survey);
        } catch (error) {
          console.error("❌ שגיאה בטעינת הסקירה הכללית:", error);
        }
      };

      refreshData();
    }, [])
  );

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#4CAF50"
        style={{ marginTop: 40 }}
      />
    );
  }

  return (
    <View>
      <ScrollView contentContainerStyle={styles.container}>
        {user ? (
          <>
            <Text style={styles.title}>שלום, {user.firstName} 👋</Text>
            <Text style={styles.text}>ברוכה הבאה ל־DeCoffee 🌿</Text>
            <Text style={styles.textParagraph}>
              האפליקצייה שתעזור לך לעקוב אחרי הרגלי שתיית הקפה שלך, להבין איך
              קפאין משפיע עלייך ולבנות הרגלים שמתאימים לך אישית
            </Text>

            {/* 💡 הוסיפי את זה כאן */}
            {(() => {
              const isCoffeeSurveyMissing =
                !generalSurvey ||
                Object.values(generalSurvey).every((value) =>
                  Array.isArray(value) ? value.length === 0 : !value
                );

              const isDailySurveyMissing =
                dailyStatus !== "מילאת את הסקירה היומית!";

              const hasAnyMessage =
                isCoffeeSurveyMissing || isDailySurveyMissing;

              return (
                <View style={styles.section}>
                  <Text style={styles.subTitle}>📊 הודעות עבורך:</Text>

                  {hasAnyMessage ? (
                    <>
                      {isCoffeeSurveyMissing && (
                        <View style={styles.messageBlock}>
                          <Text style={styles.text}>
                            לא השלמת עדיין את הסקירה הכללית על הרגלי הקפה שלך.
                          </Text>
                          <View style={styles.buttonRightAlign}>
                            <TouchableOpacity
                              onPress={() => router.push("/CoffeeDetails")}
                              style={[styles.customButton, styles.orangeButton]}
                            >
                              <Text style={styles.buttonText}>
                                השלם סקירה כללית לקפה
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}

                      {isDailySurveyMissing && (
                        <>
                          <Text style={styles.text}>{dailyStatus}</Text>
                          <View style={styles.buttonRightAlign}>
                            <TouchableOpacity
                              onPress={() => router.push("/create")}
                              style={[styles.customButton, styles.greenButton]}
                            >
                              <Text style={styles.buttonText}>
                                התחיל/י מעקב יומי
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </>
                      )}
                    </>
                  ) : (
                    <View style={styles.messageBlock}>
                      <Text style={styles.textMessage}> 
                        אין הודעות חדשות עבורך כרגע.
                      </Text>
                    </View>
                  )}
                </View>
              );
            })()}
            <Button
              title="שלח לי תזכורת עכשיו 🚀"
              onPress={sendImmediateNotification}
              color="#2196F3"
              style={{ marginTop: 10 }}
            />
            <TouchableOpacity onPress={handleLogout} style={styles.backLink}>
              <Text style={styles.linkText}>התנתקות מהחשבון</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.text}>לא נמצאו נתוני משתמש.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    // backgroundColor: "#fff",
    minHeight: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    // color: "white"
  },
  subTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#f59e0b",
    marginBottom: -5,
    textAlign: "right",
  },
  text: {
    marginBottom: 20,
    fontSize: 16,
    textAlign: "right",
  },
  textParagraph: {
    textAlign: "center",
    marginBottom: 15,
    fontSize: 16,
  },
  section: { marginTop: 20, marginBottom: 10, width: "100%" },
  linkText: {
    color: "#2196F3",
    textDecorationLine: "underline",
    fontSize: 16,
    marginTop: 40,
    textAlign: "left",
  },
  backLink: {
    marginTop: 0,
    alignItems: "flex-start",
    width: "100%",
  },

  logoutButton: {
    position: "absolute",
    bottom: 0,
    left: 20,
  },
  messageBlock: {
    width: "100%",
    marginBottom: 10,
    padding: 10,
  },

  buttonRightAlign: {
    alignItems: "flex-end",
    marginBottom: -5,
  },
  customButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 5,
    marginBottom: 10,
  },

  orangeButton: {
    backgroundColor: "#f59e0b", // כתום עדין
  },

  greenButton: {
    backgroundColor: "#10b981", // ירוק נעים
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  textMessage: {
    fontSize: 16,
    textAlign: "center",
    color: "#4CAF50",
    marginBottom: 10,
  }
});
