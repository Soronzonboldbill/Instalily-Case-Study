import { ActivityIndicator, StyleSheet, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, Text, View, Keyboard, FlatList, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { SidebarTrigger, useSidebar } from "@/components/Sidebar";
import { Mic, ArrowUp, EllipsisVertical } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { createMsg, fetchAllMsgsFromChat } from "@/lib/db/services/messageService";
import { useDB } from "@/hooks/DBcontext";
import { router, useLocalSearchParams } from "expo-router";
import { Message } from "@/lib/types/Chat";
import { OptionsModal } from "@/components/modals/OptionsModal";
import { AnimatedMessage } from "@/components/AnimatedMsg";
import { parseHumanIntent } from "@/lib/ai/agent";
import Clipboard from "@react-native-clipboard/clipboard"
import { VoiceInputField } from "@/components/VoiceInput";

// have to use this to force a remount
export default function ChatWrapper() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ChatPage key={id} />
}

function ChatPage() {
  const { id: chatId } = useLocalSearchParams<{ id: string }>();

  const listRef = useRef<FlatList>(null);
  const [msg, setMsg] = useState<string>("");
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [chatMsgs, setChatMsgs] = useState<Message[]>([]);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [showOptions, setShowOptions] = useState(false);
  const prevMessageCount = useRef(0);
  const hasInitialized = useRef(false);
  const { setChatList } = useSidebar();

  const { db } = useDB();
  const { data: fetchedMsgs, isFetching, isPending, error, refetch } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: () => fetchAllMsgsFromChat(db, chatId),
    enabled: !!chatId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });

  useEffect(() => {
    hasInitialized.current = false;
    setChatMsgs([]);
    setIsThinking(false);
    prevMessageCount.current = 0;

    if (!fetchedMsgs) return;

    hasInitialized.current = true;
    setChatMsgs(fetchedMsgs);

    const maybeGenerateAI = async () => {
      if (fetchedMsgs.length === 1 && fetchedMsgs[0].role === "human") {
        const firstMsg = fetchedMsgs[0];
        setIsThinking(true);

        const aiMsgId = await createMsg(db, chatId, { role: "ai", value: "" });
        setChatMsgs(prev => [...prev, { id: aiMsgId, role: "ai", value: "" }]);

        const fakeChunks = await parseHumanIntent(firstMsg.value);
        await streamMsgToUI(fakeChunks, aiMsgId);
      }
    };

    maybeGenerateAI();
  }, [chatId, fetchedMsgs]);

  const currentChatId = useRef(chatId);

  useEffect(() => {
    if (currentChatId.current !== chatId) {
      currentChatId.current = chatId;
      hasInitialized.current = false;
      setChatMsgs([]);
      setIsThinking(false);
      prevMessageCount.current = 0;
    }

    if (!fetchedMsgs || hasInitialized.current) return;

    hasInitialized.current = true;
    setChatMsgs(fetchedMsgs);

    const maybeGenerateAI = async () => {
      if (fetchedMsgs.length === 1 && fetchedMsgs[0].role === "human") {
        const firstMsg = fetchedMsgs[0];
        setIsThinking(true);

        const aiMsgId = await createMsg(db, chatId, { role: "ai", value: "" });
        setChatMsgs(prev => [...prev, { id: aiMsgId, role: "ai", value: "" }]);

        const fakeChunks = await parseHumanIntent(firstMsg.value);
        await streamMsgToUI(fakeChunks, aiMsgId);
      }
    };

    maybeGenerateAI();
  }, [fetchedMsgs, chatId]);

  useEffect(() => {
    if (shouldAutoScroll && chatMsgs.length > prevMessageCount.current) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
    prevMessageCount.current = chatMsgs.length;
  }, [chatMsgs.length, shouldAutoScroll]);

  const streamMsgToUI = async (fakeChunks: string[], msgID: string) => {
    let accumulated = "";
    for (const chunk of fakeChunks) {
      await new Promise(r => setTimeout(r, 150));
      accumulated += chunk;

      // Update UI progressively
      setChatMsgs(prev => {
        const updated = [...prev];
        const i = updated.findIndex(m => m.id === msgID);
        if (i !== -1) updated[i] = { ...updated[i], value: accumulated };
        return updated;
      });

      // Update DB progressively
      await db.db?.runAsync(`UPDATE messages SET content = ? WHERE id = ?`, [
        accumulated,
        msgID,
      ]);
    }

    setIsThinking(false);
  };

  const handleNewMsg = async () => {
    if (!msg.trim()) return;

    // Save user message
    const humanMsgId = await createMsg(db, chatId, { role: "human", value: msg });
    setChatMsgs(prev => [...prev, { id: humanMsgId, role: "human", value: msg }]);
    setMsg("");

    // Add placeholder AI message
    const aiMsgId = await createMsg(db, chatId, { role: "ai", value: "" });
    setChatMsgs(prev => [...prev, { id: aiMsgId, role: "ai", value: "" }]);
    setIsThinking(true);

    // Generate fake chunks and stream
    const fakeChunks = await parseHumanIntent(msg);
    await streamMsgToUI(fakeChunks, aiMsgId);
  };
  const handleDeleteChat = async () => {
    try {
      await db.db?.runAsync("DELETE FROM chats where id = ?", [chatId]);
      setChatList(prev => prev.filter(chat => chat.id !== chatId));
      router.push('/')
      return;
    } catch (error) {
      console.log(error);

    }
  }

  const handleExportChat = async () => {
    const stringExport = chatMsgs.map((chat) => `{role: ${chat.role} - content: ${chat.value}}`).join("\n");
    Clipboard.setString(stringExport);
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { flex: 1, width: "100%", justifyContent: "space-between", alignItems: "center", alignSelf: "center", gap: 2 }]}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ fontSize: 20, color: "#fff", textAlign: "center", letterSpacing: -1, fontWeight: 700 }}>Something went wrong,</Text>
          <Text style={{ fontSize: 20, color: "#fff", textAlign: "center", letterSpacing: -1, fontWeight: 700 }}>Please try again later!</Text>
        </View>

        <Button style={{ width: "100%", height: 50 }} radius={10} onPress={() => refetch()}>Try Again</Button>
      </SafeAreaView >
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {isPending || isFetching ? (
        <View style={{ flex: 1, justifyContent: "center", alignContent: "center" }}>
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      ) : (
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
                position: "relative",
              }}
            >
              {/* Side Bar Controls */}
              <View
                style={{
                  width: "100%",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexDirection: "row",
                }}
              >
                <SidebarTrigger />

                <TouchableOpacity activeOpacity={0.7} onPress={() => setShowOptions(!showOptions)}>
                  <EllipsisVertical size={15} color="#fff" />

                  {showOptions && (
                    <OptionsModal
                      visible={showOptions}
                      onClose={() => setShowOptions(false)}
                      handleDelete={handleDeleteChat}
                      handleExport={handleExportChat}
                    />
                  )}
                </TouchableOpacity>
              </View>

              {/* Message List */}
              <FlatList
                ref={listRef}
                data={chatMsgs}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item: msg }) => (
                  <View
                    style={{
                      width: "100%",
                      flexDirection: "row",
                      justifyContent: msg.role === "ai" ? "flex-start" : "flex-end",
                      marginBottom: 8,
                    }}
                  >
                    {msg.role === "ai" ? (
                      <View
                        style={{
                          backgroundColor: "#2a2f32",
                          borderRadius: 12,
                        }}
                      >
                        {isThinking && msg.value === "" ? (
                          <View style={{ flexDirection: "row", gap: 4 }}>
                            {[0.3, 0.6, 0.9].map((opacity, i) => (
                              <View
                                key={i}
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: 3,
                                  backgroundColor: "#aaa",
                                  opacity,
                                }}
                              />
                            ))}
                          </View>
                        ) : (
                          <AnimatedMessage text={msg.value} />
                        )}
                      </View>
                    ) : (
                      <AnimatedMessage
                        text={msg.value}
                        bubbleColor="#0084ff"
                        textColor="#fff"
                      />
                    )}
                  </View>
                )}
                contentContainerStyle={{
                  flex: 1,
                  gap: 10,
                  marginTop: 10,
                }}
                // Remove onContentSizeChange completely or make it conditional
                onContentSizeChange={() => {
                  if (shouldAutoScroll) {
                    setTimeout(() => {
                      listRef.current?.scrollToEnd({ animated: true });
                    }, 50);
                  }
                }}
                // Add this to detect manual scrolling
                onScrollBeginDrag={() => {
                  setShouldAutoScroll(false); // User started scrolling manually
                }}
                // Add this to re-enable auto-scroll when user scrolls to bottom
                onMomentumScrollEnd={(event) => {
                  const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
                  const isAtBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

                  if (isAtBottom) {
                    setShouldAutoScroll(true); // Re-enable auto-scroll
                  }
                }}
                onLayout={() => {
                  if (chatMsgs.length > 0) {
                    listRef.current?.scrollToEnd({ animated: false });
                  }
                }}
                showsVerticalScrollIndicator={true}
              />

              {/* Msg controls */}
              <View
                style={{
                  width: "100%",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <VoiceInputField setValue={(val) => { console.log("force update"); setMsg(val) }} />
                <Input placeholder="What can I do?" style={{ flex: 1 }} onChangeText={(val) => setMsg(val)} value={msg} />
                <Button radius={100} onPress={handleNewMsg}>
                  <ArrowUp size={20} color="white" />
                </Button>
              </View>

            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      )}
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
