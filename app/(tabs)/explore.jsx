// ExploreScreen.jsx
import React from "react";
import { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  StyleSheet,
  Button,
  View,
  Alert,
} from "react-native";
import RadioGroup from "react-native-radio-buttons-group";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import BASE_URL from "../../utils/apiConfig";

export default function ExploreScreen() {
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [relevanceAnswer, setRelevanceAnswer] = useState(null);
  const [appliedAnswer, setAppliedAnswer] = useState(null);
  const [pattern, setPattern] = useState(null);
  const [dailyInsights, setDailyInsights] = useState([]);
  const [dailyRecommendations, setDailyRecommendations] = useState([]);

  const yesNoMaybeOptions = [
    { id: "yes", label: "כן", value: "yes" },
    { id: "no", label: "לא", value: "no" },
    { id: "don't know", label: "לא יודע/ת", value: "don't know" },
  ];

  useEffect(() => {
    const analyzeAndFetch = async () => {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return;

      try {
        // שליפת הנתונים מהשרת
        const userResponse = await axios.get(
          `${BASE_URL}/api/auth/get-user/${userId}`
        );
        const generalResponse = await axios.get(
          `${BASE_URL}/api/generaldata/get-survey/${userId}`
        );
        const today = new Date().toISOString().split("T")[0];

        const checkDailyData = await axios.get(
          `${BASE_URL}/api/dailydata/check`,
          {
            params: { userId, date: today },
          }
        );

        if (checkDailyData.data.exists) {
          // שלב 1: הרצת ניתוח ושמירה של הסקירה היומית
          await axios.post(`${BASE_URL}/api/dailypattern/analyze`, {
            userId,
            date: today,
          });

          // שלב 2: שליפת התובנות וההמלצות מהמסד
          const dailyResponse = await axios.get(
            `${BASE_URL}/api/dailypattern/get-insights/${userId}`
          );

          console.log("📦 dailyResponse.data:", dailyResponse.data);
          console.log("🧠 dailyInsights:", dailyResponse.data.insights);
          console.log(
            "🎯 dailyRecommendations:",
            dailyResponse.data.recommendations
          );

          setDailyInsights(
            (dailyResponse.data.insights || []).filter(
              (i) => i.source === "combined"
            )
          );
          setDailyRecommendations(
            (dailyResponse.data.recommendations || []).filter(
              (r) => r.source === "combined"
            )
          );
        }

        const user = userResponse.data.user;
        const general = generalResponse.data.survey;

        const analysisInput = {
          userId: user.userId,
          averageCaffeinePerDay: general.averageCaffeinePerDay,
          caffeineRecommendationMin: user.caffeineRecommendationMin,
          caffeineRecommendationMax: user.caffeineRecommendationMax,
          consumptionTime: general.consumptionTime,
          sleepDurationAverage: general.sleepDurationAverage,
        };

        // 🔁 קריאה ל-OpenAI + שמירה בבקאנד
        const analysisResponse = await axios.post(
          `${BASE_URL}/api/pattern/analyze`,
          {
            userId: await AsyncStorage.getItem("userId"),
          }
        );

        const { pattern, insights, recommendations } = analysisResponse.data;

        setPattern(pattern);
        setInsights(insights);
        setRecommendations(recommendations.map((r) => r.text)); // רק הטקסט מתוך האובייקטים
      } catch (err) {
        console.error("❌ שגיאה בניתוח הדפוס:", err);
        Alert.alert("שגיאה", "אירעה שגיאה בעת ניתוח הנתונים");
      }
    };

    analyzeAndFetch();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {insights.length > 0 && (
        <>
          <Text style={styles.title}>תובנה כללית</Text>
          {insights.map((text, index) => (
            <Text key={index} style={styles.insightText}>
              {text}
            </Text>
          ))}
        </>
      )}

      {recommendations.length > 0 && (
        <>
          <Text style={styles.title}>המלצה כללית</Text>
          {recommendations.map((rec, index) => (
            <Text key={index} style={styles.recText}>
              {rec}
            </Text>
          ))}
        </>
      )}

      {pattern && (
        <>
          <Text style={styles.title}>דפוס מזוהה</Text>
          <Text style={{ textAlign: "center", marginBottom: 10, fontSize: 20 }}>
            {pattern}
          </Text>
        </>
      )}

      {dailyInsights.length > 0 && dailyRecommendations.length > 0 && (
        <>
          <Text style={styles.title}>תובנה יומית</Text>
          {dailyInsights.map((text, index) => (
            <Text key={index} style={styles.insightText}>
              {text.text}
            </Text>
          ))}

          <Text style={styles.title}>המלצה יומית</Text>
          {dailyRecommendations.map((rec, index) => (
            <Text key={index} style={styles.recText}>
              {rec.text}
            </Text>
          ))}

          <Text style={styles.label}>האם ההמלצה רלוונטית עבורך?</Text>
          <RadioGroup
            radioButtons={yesNoMaybeOptions}
            onPress={setRelevanceAnswer}
            selectedId={relevanceAnswer}
            layout="row"
          />
          <Text style={styles.label}>האם יישמת את ההמלצה?</Text>
          <RadioGroup
            radioButtons={yesNoMaybeOptions}
            onPress={setAppliedAnswer}
            selectedId={appliedAnswer}
            layout="row"
          />

          <View style={{ marginTop: 15 }}>
            <Button title="שמור משוב" />
          </View>
        </>
      )}

      {insights.length === 0 && dailyInsights.length === 0 && (
        <Text style={{ textAlign: "center", fontSize: 16, marginVertical: 20 }}>
          טרם מולאו תובנות או המלצות. חזור/י לכאן לאחר סקירה.
        </Text>
      )}

      {/* {caffeineMin !== null && caffeineMax !== null ? (
              <Text>
                כמות הקפאין המומלצת עבורך: {caffeineMin} - {caffeineMax} מ"ג ביום (
                {finalCaffeine} סה\"כ)
              </Text>
            ) : (
              <Text>טוען נתונים...</Text>
            )} */}

      <Text style={styles.title}>📚 היסטוריית תובנות והמלצות</Text>
      <Text style={{ textAlign: "center" }}>
        (בהמשך ניתן יהיה להציג כאן את ההיסטוריה)
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    // backgroundColor: "#fff",
    minHeight: "100%",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 15,
    // color: "#ffc8dd",
    textAlign: "center",
  },
  text: {
    // color: "white",
    marginBottom: 10,
    fontSize: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
    textAlign: "right",
  },
  insightText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "right",
  },
  recText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "right",
  },
});
