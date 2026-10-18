import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

const MAX_STAT = 255;

type Props = {
  label: string;
  value: number;
  color: string;
  delay?: number;
};

export function StatBar({ label, value, color, delay = 0 }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.set(
      withDelay(
        delay,
        withTiming(Math.min(1, value / MAX_STAT), {
          duration: 800,
          easing: Easing.out(Easing.cubic),
        })
      )
    );
  }, [delay, progress, value]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.get() * 100}%` }));

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { backgroundColor: color }, fillStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  label: {
    width: 64,
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "600",
  },
  value: {
    width: 32,
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "right",
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 4,
  },
});
