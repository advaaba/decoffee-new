import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useLayoutEffect } from "react";

export default function OpenScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ title: "DeCoffee" });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ברוכים הבאים ל-DeCoffee</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/login")} // ✅ תוקן
      >
        <Text style={styles.buttonText}> התחברות</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.registerButton]}
        onPress={() => router.push("/PersonalDetails")} // ✅ תוקן
      >
        <Text style={styles.buttonText}> הרשמה</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
  },
  button: {
    width: "80%",
    padding: 15,
    backgroundColor: "#2196F3",
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  registerButton: {
    backgroundColor: "#4CAF50",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
});
