import React, { useEffect } from "react";
import { View, Pressable, StyleSheet, Text } from "react-native";
import { AntDesign, Feather } from "@expo/vector-icons";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

// 🧩 אייקונים לפי שם route
export const icons = {
  "home-screen": (props) => <AntDesign name="home" size={26} {...props} />,
  explore: (props) => <Feather name="compass" size={26} {...props} />,
  create: (props) => <AntDesign name="pluscircleo" size={26} {...props} />,
  profile: (props) => <AntDesign name="user" size={26} {...props} />,
  coffee: (props) => <Feather name="coffee" size={26} {...props} />,
};

const TabBarButton = ({ isFocused, label, routeName, color, onPress }) => {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1 : 0, { duration: 350 });
  }, [scale, isFocused]);

  // ✅ סינון – רק טאבים מהאובייקט
  const tabs = Object.keys(icons);
  if (!tabs.includes(routeName)) {
    return null; // לא טאב אמיתי – אל תציג כלום
  }

  const animatedIconStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(scale.value, [0, 1], [1, 1.4]);
    const top = interpolate(scale.value, [0, 1], [0, 8]);
    return { transform: [{ scale: scaleValue }], top };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scale.value, [0, 1], [1, 0]);
    return { opacity };
  });

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Animated.View style={[animatedIconStyle]}>
        {icons[routeName]({ color })}
      </Animated.View>
      <Animated.Text
        style={[
          { color, fontSize: 11 },
          animatedTextStyle,
        ]}
      >
        {label}
      </Animated.Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
});

export default TabBarButton;
