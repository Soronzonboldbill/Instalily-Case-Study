import React, { useRef, useEffect } from "react";
import {
  Animated,
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
} from "react-native";

type Props = TouchableOpacityProps & {
  isDisabled?: boolean;
  radius?: number;
  children?: React.ReactNode;
};

export function Button({ isDisabled = false, radius = 20, children, style, ...props }: Props) {
  const anim = useRef(new Animated.Value(isDisabled ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isDisabled]);

  const backgroundColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#353839", "#555555"],
  });

  return (
    <Animated.View
      style={[
        style,
        styles.buttonContainer,
        { borderRadius: radius, backgroundColor },
      ]}
    >
      <TouchableOpacity
        disabled={isDisabled}
        activeOpacity={isDisabled ? 1 : 0.8}
        style={styles.touchArea}
        {...props}
      >
        <Text style={styles.text}>{children}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  touchArea: {
    // No layout properties here — keeps hitbox stable
  },
  text: {
    color: "#fff",
  },
});
