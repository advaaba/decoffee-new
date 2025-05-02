// ExploreScreen.jsx
import React from "react";
import { useEffect, useState } from "react";
import { ScrollView, Text, StyleSheet } from "react-native";
import RadioGroup from "react-native-radio-buttons-group";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import BASE_URL from "../../utils/apiConfig";

export default function ExploreScreen() {
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [relevanceAnswer, setRelevanceAnswer] = useState(null);
  const [appliedAnswer, setAppliedAnswer] = useState(null);

  useEffect(() => {
    const getAnalysis = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return;

        const response = await axios.get(
          `${BASE_URL}/api/auth/get-user/${userId}`
        );

        const storedData = await AsyncStorage.getItem("userData");
        if (!storedData) return;
        const userData = JSON.parse(storedData);

        const averageCaffeinePerDay =
          userData.coffeeConsumption?.averageCaffeinePerDay || 0;

        const inputToModel = {
          age: userData.age || 0,
          averageCaffeinePerDay,
          sleepDurationAverage:
            userData.coffeeConsumption?.sleepDurationAverage || 0,
          workDurationAverage:
            userData.coffeeConsumption?.workDurationAverage || 0,
          workStartHour: userData.coffeeConsumption?.workStartHour || 0,
          workEndHour: userData.coffeeConsumption?.workEndHour || 0,
          caffeineRecommendationMin: userData.caffeineRecommendationMin || 0,
          caffeineRecommendationMax: userData.caffeineRecommendationMax || 0,
          isTryingToReduce:
            userData.coffeeConsumption?.isTryingToReduce === "yes",
          isMotivation: userData.isMotivation ?? false,
          selfDescription: userData.coffeeConsumption?.selfDescription || "",
          activityLevel: userData.activityLevel || "None",
          consumptionTime: userData.coffeeConsumption?.consumptionTime || [],
          effects: userData.coffeeConsumption?.effects || "none",
          isWorking: userData.coffeeConsumption?.isWorking || "no",
        };

        console.log("📤 שולחת בקשה לשרת עם:", inputToModel);

        // const res = await axios.post(
        //   `${BASE_URL}/api/prediction/analyze`,
        //   inputToModel
        // );

        const res = await axios.post(
          `${BASE_URL}/api/auth/get-insights/${userId}`
        );
        // setInsights(aiResponse.data.insights);
        // setRecommendations(aiResponse.data.recommendations);
        console.log("📥 התקבלה תגובה מהשרת:", res.data);

        const analysisResult = res.data;
        console.log("🎯 תוצאה מהשרת:", analysisResult);
        setInsights([analysisResult.insight]);
        setRecommendations([analysisResult.recommendation]);
      } catch (error) {
        console.error("❌ שגיאה בקבלת ניתוח מהשרת:", error.message);
      }
    };

    getAnalysis();
  }, []);

  const yesNoMaybeOptions = [
    { id: "yes", label: "כן", value: "yes" },
    { id: "no", label: "לא", value: "no" },
    { id: "don't know", label: "לא יודע/ת", value: "don't know" },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📊 תובנות:</Text>
      {insights.map((text, idx) => (
        <Text key={idx}>• {text}</Text>
      ))}

      <Text style={styles.title}>🎯 המלצות:</Text>
      {recommendations.map((text, idx) => (
        <Text key={idx}>• {text}</Text>
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

      {/* {caffeineMin !== null && caffeineMax !== null ? (
              <Text>
                כמות הקפאין המומלצת עבורך: {caffeineMin} - {caffeineMax} מ"ג ביום (
                {finalCaffeine} סה\"כ)
              </Text>
            ) : (
              <Text>טוען נתונים...</Text>
            )} */}

      <Text style={styles.text}>היסטוריית תובנות & המלצות</Text>
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
});
