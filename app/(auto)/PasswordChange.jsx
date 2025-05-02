import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import BASE_URL from "../../utils/apiConfig";

export default function PasswordChange() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMismatchError, setPasswordMismatchError] = useState(false);

  useEffect(() => {
    if (confirmPassword.length > 0) {
      setPasswordMismatchError(newPassword !== confirmPassword);
    } else {
      setPasswordMismatchError(false);
    }
  }, [newPassword, confirmPassword]);

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("⚠️ שגיאה", "נא למלא את כל השדות.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("❌ סיסמאות לא תואמות", "נסה שוב.");
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/api/auth/resetPassword`, { email, newPassword });
      if (response.data.success) {
        Alert.alert("✅ הצלחה", "הסיסמה אופסה בהצלחה!");
        router.replace("/login");
      } else {
        Alert.alert("❌ שגיאה", "לא ניתן לאפס את הסיסמה.");
      }
    } catch (error) {
      console.error("שגיאה באיפוס סיסמה:", error);
      Alert.alert("⚠️ שגיאה", "אירעה שגיאה. נסה שוב מאוחר יותר.");
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔒 הגדרת סיסמה חדשה</Text>
      {/* שדה סיסמה חדשה */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="סיסמה חדשה"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={24}
            color="gray"
          />
        </TouchableOpacity>
      </View>
      {/* שדה אימות סיסמה */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="אימות סיסמה חדשה"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <Ionicons
            name={showConfirmPassword ? "eye-off" : "eye"}
            size={24}
            color="gray"
          />
        </TouchableOpacity>
      </View>

      {/* הודעת שגיאה אם הסיסמאות לא תואמות */}
      {passwordMismatchError && (
        <Text style={styles.errorText}>❌ הסיסמאות אינן תואמות</Text>
      )}
      
      <TouchableOpacity style={styles.button} onPress={handlePasswordChange}>
        <Text style={styles.buttonText}>אפס סיסמה</Text>
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  eyeIcon: {
    paddingHorizontal: 5,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "right",
    marginRight: 5,
  },
});
