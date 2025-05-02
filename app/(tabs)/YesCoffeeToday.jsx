import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Button,
  Alert,
} from "react-native";
import RadioGroup from "react-native-radio-buttons-group";
import { Dropdown, MultiSelect } from "react-native-element-dropdown";
import axios from "axios";
import { useRouter } from "expo-router";
import BASE_URL from "../../utils/apiConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function YesCoffeeToday({ onDataChange, generalData, entryId }) {
  console.log("entryId שקיבלתי:", entryId);
  const router = useRouter();
  const [cups, setCups] = useState("");
  const [coffeeType, setCoffeeType] = useState("");
  const [timesDrank, setTimesDrank] = useState("");
  const [reason, setReason] = useState("");
  const [feltEffect, setFeltEffect] = useState(null);
  const [specialNeed, setSpecialNeed] = useState(null);
  const [consideredReducing, setConsideredReducing] = useState(null);
  const [wantToReduceTomorrow, setWantToReduceTomorrow] = useState(null);
  const [consumptionTime, setConsumptionTime] = useState([]);
  const [servingSizesByType, setServingSizesByType] = useState({});
  const [coffeeTypesFromDb, setCoffeeTypesFromDb] = useState([]);
  const [specialNeedReason, setSpecialNeedReason] = useState("");
  const [coffeeData, setCoffeeData] = useState({
    coffeeType: [],
    consumptionTime: [],
    cupsPerDay: null,
  });

  const [formData, setFormData] = useState({});
  console.log("🔵 קיבלתי את הנתונים מ-Create:", generalData);

  useEffect(() => {
    console.log("entryId שקיבלתי:", entryId);
  }, []);

  useEffect(() => {
    const fetchCoffeeTypes = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/drinks`);

        setCoffeeTypesFromDb(response.data); // שומרת את כל המידע
      } catch (error) {
        console.error("❌ שגיאה בשליפת סוגי הקפה:", error.message);
      }
    };

    fetchCoffeeTypes();
  }, []);

  useEffect(() => {
    const data = {
      cups,
      coffeeType: coffeeData.coffeeType,
      consumptionTime,
      reason,
      feltEffect,
      specialNeed,
      consideredReducing,
      wantToReduceTomorrow,
      specialNeedReason,
    };

    const isValid =
      cups &&
      coffeeData.coffeeType.length > 0 &&
      consumptionTime.length > 0 &&
      reason.trim() !== "" &&
      feltEffect &&
      specialNeed &&
      consideredReducing &&
      wantToReduceTomorrow &&
      (specialNeed !== "yes" || specialNeedReason.trim() !== "");

    onDataChange && onDataChange({ data, isValid });
  }, [
    cups,
    coffeeData,
    consumptionTime,
    reason,
    feltEffect,
    specialNeed,
    consideredReducing,
    wantToReduceTomorrow,
    specialNeedReason,
  ]);

  const isFormValid = useMemo(() => {
    return (
      cups &&
      coffeeData.coffeeType.length > 0 &&
      consumptionTime.length > 0 &&
      reason.trim() !== "" &&
      feltEffect &&
      specialNeed &&
      consideredReducing &&
      wantToReduceTomorrow &&
      (specialNeed !== "yes" || specialNeedReason.trim() !== "")
    );
  }, [
    cups,
    coffeeData,
    consumptionTime,
    reason,
    feltEffect,
    specialNeed,
    consideredReducing,
    wantToReduceTomorrow,
    specialNeedReason,
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

  const handleInputChange = (key, value) => {
    setCoffeeData((prev) => ({ ...prev, [key]: value }));
  };

  const coffeeOptions = coffeeTypesFromDb.map((drink) => ({
    label: drink.name,
    value: drink.value,
  }));

  const coffeeConsumption = Array.from({ length: 10 }, (_, i) => ({
    label: `כוסות ${i + 1}`,
    value: i + 1,
  }));

  const timesPerDay = [
    { label: "בוקר", value: "Morning" },
    { label: "צהריים", value: "Afternoon" },
    { label: "ערב", value: "evening" },
    { label: "לילה", value: "night" },
  ];

  const handleContinue = async () => {
    console.log("▶️ לחצו על כפתור השליחה");
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
      drankCoffee: true,
      coffeeDetails: {
        cups,
        coffeeType: coffeeData.coffeeType,
        consumptionTime,
        reason,
        feltEffect,
        specialNeed,
        specialNeedReason,
        consideredReducing,
        wantToReduceTomorrow,
      },
      noCoffeeDetails: null,
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
      <Text style={styles.title}>
        🟢 שתית קפה היום – מעולה! נרשום את הנתונים
      </Text>

      <Text style={styles.label}>כמה כוסות קפה שתית היום?</Text>
      <Dropdown
        style={styles.dropdown}
        data={coffeeConsumption}
        labelField="label"
        valueField="value"
        placeholder="בחר כמות"
        value={cups}
        onChange={(item) => setCups(item.value)}
        placeholderStyle={styles.placeholderText}
        selectedTextStyle={styles.selectedText}
      />

      <Text style={styles.label}>איזה סוג קפה שתית?</Text>
      <MultiSelect
         style={[styles.dropdown, { zIndex: 1000 }]}
        data={coffeeOptions}
        labelField="label"
        valueField="value"
        placeholder="בחר סוגי קפה"
        value={coffeeData.coffeeType}
        onChange={(selectedTypes) => {
          handleInputChange("coffeeType", selectedTypes);

          // יוצרים map חדש של serving sizes לפי סוגים שנבחרו
          const newServingMap = {};
          selectedTypes.forEach((type) => {
            newServingMap[type] = servingSizesByType[type] || null;
          });
          setServingSizesByType(newServingMap);
        }}
        placeholderStyle={styles.placeholderText}
        selectedTextStyle={styles.selectedText}
        selectedStyle={{
          flexDirection: "row-reverse",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
        itemTextStyle={{
          textAlign: "right",
          textDirection: "rtl",
        }}
        containerStyle={{ zIndex: 1000 }}
      />

      <Text style={styles.label}>באילו שעות שתית קפה?</Text>

      <MultiSelect
        style={[styles.dropdown, { zIndex: 1000 }]}
        data={timesPerDay}
        labelField="label"
        valueField="value"
        placeholder="בחר זמן"
        value={consumptionTime}
        onChange={setConsumptionTime}
        placeholderStyle={styles.placeholderText}
        selectedTextStyle={styles.selectedText}
        selectedStyle={{
          flexDirection: "row-reverse",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
        containerStyle={{ zIndex: 1000 }}
        itemTextStyle={{
          textAlign: "right",
          textDirection: "rtl",
        }}
      />

      <Text style={styles.label}>מה הסיבה ששתית קפה היום?</Text>
      <TextInput
        style={styles.input}
        value={reason}
        onChangeText={setReason}
        placeholder="ריכוז, הרגל, עייפות, מצב רוח וכו'"
        multiline
      />

      <Text style={styles.label}>האם הרגשת את השפעת הקפה לסיבה?</Text>
      <RadioGroup
        radioButtons={yesNoOptions}
        onPress={setFeltEffect}
        selectedId={feltEffect}
        layout="row"
      />

      <Text style={styles.label}>
        האם הרגשת צורך מיוחד בקפה היום לעומת ימים רגילים?
      </Text>
      <RadioGroup
        radioButtons={yesNoOptions}
        onPress={setSpecialNeed}
        selectedId={specialNeed}
        layout="row"
      />
      {specialNeed === "yes" && (
        <View>
          <Text style={styles.label}>כתוב את סיבת הצורך:</Text>
          <TextInput
            style={styles.input}
            placeholder="כתב/י את הסיבה"
            value={specialNeedReason}
            onChangeText={setSpecialNeedReason}
            multiline
          />
        </View>
      )}

      <Text style={styles.label}>האם שקלת להפחית את צריכת הקפה היום?</Text>
      <RadioGroup
        radioButtons={yesNoOptions}
        onPress={setConsideredReducing}
        selectedId={consideredReducing}
        layout="row"
      />

      <Text style={styles.label}>האם תרצה לשתות קפה מחר?</Text>
      <RadioGroup
        radioButtons={yesNoMaybeOptions}
        onPress={setWantToReduceTomorrow}
        selectedId={wantToReduceTomorrow}
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
    textAlign: "right",
    fontSize: 16,
    color: "gray",
  },
  placeholderText: {
    textAlign: "right",
    color: "#999",
  },
  selectedText: {
    textAlign: "right",
    color: "#333",
  },
});
