import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View, type ViewStyle } from "react-native";

const GLOW_LAYERS = [1, 0.78, 0.56, 0.34];

function Glow({ color, size, style }: { color: string; size: number; style: ViewStyle }) {
  return (
    <View style={[styles.glow, { width: size, height: size }, style]}>
      {GLOW_LAYERS.map((scale) => (
        <View
          key={scale}
          style={[
            styles.glowLayer,
            {
              width: size * scale,
              height: size * scale,
              borderRadius: (size * scale) / 2,
              backgroundColor: color,
            },
          ]}
        />
      ))}
    </View>
  );
}

export const BACKGROUND_COLOR = "#0B1020";

export function GlassBackground({ tint }: { tint?: string }) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[BACKGROUND_COLOR, "#141B3D", BACKGROUND_COLOR]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Glow color={tint ?? "#7C3AED"} size={380} style={{ top: -140, left: -140 }} />
      <Glow color="#2563EB" size={320} style={{ top: 280, right: -160 }} />
      <Glow color="#DB2777" size={340} style={{ bottom: -160, left: -80 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    pointerEvents: "none",
  },
  glow: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  glowLayer: {
    position: "absolute",
    opacity: 0.09,
  },
});
