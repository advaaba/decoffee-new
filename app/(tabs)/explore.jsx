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
import * as tf from "@tensorflow/tfjs";

export default function ExploreScreen() {
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [relevanceAnswer, setRelevanceAnswer] = useState(null);
  const [appliedAnswer, setAppliedAnswer] = useState(null);
  const [pattern, setPattern] = useState(null);
  const [openaiResult, setOpenaiResult] = useState(null);
  
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
        // שליפת הנתונים
        const userResponse = await axios.get(
          `${BASE_URL}/api/auth/get-user/${userId}`
        );
        const generalResponse = await axios.get(
          `${BASE_URL}/api/generaldata/get-survey/${userId}`
        );
        const user = userResponse.data.user;
        const general = generalResponse.data.survey;

        // בניית אובייקט לניתוח
        const analysisInput = {
          userId: user.userId,
          averageCaffeinePerDay: general.averageCaffeinePerDay,
          caffeineRecommendationMin: user.caffeineRecommendationMin,
          caffeineRecommendationMax: user.caffeineRecommendationMax,
          consumptionTime: general.consumptionTime,
          sleepDurationAverage: general.sleepDurationAverage,
        };

        // שליחת הנתונים לניתוח ושמירה במסד
        await axios.post(`${BASE_URL}/api/pattern/analyze`, analysisInput);

        // לאחר מכן – שליפת התובנות וההמלצות שנשמרו
        const response = await axios.get(
          `${BASE_URL}/api/pattern/get-insights/${userId}`
        );
        const { insight, recommendation, pattern } = response.data;
        setInsights(insight);
        setRecommendations(recommendation);
        setPattern(pattern);
      } catch (err) {
        console.error("❌ שגיאה במהלך ניתוח או שליפה:", err);
      }
    };

    analyzeAndFetch();
  }, []);

  const handleSaveFeedback = async () => {
    if (!relevanceAnswer || !appliedAnswer) {
      Alert.alert("שגיאה", "נא למלא את שתי השאלות לפני שמירה");
      return;
    }

    try {
      const userId = await AsyncStorage.getItem("userId");

      // נניח שאת רוצה לשמור רק את ההמלצה הראשונה
      const recommendationText = recommendations[0];

      const response = await axios.put(
        `${BASE_URL}/api/prediction/recommendations/${userId}/feedback`,
        {
          recommendationText,
          relevance: relevanceAnswer,
          applied: appliedAnswer,
        }
      );

      Alert.alert("✅ הצלחה", response.data.message || "המשוב נשמר בהצלחה");
    } catch (error) {
      console.error("❌ שגיאה בשמירת המשוב:", error);
      Alert.alert("❌ שגיאה", "אירעה שגיאה בעת שמירת המשוב");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>תובנות</Text>
      {insights.map((text, index) => (
        <Text key={index} style={styles.insightText}>
          {text}
        </Text>
      ))}

      <Text style={styles.title}>המלצות</Text>
      {recommendations.map((rec, index) => (
        <View key={index}>
          <Text style={styles.recText}>{rec}</Text>
        </View>
      ))}
      <Text style={styles.title}> דפוס מזוהה</Text>
      <Text style={{ textAlign: "center", marginBottom: 10 }}>
        {pattern || "לא זוהה דפוס"}
      </Text>
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
        <Button title="שמור משוב" onPress={handleSaveFeedback} />
      </View>
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
