import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import BASE_URL from "../../utils/apiConfig";

export default function HistoryDailyData() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndexes, setExpandedIndexes] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return;

      try {
        const res = await axios.get(
          `${BASE_URL}/api/dailypattern/history/${userId}`
        );
        const { insights, recommendations } = res.data;

        const combined = insights.map((insight, index) => ({
          date: insight.date || "ללא תאריך",
          insight: insight.text,
          recommendation: recommendations[index]?.text || "אין המלצה",
        }));

        setHistory(combined.reverse()); // הצגה מהחדש לישן
      } catch (err) {
        console.error("❌ שגיאה בשליפת היסטוריה יומית:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const toggleExpand = (index) => {
    setExpandedIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#888" />
        <Text>טוען היסטוריה...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📚 היסטוריית סקירות יומיות</Text>
      {history.length === 0 ? (
        <Text style={styles.empty}>אין עדיין תובנות והמלצות יומיות</Text>
      ) : (
        history.map((entry, idx) => (
          <View key={idx} style={styles.card}>
            <Text style={styles.date}>תאריך: {entry.date}</Text>
            <Text style={styles.insight} onPress={() => toggleExpand(idx)}>
              תובנה:{" "}
              {expandedIndexes.includes(idx)
                ? entry.insight
                : entry.insight.length > 80
                ? entry.insight.substring(0, 80) + "..."
                : entry.insight}
            </Text>

            <Text
              style={styles.recommendation}
              onPress={()  => toggleExpand(idx)}
            >
              המלצה:{" "}
              {expandedIndexes.includes(idx)
                ? entry.recommendation
                : entry.recommendation.length > 80
                ? entry.recommendation.substring(0, 80) + "..."
                : entry.recommendation}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  date: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    textAlign: "right",
  },
  insight: {
    fontSize: 16,
    marginBottom: 4,
    color: "#1a237e", 
    textAlign: "right",
  },
  recommendation: {
    fontSize: 16,
    color: "#1a237e",
    textAlign: "right",
  },
  
  empty: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 30,
  },
});
