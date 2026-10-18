import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { glass } from "@/components/glass-panel";
import { Sparkle } from "@/components/sparkle";
import { useShinyMode } from "@/context/shiny-mode";

export function ShinyToggle() {
  const { shiny, toggleShiny } = useShinyMode();

  return (
    <TouchableOpacity
      onPress={toggleShiny}
      activeOpacity={0.8}
      accessibilityRole="switch"
      accessibilityLabel="Shiny mode"
      accessibilityState={{ checked: shiny }}
      style={[styles.pill, !shiny && glass.surface]}
    >
      {shiny ? (
        <LinearGradient
          colors={["#FDE68A", "#F59E0B"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View style={styles.icon}>
        {shiny ? <Sparkle size={16} style={styles.sparkle} /> : <Text style={styles.star}>✦</Text>}
      </View>
      <Text style={[styles.label, shiny && styles.labelOn]}>Shiny</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    overflow: "hidden",
  },
  icon: {
    width: 16,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sparkle: {
    color: "#FFFFFF",
    textShadowColor: "rgba(180, 83, 9, 0.8)",
  },
  star: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(255,255,255,0.85)",
  },
  labelOn: {
    color: "#451A03",
  },
});
