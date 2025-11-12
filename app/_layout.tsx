import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SidebarProvider } from '@/components/Sidebar';
import { DBProvider } from '@/hooks/DBcontext';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient()

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <DBProvider>
        <SidebarProvider defaultOpen={false}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="chats/[id]" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </SidebarProvider>
      </DBProvider>
    </QueryClientProvider>
  );
}
