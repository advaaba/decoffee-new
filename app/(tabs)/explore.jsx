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
import { useFocusEffect, useRouter } from "expo-router";
import RadioGroup from "react-native-radio-buttons-group";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import BASE_URL from "../../utils/apiConfig";
import HistoryDailyData from "./historyDailyData";
import PatternBarChart from "./PatternBarChart";

export default function ExploreScreen() {
  const router = useRouter();
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [relevanceAnswer, setRelevanceAnswer] = useState(null);
  const [appliedAnswer, setAppliedAnswer] = useState(null);
  const [pattern, setPattern] = useState(null);
  const [dailyInsights, setDailyInsights] = useState([]);
  const [dailyRecommendations, setDailyRecommendations] = useState([]);
  const [hasTodayDailyData, setHasTodayDailyData] = useState(null);
  const [patternCounts, setPatternCounts] = useState({});
  const [hasDailyHistory, setHasDailyHistory] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const [refreshHistoryTrigger, setRefreshHistoryTrigger] = useState(
    Date.now()
  );

  const yesNoMaybeOptions = [
    { id: "yes", label: "כן", value: "yes" },
    { id: "no", label: "לא", value: "no" },
    { id: "don't know", label: "לא יודע/ת", value: "don't know" },
  ];

  const patternTranslations = {
    morning_drinker: "שותה קפה בבוקר כדי להתעורר",
    fatigue_based: "שתייה עקב עייפות",
    fatigue_response: "תגובה לעייפות",
    stress_drinker: "שתייה עקב מתח",
    high_intake: "צריכה גבוהה לפי משקל",
    habitual: "שתייה מתוך הרגל",
    habitual_drinker: "שתייה מתוך הרגל",
    considered_but_avoided: "שקל/ה אך נמנע/ה",
    trying_to_reduce: "מנסה להפחית צריכה",
    balanced: "צריכה מאוזנת",
    pregnancy_limit_exceeded: "חריגה בהריון",
    compensating_lifestyle: "פיצוי על חוסר תנועה",
    health_risk: "סיכון בריאותי",
    avoidance_due_to_physical_effects: "הימנעות עקב השפעה פיזית",
    avoidance_due_to_mental_effects: "הימנעות עקב השפעה מנטלית",
    conscious_no_coffee: "החלטה מודעת להימנע מקפה",
    no_coffee_unintentional: "לא שתה – ללא כוונה מיוחדת",
    general_consumption: "שתייה כללית / מסיבה אחרת",
    unknown: "לא זוהה דפוס",
  };

  const testPatterns = {
    fatigue_response: 5,
    morning_routine: 3,
    considered_but_avoided: 2,
    habitual_drinker: 1,
  };

  const handleFeedbackSubmit = async () => {
    if (feedbackSubmitted) {
      Alert.alert("הודעה", "כבר מילאת משוב להיום.");
      return;
    }

    const userId = await AsyncStorage.getItem("userId");
    const today = new Date().toISOString().split("T")[0];

    try {
      const recommendationText = dailyRecommendations[0]?.text;
      if (!recommendationText || !relevanceAnswer || !appliedAnswer) {
        Alert.alert("שגיאה", "נא למלא את שני השדות לפני השליחה");
        return;
      }

      await axios.put(`${BASE_URL}/api/dailypattern/feedback/${userId}`, {
        date: today,
        recommendationText,
        relevance: relevanceAnswer,
        applied: appliedAnswer,
      });

      console.log(
        "📡 שולחת PUT לכתובת:",
        `${BASE_URL}/api/dailypattern/feedback/${userId}`
      );
      console.log("📤 נשלח לשרת:", {
        date: today,
        recommendationText,
        relevance: relevanceAnswer,
        applied: appliedAnswer,
      });

      setFeedbackSubmitted(true); // 🔒 ננעל לאחר שליחה מוצלחת

      Alert.alert("✅ נשמר", "המשוב נשמר בהצלחה");
    } catch (error) {
      console.error("❌ שגיאה בשמירת משוב:", error);
      Alert.alert("שגיאה", "אירעה שגיאה בעת שמירת המשוב");
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const analyzeAndFetch = async () => {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return;

        try {
          const today = new Date().toISOString().split("T")[0];
          const historyRes = await axios.get(
            `${BASE_URL}/api/dailypattern/history/${userId}`
          );
          if (historyRes.data?.insights?.length > 0) {
            setHasDailyHistory(true);
          }

          const checkDailyData = await axios.get(
            `${BASE_URL}/api/dailydata/check`,
            { params: { userId, date: today } }
          );
          setHasTodayDailyData(checkDailyData.data.exists);

          const dailyResponse = await axios.get(
            `${BASE_URL}/api/dailypattern/get-insights/${userId}`,
            { params: { date: today } }
          );
          const feedback = dailyResponse.data.feedback;
          if (feedback && feedback.relevance && feedback.applied) {
            setFeedbackSubmitted(true);
            setRelevanceAnswer(feedback.relevance);
            setAppliedAnswer(feedback.applied);
          }

          setRefreshHistoryTrigger(Date.now());
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

          const insightRes = await axios.get(
            `${BASE_URL}/api/pattern/get-insights/${userId}?type=general`
          );
          const { insights, recommendations, pattern } = insightRes.data;

          setPattern(pattern);
          setInsights(insights.map((i) => i.text));
          setRecommendations(recommendations.map((r) => r.text));
        } catch (err) {
          console.error("❌ שגיאה בניתוח הדפוס:", err);
          Alert.alert("שגיאה", "אירעה שגיאה בעת ניתוח הנתונים");
        }
      };

      analyzeAndFetch();
    }, [])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {(insights.length > 0 || recommendations.length > 0 || pattern) && (
        <View style={styles.generalContainer}>
          <Text style={styles.title}>📌 סקירה כללית</Text>

          {insights.length > 0 && (
            <>
              <Text style={styles.subtitle}>תובנה</Text>
              {insights.map((text, index) => (
                <Text key={index} style={styles.insightText}>
                  {text}
                </Text>
              ))}
            </>
          )}

          {recommendations.length > 0 && (
            <>
              <Text style={styles.subtitle}>המלצה</Text>
              {recommendations.map((rec, index) => (
                <Text key={index} style={styles.recText}>
                  {rec}
                </Text>
              ))}
            </>
          )}

          {pattern && (
            <>
              <Text style={styles.subtitle}>דפוס מזוהה</Text>
              <Text style={styles.patternText}>
                {patternTranslations[pattern] || "דפוס לא מזוהה"}
              </Text>
            </>
          )}
        </View>
      )}

      {dailyInsights.length > 0 && dailyRecommendations.length > 0 && (
        <View style={styles.generalContainer}>
          <Text style={styles.title}>📅 סקירה יומית</Text>

          <Text style={styles.subtitle}>תובנה</Text>
          {dailyInsights.map((text, index) => (
            <Text key={index} style={styles.insightText}>
              {text.text}
            </Text>
          ))}

          <Text style={styles.subtitle}>המלצה</Text>
          {dailyRecommendations.map((rec, index) => (
            <Text key={index} style={styles.recText}>
              {rec.text}
            </Text>
          ))}

          <View style={styles.feedbackContainer}>
            {!feedbackSubmitted ? (
              <>
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
                  <Button title="שמור משוב" onPress={handleFeedbackSubmit} />
                </View>
              </>
            ) : (
              <Text
                style={{ fontSize: 16, textAlign: "center", color: "#555" }}
              >
                ✅ המשוב שלך נשמר. תודה!
              </Text>
            )}
          </View>

          {hasTodayDailyData === false && (
            <View style={styles.generalContainer}>
              <Text style={styles.title}>📅 סקירה יומית</Text>
              <Text style={styles.insightText}>
                טרם הוזנה סקירה יומית עבור היום.{" "}
                <Text
                  style={{ color: "blue", textDecorationLine: "underline" }}
                  onPress={() => router.push("/create")}
                >
                  לחצ/י כאן להזנה
                </Text>
              </Text>
            </View>
          )}
        </View>
      )}

      {insights.length === 0 && dailyInsights.length === 0 && (
        <Text style={{ textAlign: "center", fontSize: 16, marginVertical: 20 }}>
          טרם מולאו תובנות או המלצות. חזור/י לכאן לאחר מילוי הסקירה.
        </Text>
      )}
      {hasDailyHistory && <PatternBarChart patternCounts={testPatterns} />}
      <HistoryDailyData />
    </ScrollView>
  );
}

{
  /* {caffeineMin !== null && caffeineMax !== null ? (
              <Text>
                כמות הקפאין המומלצת עבורך: {caffeineMin} - {caffeineMax} מ"ג ביום (
                {finalCaffeine} סה\"כ)
              </Text>
            ) : (
              <Text>טוען נתונים...</Text>
            )} */
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    minHeight: "100%",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  text: {
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
  generalContainer: {
    backgroundColor: "#f0f4f8",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 5,
    marginTop: 15,
    textAlign: "center",
    color: "#184e77",
  },

  patternText: {
    fontSize: 18,
    marginTop: 5,
    textAlign: "center",
    color: "#333",
  },
  feedbackContainer: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
});
