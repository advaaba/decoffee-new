import React, { useState, useMemo, useEffect, useRef } from "react";
import { Dropdown } from "react-native-element-dropdown";
import RadioGroup from "react-native-radio-buttons-group";
import {
  View,
  Text,
  Input,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import YesCoffeeToday from "./YesCoffeeToday";
import NoCoffeeToday from "./NoCoffeeToday";
import { useRouter, useLocalSearchParams } from "expo-router";
import MoodSelector from "./MoodSelector";

export default function DailyQuestions({ isEditMode, editParams }) {
  const [sleepFromHour, setSleepFromHour] = useState(null);
  const [sleepToHour, setSleepToHour] = useState(null);
  const router = useRouter();

  const [mood, setMood] = useState(null);
  const [focusLevel, setFocusLevel] = useState("");
  const [tirednessLevel, setTirednessLevel] = useState("");
  const [isDrinking, setIsDrinking] = useState(null);
  const [yesCoffeeValid, setYesCoffeeValid] = useState(false);
  const [noCoffeeValid, setNoCoffeeValid] = useState(false);
  const [yesCoffeeData, setYesCoffeeData] = useState(null);
  const [noCoffeeData, setNoCoffeeData] = useState(null);
  const params = editParams || {};

  const initializedRef = useRef(false);

  useEffect(() => {
  
    if (!initializedRef.current && isEditMode && params.entryId) {
      initializedRef.current = true;

      // כל הטענת הנתונים הקיימת
      if (params.sleepFromHour)
        setSleepFromHour(parseFloat(params.sleepFromHour));
      if (params.sleepToHour) setSleepToHour(parseFloat(params.sleepToHour));
      if (params.mood) setMood(params.mood);
      if (params.focusLevel) setFocusLevel(params.focusLevel);
      if (params.tirednessLevel) setTirednessLevel(params.tirednessLevel);

      if (params.drankCoffee === "true") {
        setIsDrinking("yes");
        if (params.coffeeDetails) {
          try {
            const coffee = JSON.parse(params.coffeeDetails);
            setYesCoffeeData(coffee);
            setYesCoffeeValid(true);
          } catch (err) {
            console.error("❌ שגיאה בפירוק coffeeDetails", err);
          }
        }
      } else if (params.drankCoffee === "false") {
        setIsDrinking("no");
        if (params.noCoffeeDetails) {
          try {
            const noCoffee = JSON.parse(params.noCoffeeDetails);
            setNoCoffeeData(noCoffee);
            setNoCoffeeValid(true);
          } catch (err) {
            console.error("❌ שגיאה בפירוק noCoffeeDetails", err);
          }
        }
      }
    }
  }, [isEditMode, params]);

  const exitEditMode = () => {
    router.replace("/(tabs)/create"); // מסיר את הפרמטרים מה-URL
  };
  
  
  const calculateDuration = (start, end) => {
    if (start == null || end == null) return 0;
    return end >= start ? end - start : 24 - start + end;
  };

  const sleepDurationAverage = useMemo(
    () => calculateDuration(sleepFromHour, sleepToHour),
    [sleepFromHour, sleepToHour]
  );

  const ratingOptions = [
    { id: "great", label: "מצוין", value: "great" },
    { id: "good", label: "טוב", value: "good" },
    { id: "okay", label: "בסדר", value: "okay" },
    { id: "bad", label: "רע", value: "bad" },
    { id: "terrible", label: "נורא", value: "terrible" },
  ];

  const hoursOptions = Array.from({ length: 24 * 2 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minutes = (i % 2) * 30;
    return {
      label: `${hour.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`,
      value: hour + minutes / 60,
    };
  });

  const [radioButtons, setRadioButtons] = useState([
    { id: "yes", label: "כן", value: "yes" },
    { id: "no", label: "לא", value: "no" },
  ]);

  const isFormValid = useMemo(() => {
    if (!sleepFromHour || !sleepToHour || sleepDurationAverage === 0)
      return false;
    if (!mood || !focusLevel || !tirednessLevel) return false;

    if (isDrinking === "yes" && !yesCoffeeValid) return false;
    if (isDrinking === "no" && !noCoffeeValid) return false;

    return true;
  }, [
    sleepFromHour,
    sleepToHour,
    sleepDurationAverage,
    mood,
    focusLevel,
    tirednessLevel,
    isDrinking,
    yesCoffeeValid,
    noCoffeeValid,
  ]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>סקירת הקפה היומי</Text>
        <Text style={styles.label}>
          עלייך למלא את כל השדות כדי לשלוח סקירה יומית מלאה
        </Text>
        {isEditMode && (
          <View style={{ marginTop: 20 }}>
            <Button
              title="🔙 יציאה ממצב עריכה"
              onPress={exitEditMode}
              color="red"
            />
          </View>
        )}
        <Text style={styles.label}>כמה שעות ישנת היום?</Text>
        <View style={styles.sleepTimeRow}>
          <Dropdown
            style={[styles.dropdown, styles.sleepDropdown]}
            data={hoursOptions}
            labelField="label"
            valueField="value"
            placeholder="עד שעה"
            value={sleepToHour}
            onChange={(item) => {
              setSleepToHour(item.value);
            }}
            placeholderStyle={styles.placeholderText}
            selectedTextStyle={styles.selectedText}
          />
          <Dropdown
            style={[styles.dropdown, styles.sleepDropdown]}
            data={hoursOptions}
            labelField="label"
            valueField="value"
            placeholder="משעה"
            value={sleepFromHour}
            onChange={(item) => {
              setSleepFromHour(item.value);
            }}
            placeholderStyle={styles.placeholderText}
            selectedTextStyle={styles.selectedText}
          />
        </View>
        <MoodSelector onMoodSelect={(selectedMood) => setMood(selectedMood)} />
        <Text style={styles.label}>מה רמת הריכוז שלך היום?</Text>
        <Dropdown
          style={[styles.dropdown]}
          data={ratingOptions}
          labelField="label"
          valueField="value"
          placeholder="בחרי רמת ריכוז"
          value={focusLevel || undefined}
          onChange={(item) => setFocusLevel(item.value)}
          placeholderStyle={styles.placeholderText}
          selectedTextStyle={styles.selectedText}
        />

        <Text style={styles.label}>מה רמת העייפות שלך היום?</Text>
        <Dropdown
          style={[styles.dropdown]}
          data={ratingOptions}
          labelField="label"
          valueField="value"
          placeholder="בחרי רמת עייפות"
          value={tirednessLevel || undefined}
          onChange={(item) => setTirednessLevel(item.value)}
          placeholderStyle={styles.placeholderText}
          selectedTextStyle={styles.selectedText}
        />
        <Text style={styles.label}>האם שתית קפה היום?</Text>
        <RadioGroup
          radioButtons={radioButtons}
          onPress={(selectedId) => {
            const allFieldsFilled =
              sleepFromHour &&
              sleepToHour &&
              sleepDurationAverage !== 0 &&
              mood &&
              focusLevel &&
              tirednessLevel;

            if (!allFieldsFilled) {
              Alert.alert("שגיאה", "אנא מלאי את כל השדות לפני בחירה שתית קפה.");
              return;
            }

            setIsDrinking(selectedId);
          }}
          selectedId={isDrinking}
          layout="row"
        />

        {isDrinking === "yes" && (
          <YesCoffeeToday
          generalData={{
            sleepFromHour,
            sleepToHour,
            sleepDurationAverage,
            mood,
            focusLevel,
            tirednessLevel,
          }}
          entryId={params?.entryId} // 👈 הוסיפי את זה
          onDataChange={({ data, isValid }) => {
            setYesCoffeeData(data);
            setYesCoffeeValid(isValid);
          }}
        />
        
        )}

        {isDrinking === "no" && (
          <NoCoffeeToday
            generalData={{
              sleepFromHour,
              sleepToHour,
              sleepDurationAverage,
              mood,
              focusLevel,
              tirednessLevel,
            }}
            entryId={params?.entryId} 
            onDataChange={({ data, isValid }) => {
              setNoCoffeeData(data);
              setNoCoffeeValid(isValid);
            }}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, paddingBottom: 20 },
  container: {
    flex: 1,
    alignItems: "flex-start",
    padding: 20,
    gap: 8,
    flexDirection: "column",
    alignItems: "stretch",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 4,
    textAlign: "right",
    writingDirection: "rtl",
  },
  text: {
    fontSize: 14,
    textAlign: "right",
    writingDirection: "rtl",
  },
  button: {
    marginTop: 24,
    borderRadius: 12,
    overflow: "hidden",
  },
  sleepDropdown: {
    flex: 1,
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
  sleepTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 15,
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
