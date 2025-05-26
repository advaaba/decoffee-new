import React from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import { BarChart } from "react-native-chart-kit";

// תרגום של דפוסים לעברית
const dailyPatternLabels = {
  fatigue_response: "תגובה לעייפות",
  morning_routine: "שגרה בוקרית",
  considered_but_avoided: "שקל אך נמנע",
  conscious_no_coffee: "החלטה מודעת",
  habitual_drinker: "שתייה מתוך הרגל",
  general_consumption: "שתייה כללית",
  unknown: "לא זוהה דפוס",
};

const screenWidth = Dimensions.get("window").width;

export default function PatternBarChart({ patternCounts }) {
  if (!patternCounts || Object.keys(patternCounts).length === 0) {
    return (
      <Text style={styles.empty}>אין עדיין מספיק דפוסים להצגה בגרף.</Text>
    );
  }

  const labels = Object.keys(patternCounts).map(
    (key) => dailyPatternLabels[key] || key
  );
  const data = Object.values(patternCounts);

  return (
    <View style={styles.container}>
      <Text style={styles.title}> התפלגות דפוסים יומיים</Text>

      <BarChart
        data={{
          labels,
          datasets: [{ data }],
        }}
        width={screenWidth - 40}
        height={220}
        yAxisLabel=""
        fromZero
        chartConfig={{
          backgroundGradientFrom: "#ffffff",
          backgroundGradientTo: "#ffffff",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
          labelColor: () => "#333",
          barPercentage: 0.6,
        }}
        verticalLabelRotation={30}
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#0d47a1",
  },
  chart: {
    borderRadius: 10,
  },
  empty: {
    textAlign: "center",
    color: "#777",
    marginTop: 20,
  },
});
