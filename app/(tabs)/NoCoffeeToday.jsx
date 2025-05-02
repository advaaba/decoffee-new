import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Button,
  Alert
} from "react-native";
import RadioGroup from "react-native-radio-buttons-group";
import { useRouter } from "expo-router";
import BASE_URL from "../../utils/apiConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function NoCoffeeToday({ onDataChange, generalData, entryId }) {
  console.log("entryId שקיבלתי:", entryId);
  const router = useRouter();
  const [feltWithoutCoffee, setFeltWithoutCoffee] = useState("");
  const [consideredDrinking, setConsideredDrinking] = useState(null);
  const [willDrinkLater, setWillDrinkLater] = useState(null);
  const [reasonNotDrinking, setReasonNotDrinking] = useState("");
  const [consciousDecision, setConsciousDecision] = useState(null);
  const [willDrinkTomorrow, setWillDrinkTomorrow] = useState(null);
  const [wantToContinueNoCoffee, setWantToContinueNoCoffee] = useState(null);
  const [consideredDrinkingReason, setConsideredDrinkingReason] = useState("");
  const [willDrinkLaterReason, setWillDrinkLaterReason] = useState("");
  const [formData, setFormData] = useState({});
  
  console.log("🔵 קיבלתי את הנתונים מ-Create:", generalData);
  useEffect(() => {
    console.log("entryId שקיבלתי:", entryId);
  }, []);
  
  useEffect(() => {
    const data = {
      feltWithoutCoffee,
      consideredDrinking,
      consideredDrinkingReason,
      willDrinkLater,
      willDrinkLaterReason,
      reasonNotDrinking,
      consciousDecision,
      willDrinkTomorrow,
      wantToContinueNoCoffee,
    };
  
    const isValid = feltWithoutCoffee.trim() !== "" &&
      consideredDrinking &&
      (consideredDrinking !== "yes" || consideredDrinkingReason.trim() !== "") &&
      willDrinkLater &&
      (willDrinkLater !== "yes" || willDrinkLaterReason.trim() !== "") &&
      reasonNotDrinking.trim() !== "" &&
      consciousDecision &&
      willDrinkTomorrow &&
      wantToContinueNoCoffee;
  
    onDataChange && onDataChange({ data, isValid });
  }, [
    feltWithoutCoffee,
    consideredDrinking,
    consideredDrinkingReason,
    willDrinkLater,
    willDrinkLaterReason,
    reasonNotDrinking,
    consciousDecision,
    willDrinkTomorrow,
    wantToContinueNoCoffee,
  ]);
  

  const isFormValid = useMemo(() => {
    return (
      feltWithoutCoffee.trim() !== "" &&
      consideredDrinking &&
      (consideredDrinking !== "yes" ||
        consideredDrinkingReason.trim() !== "") &&
      willDrinkLater &&
      (willDrinkLater !== "yes" || willDrinkLaterReason.trim() !== "") &&
      reasonNotDrinking.trim() !== "" &&
      consciousDecision &&
      willDrinkTomorrow &&
      wantToContinueNoCoffee
    );
  }, [
    feltWithoutCoffee,
    consideredDrinking,
    consideredDrinkingReason,
    willDrinkLater,
    willDrinkLaterReason,
    reasonNotDrinking,
    consciousDecision,
    willDrinkTomorrow,
    wantToContinueNoCoffee,
  ]);

  const yesNoOptions = [
    { id: "yes", label: "כן", value: "yes" },
    { id: "no", label: "לא", value: "no" },
  ];

  const yesNoMaybeOptions = [
    { id: "yes", label: "כן", value: "yes" },
    { id: "no", label: "לא", value: "no" },
    { id: "don't know", label: "לא יודע/ת", value: "don't know" },
  ];

  const handleContinue = async () => {
    
    const userId = await AsyncStorage.getItem("userId");
  
    const finalData = {
      userId,
      date: new Date().toISOString().split("T")[0],
      sleepFromHour: generalData.sleepFromHour,
      sleepToHour: generalData.sleepToHour,
      sleepHours: generalData.sleepDurationAverage,
      mood: generalData.mood,
      focusLevel: generalData.focusLevel,
      tirednessLevel: generalData.tirednessLevel,
      drankCoffee: false,
      coffeeDetails: null,
      noCoffeeDetails: {
        feltWithoutCoffee,
        consideredDrinking,
        consideredDrinkingReason,
        willDrinkLater,
        willDrinkLaterReason,
        reasonNotDrinking,
        consciousDecision,
        willDrinkTomorrow,
        wantToContinueNoCoffee
      }
    };
  

    try {
      if (entryId) {
        await axios.put(`${BASE_URL}/api/dailyData/${entryId}`, finalData);
        Alert.alert("✅ הסקירה עודכנה בהצלחה!");
      } else {
        await axios.post(`${BASE_URL}/api/dailyData`, finalData);
        Alert.alert("✅ הסקירה נשמרה בהצלחה!");
      }
      router.push("/(tabs)/create?reload=true");

    } catch (err) {
      console.error("❌ שגיאה בשמירה:", err);
      Alert.alert("שגיאה", "משהו השתבש בעת השמירה.");
    }
    
  };
  
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🔵 לא שתית קפה היום – בואי נבין למה</Text>

      <Text style={styles.label}>איך הרגשת בלי קפה?</Text>
      <TextInput
        style={styles.input}
        placeholder="תארי איך הרגשת במהלך היום"
        value={feltWithoutCoffee}
        onChangeText={setFeltWithoutCoffee}
        multiline
      />

      <Text style={styles.label}>האם שקלת לשתות קפה במהלך היום?</Text>
      <RadioGroup
        radioButtons={yesNoOptions}
        onPress={setConsideredDrinking}
        selectedId={consideredDrinking}
        layout="row"
      />
      {consideredDrinking === "yes" && (
        <View>
          <Text style={styles.label}>מה גרם לך לשקול לשתות?</Text>
          <TextInput
            style={styles.input}
            placeholder="כתב/י את הסיבה"
            value={consideredDrinkingReason}
            onChangeText={setConsideredDrinkingReason}
            multiline
          />
        </View>
      )}

      <Text style={styles.label}>האם תשתה קפה היום לדעתך?</Text>
      <RadioGroup
        radioButtons={yesNoMaybeOptions}
        onPress={setWillDrinkLater}
        selectedId={willDrinkLater}
        layout="row"
      />
      {willDrinkLater === "yes" && (
        <View>
          <Text style={styles.label}>מדוע לדעתך?</Text>
          <TextInput
            style={styles.input}
            placeholder="כתב/י את הסיבה"
            value={willDrinkLaterReason}
            onChangeText={setWillDrinkLaterReason}
            multiline
          />
        </View>
      )}
      <Text style={styles.label}>האם בחרת במודע לא לשתות קפה?</Text>
      <RadioGroup
        radioButtons={yesNoOptions}
        onPress={setConsciousDecision}
        selectedId={consciousDecision}
        layout="row"
      />

      <Text style={styles.label}>מה הסיבה שלא שתית קפה היום?</Text>
      <TextInput
        style={styles.input}
        placeholder="כתבי את הסיבה"
        value={reasonNotDrinking}
        onChangeText={setReasonNotDrinking}
        multiline
      />

      <Text style={styles.label}>האם לדעתך תשתה קפה מחר?</Text>
      <RadioGroup
        radioButtons={yesNoMaybeOptions}
        onPress={setWillDrinkTomorrow}
        selectedId={willDrinkTomorrow}
        layout="row"
      />

      <Text style={styles.label}>
        האם היית רוצה להמשיך בלי קפה גם בימים הבאים?
      </Text>
      <RadioGroup
        radioButtons={yesNoOptions}
        onPress={setWantToContinueNoCoffee}
        selectedId={wantToContinueNoCoffee}
        layout="row"
      />
      <Button
        title="שליחה"
        color="#4CAF50"
        onPress={handleContinue}
        disabled={!isFormValid}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
    textAlign: "right",
  },
  input: {
    height: 45,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 10,
    width: "100%",
    marginBottom: 15,
    textAlign: "right",
    fontSize: 16,
    color: "gray",
  },
  dropdown: {
    height: 50,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 15,
    width: "100%",
  },
});
