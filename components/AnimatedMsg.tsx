import { Text, Animated } from "react-native";
import { useRef, useEffect } from "react";

export function AnimatedMessage({
  text,
  bubbleColor = "#2a2f32",
  textColor = "white",
}: {
  text: string;
  bubbleColor?: string;
  textColor?: string;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [text]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        backgroundColor: bubbleColor,
        padding: 10,
        borderRadius: 12,
      }}
    >
      <Text style={{ color: textColor }}>{text}</Text>
    </Animated.View>
  );
}
