import React, { useEffect, useState, useCallback } from "react";
import {
  ScrollView,
  Text,
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
import { generateCustomReminders } from "../analysisFront/customReminder";

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
    const today = new Date().toISOString().split("T")[0];

    try {
      const response = await axios.get(`${BASE_URL}/api/dailyData/check`, {
        params: { userId, date: today },
      });

      if (response.data.exists) {
        setDailyStatus("מילאת את הסקירה היומית!");
      } else {
        setDailyStatus("עוד לא התחלת לעקוב אחרי צריכת הקפה שלך היום:");
      }
    } catch (error) {
      console.error("❌ שגיאה בבדיקת הסקירה היומית:", error);
    }
  };

  const markRemindersScheduled = async () => {
    const today = new Date().toISOString().split("T")[0];
    await AsyncStorage.setItem(`dailyRemindersScheduled_${today}`, "true");
  };

  const checkIfRemindersScheduled = async () => {
    const today = new Date().toISOString().split("T")[0];
    return await AsyncStorage.getItem(`dailyRemindersScheduled_${today}`);
  };

  const scheduleHourlyReminders = async () => {
    const intervals = [9, 11, 13, 15, 17, 19];

    for (let hour of intervals) {
      const date = new Date();
      date.setHours(hour, 0, 0, 0);

      if (date > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "📋 תזכורת למעקב יומי",
            body: "אל תשכח/י להזין את הסקירה היומית שלך ב־DeCoffee!",
          },
          trigger: { date },
        });
      }
    }

    console.log("📅 תזכורות כל שעתיים הוגדרו");
    await markRemindersScheduled();
  };

  const scheduleCustomReminders = async (insightData) => {
    const reminders = generateCustomReminders(insightData);

    for (const { time, message } of reminders) {
      const [hour, minute] = time.split(":").map(Number);
      const date = new Date();
      date.setHours(hour, minute, 0, 0);

      if (date > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: " תזכורת מותאמת אישית",
            body: message,
          },
          trigger: { date },
        });

        console.log(` תזכורת נקבעה ל־${time}: ${message}`);
      }
    }
  };

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

          if (dailyStatus !== "מילאת את הסקירה היומית!") {
            const alreadyScheduled = await checkIfRemindersScheduled();
            if (!alreadyScheduled) {
              await scheduleHourlyReminders();
            } else {
              console.log("🔁 תזכורות יומיות כבר הוגדרו היום");
            }
          }
        } catch (error) {
          console.error("❌ שגיאה בטעינת הסקירה הכללית:", error);
        }
      };

      refreshData();
    }, [dailyStatus])
  );

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
        const today = new Date().toISOString().split("T")[0];

        // שלב 1: שליפת משתמש
        const response = await axios.get(
          `${BASE_URL}/api/auth/get-user/${userId}`
        );

        if (response.data.success) {
          setUser(response.data.user);

          // שלב 2: בדיקת הסקירה היומית
          await checkDailyData();

          // שלב 3: שליפת הסקירה הכללית
          const surveyResponse = await axios.get(
            `${BASE_URL}/api/generalData/get-survey/${userId}`
          );
          const survey = surveyResponse.data?.survey;
          setGeneralSurvey(survey);

          // שלב 4: שליפת הסקירה היומית מהיום
          let dailyData = null;

          try {
            const dailyRes = await axios.get(
              `${BASE_URL}/api/dailyData/get/${userId}/${today}`
            );
            dailyData = dailyRes.data?.dailyData;
          } catch (error) {
            if (error.response?.status === 404) {
              console.log("📭 הסקירה היומית של היום לא קיימת עדיין.");
            } else {
              console.error("❌ שגיאה בלתי צפויה בשליפת הסקירה היומית:", error);
            }
          }

          // שלב 5: בדיקה אם תזכורות מותאמות כבר נשלחו היום
          const alreadyScheduledCustom = await AsyncStorage.getItem(
            `customRemindersScheduled_${today}`
          );

          if (!alreadyScheduledCustom) {
            const customReminderInput = {
              drankCoffee: dailyData?.drankCoffee ?? true,
              pattern: survey?.pattern,
              mood: dailyData?.mood,
              tirednessLevel: dailyData?.tirednessLevel,
              wantsToReduce: survey?.wantsToReduce,
              consumptionTime: survey?.consumptionTime,
            };

            await scheduleCustomReminders(customReminderInput);
            await AsyncStorage.setItem(
              `customRemindersScheduled_${today}`,
              "true"
            );
          } else {
            console.log("🔁 תזכורות מותאמות כבר הוגדרו היום");
          }
        }
      } catch (err) {
        console.error("❌ שגיאה בטעינת המשתמש או הסקרים:", err);
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
                            לא השלמת עדיין את הסקירה הכללית על הרגלי הקפה שלך:
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
                              onPress={() => {
                                if (
                                  !generalSurvey ||
                                  Object.values(generalSurvey).every((value) =>
                                    Array.isArray(value)
                                      ? value.length === 0
                                      : !value
                                  )
                                ) {
                                  Alert.alert(
                                    "השלמת הסקירה הכללית נחוצה",
                                    "כדי להזין סקירה יומית, עליך להשלים קודם את הסקירה הכללית על הרגלי הקפה שלך.",
                                    [
                                      { text: "בטל", style: "cancel" },
                                      {
                                        text: "עבור לסקירה",
                                        onPress: () =>
                                          router.push("/CoffeeDetails"),
                                      },
                                    ],
                                    { cancelable: true }
                                  );
                                } else {
                                  router.push("/create");
                                }
                              }}
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

{
  /* <Button
              title="שלח לי תזכורת עכשיו 🚀"
              onPress={sendImmediateNotification}
              color="#2196F3"
              style={{ marginTop: 10 }}
            /> */
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
  },
});
