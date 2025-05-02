import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";

const moods = [
  { id: "great", label: "מצוין" },
  { id: "good", label: "טוב" },
  { id: "okay", label: "בסדר" },
  { id: "bad", label: "רע" },
  { id: "terrible", label: "נורא" },
];

export default function MoodSelector({ onMoodSelect }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [animations, setAnimations] = useState(
    moods.reduce((acc, mood) => {
      acc[mood.id] = new Animated.Value(1);
      return acc;
    }, {})
  );

  const handleSelect = (moodId) => {
    setSelectedMood(moodId);
    onMoodSelect && onMoodSelect(moodId);

    Animated.sequence([
      Animated.spring(animations[moodId], {
        toValue: 1.2,
        useNativeDriver: true,
      }),
      Animated.spring(animations[moodId], {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>מה מצב הרוח שלך היום?
      </Text>
      <View style={styles.moodRow}>
        {moods.map((mood) => (
          <TouchableOpacity
            key={mood.id}
            onPress={() => handleSelect(mood.id)}
            activeOpacity={0.8}
          >
            <Animated.View
              style={[
                styles.moodButton,
                selectedMood === mood.id && styles.activeMood,
                { transform: [{ scale: animations[mood.id] }] },
              ]}
            >
              <Text style={styles.moodText}>{mood.label}</Text>
            </Animated.View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginTop: 20,
    padding: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  moodRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  moodButton: {
    backgroundColor: "#f1f1f1",
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    margin: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  activeMood: {
    backgroundColor: "#d1e7dd",
  },
  moodText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});
