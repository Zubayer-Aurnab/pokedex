import { useEffect } from "react";
import { StyleSheet, View, type TextStyle } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

type SparkleProps = {
  size: number;
  delay?: number;
  style?: TextStyle;
};

export function Sparkle({ size, delay = 0, style }: SparkleProps) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) return;
    progress.set(
      withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 650, easing: Easing.out(Easing.quad) }),
            withTiming(0, { duration: 950, easing: Easing.in(Easing.quad) })
          ),
          -1
        )
      )
    );
    return () => cancelAnimation(progress);
  }, [delay, progress, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + progress.get() * 0.8,
    transform: [{ scale: 0.55 + progress.get() * 0.6 }, { rotate: `${progress.get() * 45}deg` }],
  }));

  return (
    <Animated.Text style={[styles.sparkle, { fontSize: size }, style, animatedStyle]}>
      ✦
    </Animated.Text>
  );
}

/** A few twinkling stars spread around the parent (which should be `position: relative`). */
export function SparkleCluster({ scale = 1 }: { scale?: number }) {
  return (
    <View style={styles.cluster}>
      <Sparkle size={16 * scale} style={{ top: "6%", left: "8%" }} />
      <Sparkle size={11 * scale} delay={450} style={{ top: "18%", right: "6%" }} />
      <Sparkle size={13 * scale} delay={900} style={{ bottom: "10%", left: "22%" }} />
    </View>
  );
}

const styles = StyleSheet.create({
  cluster: {
    ...StyleSheet.absoluteFill,
    pointerEvents: "none",
  },
  sparkle: {
    position: "absolute",
    color: "#FFF4B8",
    textShadowColor: "rgba(255, 215, 0, 0.9)",
    textShadowRadius: 8,
  },
});
