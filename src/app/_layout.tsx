import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { BACKGROUND_COLOR } from "@/components/glass-background";
import { ShinyModeProvider } from "@/context/shiny-mode";

export const unstable_settings = {
  anchor: "index",
};

export default function RootLayout() {
  return (
    <ShinyModeProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: BACKGROUND_COLOR },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="pokemon/[id]" options={{ presentation: "modal" }} />
      </Stack>
    </ShinyModeProvider>
  );
}
