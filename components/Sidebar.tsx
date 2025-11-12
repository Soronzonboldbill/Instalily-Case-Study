import React, { useContext, createContext, useState, ComponentProps, useRef, useEffect } from "react";
import { PanResponder, View, StyleSheet, Text, Pressable, Animated, Easing, FlatList } from "react-native";
import { Button } from "@/components/Button";
import { PanelLeftIcon } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, usePathname } from "expo-router";
import type { Chat } from "@/lib/types/Chat";

const SIDEBAR_WIDTH = 300;


/* Sidebar Context */
type SidebarContextProps = {
  open: boolean;
  setOpen: (state: boolean) => void;
  chats: Chat[],
  setChatList: (chats: Chat[]) => void;
};

const SidebarContext = createContext<SidebarContextProps | null>(null);

function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within a SidebarProvider.");
  return context;
}

function SidebarProvider({
  children,
  defaultOpen,
}: ComponentProps<"view"> & { defaultOpen?: boolean }) {
  const [_chats, setChats] = useState<Chat[]>([]);
  const [open, setOpen] = useState(defaultOpen || false);
  const [isMounted, setIsMounted] = useState(defaultOpen || false);
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (open) {
      setIsMounted(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0.3,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {

      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 250,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setIsMounted(false);
      });
    }
  }, [open]);

  const setChatList = (chats: Chat[]) => {
    setChats(chats)
  }

  return (
    <SidebarContext.Provider value={{ open, setOpen, chats: _chats, setChatList }}>
      <View style={{ flex: 1 }}>
        {children}

        {isMounted && (
          <>
            {/* Overlay */}
            <Animated.View
              style={[styles.overlay, { opacity: 0.7 }]}
            >
              <Pressable style={{ flex: 1 }} onPress={() => setOpen(false)} />
            </Animated.View>

            {/* Sidebar */}
            <Animated.View
              style={[
                styles.sidebarContainer,
                { transform: [{ translateX: slideAnim }] },
              ]}
            >
              <Sidebar />
            </Animated.View>
          </>
        )}
      </View>
    </SidebarContext.Provider>
  );
}

function Sidebar() {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { chats, setOpen } = useSidebar();
  const pathname = usePathname()

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only start gesture if user swipes left more than 10px
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        // Limit movement between 0 and -SIDEBAR_WIDTH
        if (gestureState.dx < 0 && gestureState.dx > -SIDEBAR_WIDTH) {
          slideAnim.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // If user swipes left past halfway, close the sidebar
        if (gestureState.dx < -SIDEBAR_WIDTH / 3) {
          Animated.timing(slideAnim, {
            toValue: -SIDEBAR_WIDTH,
            duration: 200,
            useNativeDriver: true,
          }).start(() => setOpen(false));
        } else {
          // Otherwise, snap back open
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleNewChat = () => {
    /* if we're already on the index page, no need to redirect */
    if (pathname === "/") {
      setOpen(false);
      return;
    }

    /* otherwise, change to the home page */
    router.push('/')
    setOpen(false);
  }

  const handleOpenChat = (id: string) => {
    router.push(`chats/${id}` as any)
    setOpen(false);
  }


  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.sidebarContainer,
        {
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
        <View
          style={{
            height: "100%",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "flex-start",
            paddingHorizontal: 10,
            gap: 10
          }}
        >
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "600" }}>Your Chats</Text>

          <View style={{ flex: 1, width: "100%", flexDirection: "column-reverse", gap: 2 }}>
            {chats && chats.length > 0 ? (
              <FlatList
                data={chats}
                keyExtractor={chat => chat.id}
                renderItem={({ index, item: chat }) => (
                  <Button key={chat.id} style={{ width: "100%", marginBottom: 5 }} radius={10} onPress={() => handleOpenChat(chat.id)}>
                    <Text>Chat {index + 1}</Text>
                  </Button>
                )}
              />
            ) : (
              <View style={{ alignItems: "center", width: "100%", gap: 8, borderWidth: 1, borderColor: "#353839", borderRadius: 10, paddingVertical: 10 }}>
                <Text style={{ color: "#fff" }}>No Chats Found</Text>
              </View>
            )}
          </View>

          <Button
            style={{
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
            radius={10}
            onPress={handleNewChat}
          >
            <Text style={{ color: "#ffffff" }}>New Chat</Text>
          </Button>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

function SidebarTrigger(props: React.ComponentProps<typeof Button>) {
  const { open, setOpen } = useSidebar();

  return (
    <Button style={{ borderRadius: 100 }} onPress={() => setOpen(!open)} {...props}>
      <PanelLeftIcon color="#ffffff" size={15} />
    </Button>
  );
}

const styles = StyleSheet.create({
  sidebarContainer: {
    color: "#ffffff",
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: "#0e1111",
    zIndex: 20,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "black",
    zIndex: 10,
  },
});

export { Sidebar, useSidebar, SidebarProvider, SidebarTrigger };
