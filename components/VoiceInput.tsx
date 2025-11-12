import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Button } from "./Button";
import Voice from "@react-native-voice/voice";
import { Mic } from "lucide-react-native";

type VoiceButtonProps = {
  setValue: (val: string) => void;
}

export function VoiceInputField({ setValue }: VoiceButtonProps) {
  const [listening, setListening] = useState(false);

  useEffect(() => {
    // Bind event listeners
    Voice.onSpeechResults = (event) => {
      const value = event.value?.[0] || "";
      setValue(value);
    };

    Voice.onSpeechError = (err) => {
      console.error("Speech error:", err);
      setListening(false);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startListening = async () => {
    try {
      await Voice.start("en-US");
      setListening(true);
    } catch (err) {
      console.error("Error starting voice:", err);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setListening(false);
    } catch (err) {
      console.error("Error stopping voice:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Button
        onPress={listening ? stopListening : startListening}
        style={[styles.button, listening && styles.buttonActive]}
        radius={100}
      >
        <Mic color="#fff" size={15} />
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    // padding: 12,
  },
  button: {
    backgroundColor: "#333",
    borderRadius: 10,
  },
  buttonActive: {
    backgroundColor: "#007AFF",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
