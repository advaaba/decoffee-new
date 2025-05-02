import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, I18nManager } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BASE_URL from "../../utils/apiConfig";
import { useRouter } from "expo-router";

// הפוך את הכיווניות אם צריך (רק אם עדיין לא מוגדר מראש)
I18nManager.forceRTL?.();

export default function GeneralData() {
  const [surveyData, setSurveyData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSurveyData = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return;

        const response = await axios.get(`${BASE_URL}/api/auth/get-user/${userId}`);
        const coffeeData = response.data.user?.coffeeConsumption;
        if (coffeeData) {
          setSurveyData(coffeeData);
        }
      } catch (error) {
        console.error("שגיאה בשליפת נתוני הסקירה:", error);
      }
    };

    fetchSurveyData();
  }, []);

  if (!surveyData) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>⏳ טוען נתונים...</Text>
      </View>
    );
  }

  return (
    <View contentContainerStyle={styles.container}>
      <Text style={styles.title}>📋 סקירה כללית - נתוני קפה</Text>

      <View style={styles.card}>
        <Text style={styles.label}>🍵 ממוצע כוסות ביום:</Text>
        <Text style={styles.value}>{surveyData.cupsPerDay}</Text>

        <Text style={styles.label}>🕗 זמני שתייה:</Text>
        <Text style={styles.value}>{surveyData.consumptionTime.join(", ")}</Text>

        <Text style={styles.label}>📏 סוגי קפה:</Text>
        <Text style={styles.value}>
          {surveyData.coffeeType
            .map((c) => `${c.name} (${c.cups} כוסות, ${c.size} מ״ל)`)
            .join(" | ")}
        </Text>

        <Text style={styles.label}>🛌 שעות שינה:</Text>
        <Text style={styles.value}>
          {surveyData.sleepFromHour} - {surveyData.sleepToHour}
        </Text>

        <Text style={styles.label}>💼 עובד/ת:</Text>
        <Text style={styles.value}>
          {surveyData.isWorking === "yes" ? "כן" : "לא"}
        </Text>

        {surveyData.isWorking === "yes" && (
          <>
            <Text style={styles.label}>🕘 שעות עבודה:</Text>
            <Text style={styles.value}>
              {surveyData.workStartHour} - {surveyData.workEndHour}
            </Text>
          </>
        )}

        <Text style={styles.label}>📉 מנסה להפחית צריכה:</Text>
        <Text style={styles.value}>
          {surveyData.isTryingToReduce === "yes" ? "כן" : "לא"}
        </Text>

        {surveyData.isTryingToReduce === "yes" && (
          <>
            <Text style={styles.label}>✏️ הסבר:</Text>
            <Text style={styles.value}>{surveyData.reductionExplanation}</Text>
          </>
        )}

        <Text style={styles.label}>📈 חשיבות המעקב:</Text>
        <Text style={styles.value}>{surveyData.importanceLevel}/5</Text>

        <Text style={styles.label}>🧠 השפעה:</Text>
        <Text style={styles.value}>{surveyData.effects}</Text>

        <Text style={styles.label}>🧾 תיאור אישי:</Text>
        <Text style={styles.value}>{surveyData.selfDescription}</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push({ pathname: "/CoffeeDetails", params: { editMode: "true" } })}
      >
        <Text style={styles.buttonText}>עריכת הסקירה</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    gap: 10,
    direction: "rtl",
    alignItems: "stretch",
    backgroundColor: "#FAFAFA",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
    textAlign: "right",
  },
  value: {
    fontSize: 16,
    color: "#222",
    textAlign: "right",
    marginBottom: 25,
  },
  button: {
    backgroundColor: "#4CAF50",
    marginTop: 30,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    alignSelf: "center",
    width: "60%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 50,
    color: "#777",
  },
});
