import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import BASE_URL from "../../utils/apiConfig";

export default function PasswordRecovery() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [userId, setUerId] = useState("");

  const handlePasswordResetRequest = async () => {
    if (!email || !userId) {
      Alert.alert("⚠️ שגיאה", "אנא מלאי גם אימייל וגם תעודת זהות.");
      return;
    }

    try {
      // שליחה לשרת לבדיקה אם אימייל ות"ז קיימים
      const response = await axios.post(`${BASE_URL}/api/auth/checkUser`, { email, userId });
      if (response.data.success) {
        Alert.alert("✅ נמצא משתמש", "מעבר לאיפוס סיסמה.");
        router.push({
          pathname: "/PasswordChange",
          params: { email }, // שולחים את האימייל איתנו למסך הבא
        });
      } else {
        Alert.alert("❌ שגיאה", "לא נמצא משתמש עם הפרטים שהוזנו.");
      }
    } catch (error) {
      console.error("שגיאה באימות:", error);
      Alert.alert("⚠️ שגיאה", "אירעה שגיאה בבדיקה. נסה שוב מאוחר יותר.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔐 אימות משתמש</Text>

      <TextInput
        style={styles.input}
        placeholder="הכנס/י כתובת מייל"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="הכנס/י תעודת זהות"
        value={userId}
        onChangeText={setUerId}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={handlePasswordResetRequest}>
        <Text style={styles.buttonText}>בדיקת פרטים</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
});
