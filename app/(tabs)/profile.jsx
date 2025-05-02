import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import BASE_URL from "../../utils/apiConfig";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editedUser, setEditedUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const router = useRouter();

  const [day, setDay] = useState(null);
  const [month, setMonth] = useState(null);
  const [year, setYear] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          Alert.alert("שגיאה", "לא נמצאו נתוני משתמש");
          return;
        }
        const response = await axios.get(
          `${BASE_URL}/api/auth/get-user/${userId}`
        );
        if (response.data.success) {
          const birthDate = new Date(response.data.user.birthDate);
          setDay(birthDate.getDate());
          setMonth(birthDate.getMonth() + 1);
          setYear(birthDate.getFullYear());

          setUser(response.data.user);
          setEditedUser(response.data.user);
        } else {
          Alert.alert("שגיאה", "לא ניתן לטעון את פרטי המשתמש");
        }
      } catch (err) {
        console.error("❌ שגיאה בשליפת נתונים:", err);
        Alert.alert("שגיאה", "בעיה בטעינת נתונים מהשרת");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleFieldChange = (field, value) => {
    setEditedUser((prev) => ({ ...prev, [field]: value }));
  };

  const updateBirthDate = (newDay = day, newMonth = month, newYear = year) => {
    if (newDay && newMonth && newYear) {
      const newDate = new Date(newYear, newMonth - 1, newDay);
      const today = new Date();
      let calculatedAge = today.getFullYear() - newDate.getFullYear();
      const m = today.getMonth() - newDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < newDate.getDate())) {
        calculatedAge--;
      }

      setEditedUser((prev) => ({
        ...prev,
        birthDate: newDate.toISOString(),
        age: calculatedAge,
      }));
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("he-IL", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handleEditToggle = async () => {
    if (editMode) {
      try {
        await axios.put(
          `${BASE_URL}/api/auth/update-user/${editedUser.userId}`,
          editedUser
        );
        setUser(editedUser);
        Alert.alert("🎉", "הפרטים עודכנו בהצלחה במסד הנתונים");
      } catch (err) {
        Alert.alert("שגיאה", "עדכון נכשל");
        console.error(err);
      }
    }
    setEditMode(!editMode);
  };

  if (loading) return <ActivityIndicator size="large" color="#06b6d4" />;
  if (!user) return <Text style={styles.text}>לא נמצאו נתוני משתמש.</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>👤 פרופיל אישי</Text>

      <View style={styles.card}>
        <InfoRow
          label="שם פרטי"
          value={editedUser.firstName}
          field="firstName"
          editMode={editMode}
          onChange={handleFieldChange}
        />
        <InfoRow
          label="שם משפחה"
          value={editedUser.lastName}
          field="lastName"
          editMode={editMode}
          onChange={handleFieldChange}
        />
        <InfoRow
          label='דוא"ל'
          value={editedUser.email}
          field="email"
          editMode={editMode}
          onChange={handleFieldChange}
        />
        <InfoRow
          label="טלפון"
          value={editedUser.phoneNumber}
          field="phoneNumber"
          editMode={editMode}
          onChange={handleFieldChange}
        />
        <InfoRow
          label="גיל"
          value={editedUser.age?.toString()}
          field="age"
          editMode={false} // גיל לא ניתן לעריכה ידנית
          onChange={handleFieldChange}
        />

        {/* תאריך לידה בדרופ דאון */}
        <View style={styles.row}>
          <Text style={styles.label}>תאריך יום הולדת:</Text>
          {editMode ? (
            <View style={{ flexDirection: "row", gap: 10 }}>
              {/* יום */}
              <Picker
                selectedValue={day?.toString()}
                style={styles.picker}
                onValueChange={(value) => {
                  setDay(parseInt(value));
                  updateBirthDate(parseInt(value), month, year);
                }}
              >
                {[...Array(31)].map((_, i) => {
                  const val = i + 1;
                  return (
                    <Picker.Item key={val} label={`${val}`} value={`${val}`} />
                  );
                })}
              </Picker>

              {/* חודש */}
              <Picker
                selectedValue={month?.toString()}
                style={styles.picker}
                onValueChange={(value) => {
                  setMonth(parseInt(value));
                  updateBirthDate(day, parseInt(value), year);
                }}
              >
                {[...Array(12)].map((_, i) => {
                  const val = i + 1;
                  return (
                    <Picker.Item key={val} label={`${val}`} value={`${val}`} />
                  );
                })}
              </Picker>

              {/* שנה */}
              <Picker
                selectedValue={year?.toString()}
                style={styles.picker}
                onValueChange={(value) => {
                  setYear(parseInt(value));
                  updateBirthDate(day, month, parseInt(value));
                }}
              >
                {[...Array(100)].map((_, i) => {
                  const y = new Date().getFullYear() - i;
                  return <Picker.Item key={y} label={`${y}`} value={`${y}`} />;
                })}
              </Picker>
            </View>
          ) : (
            <Text style={styles.value}>{formatDate(editedUser.birthDate)}</Text>
          )}
        </View>

        <InfoRow
          label="משקל"
          value={editedUser.weight?.toString()}
          field="weight"
          editMode={editMode}
          onChange={handleFieldChange}
        />
        <InfoRow
          label="גובה"
          value={editedUser.height?.toString()}
          field="height"
          editMode={editMode}
          onChange={handleFieldChange}
        />
      </View>

      <TouchableOpacity style={styles.updateButton} onPress={handleEditToggle}>
        <Text style={styles.updateText}>
          {editMode ? " שמור שינויים" : " עדכון פרטים"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// קומפוננטה לשורת מידע (כולל תמיכה ב-Picker עבור height ו-weight)
const InfoRow = ({ label, value, field, editMode, onChange }) => {
  const isPickerField = field === "weight" || field === "height";

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}:</Text>
      {editMode ? (
        isPickerField ? (
          <Picker
            selectedValue={value?.toString()} // להמיר תמיד למחרוזת
            style={styles.picker}
            onValueChange={(val) => onChange(field, parseInt(val))}
          >
            {field === "weight"
              ? [...Array(121)].map((_, i) => {
                  const val = 30 + i;
                  return (
                    <Picker.Item key={val} label={`${val} ק"ג`} value={`${val}`} />

                  );
                })
              : [...Array(121)].map((_, i) => {
                  const val = 100 + i;
                  return (
                    <Picker.Item key={val} label={`${val} ס"מ`} value={`${val}`} />
                  );
                })}
          </Picker>
        ) : (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={(text) => onChange(field, text)}
            placeholder={`הכנס ${label}`}
            keyboardType="default"
          />
        )
      ) : (
        <Text style={styles.value}>{value}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    // backgroundColor: "#f8fafc",
    alignItems: "center",
    minHeight: "100%",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#0f172a",
  },
  card: {
    backgroundColor: "#ffffff",
    width: "100%",
    borderRadius: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 20,
  },
  row: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1e293b",
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: "#0f172a",
  },
  picker: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  updateButton: {
    backgroundColor: "#0ea5e9",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginBottom: 20,
  },
  updateText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
