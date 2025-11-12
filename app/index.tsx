import React, { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { ArrowUp } from "lucide-react-native";
import { SidebarTrigger, useSidebar } from "@/components/Sidebar";
import { useDB } from "@/hooks/DBcontext";
import { router } from "expo-router";
import { createChat } from "@/lib/db/services/chatService";
import { createMsg } from "@/lib/db/services/messageService";
import { VoiceInputField } from "@/components/VoiceInput"


export default function Index() {
  /* 
   * this is hardcoded for the case study. In a production app, 
   * there should be an Auth system that includes profile info 
   */
  const name = "user";
  const [value, setValue] = useState<string>("")
  const { db, sessionID } = useDB();
  const { setChatList } = useSidebar();

  const createNewChat = async () => {
    if (!value) {
      return;
    }

    const { id: chatId } = await createChat(db, sessionID);
    const msgID = await createMsg(db, chatId, { value, role: "human" });

    /* client side update for sidebar navigation only */
    // @ts-ignore
    setChatList((prev) => [...prev, { id: chatId, msgs: [{ id: msgID, role: "human", value }] }]);

    // @ts-ignore
    router.push(`chats/${chatId}`)
    setValue("");
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              paddingHorizontal: 14,
              paddingVertical: 15,
              position: "relative"
            }}
          >

            <View style={{ width: "100%", justifyContent: "space-between", alignItems: "center", flexDirection: "row" }}>
              <SidebarTrigger />
              <Text style={{ fontSize: 25, fontWeight: "600", color: "#ffffff", letterSpacing: -1 }}>
                hello {name.split(" ")[0]}
              </Text>
            </View>

            <Text style={{ fontWeight: 600, color: "#fff", fontSize: 30, letterSpacing: -1 }}>how can I help you today?</Text>

            <View
              style={{
                width: "100%",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <VoiceInputField setValue={(val) => { setValue(val) }} />
              <Input placeholder="What can I do?" style={{ flex: 1 }} onChangeText={(val) => setValue(val)} value={value} />
              <Button radius={100} onPress={createNewChat}>
                <ArrowUp size={15} color="white" />
              </Button>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#232b2b",
    paddingBottom: 5,
    paddingHorizontal: 10
  }
})
