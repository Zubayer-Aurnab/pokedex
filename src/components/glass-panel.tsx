import type { ReactNode } from "react";
import { type StyleProp, StyleSheet, Text, View, type ViewStyle } from "react-native";

type Props = {
  title?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function GlassPanel({ title, children, style }: Props) {
  return (
    <View style={[styles.panel, style]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {children}
    </View>
  );
}

export const glass = StyleSheet.create({
  surface: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
});

const styles = StyleSheet.create({
  panel: {
    ...glass.surface,
    borderRadius: 22,
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
});
