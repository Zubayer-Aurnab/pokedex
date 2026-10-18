import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { glass } from "@/components/glass-panel";
import { readableTextColor, TYPE_COLORS, withAlpha } from "@/constants/typeColors";
import { capitalize } from "@/lib/pokemon";
import { POKEMON_TYPES, type PokemonType } from "@/types/pokemon";

export type TypeFilterValue = PokemonType | "all";

type Props = {
  value: TypeFilterValue;
  onChange: (value: TypeFilterValue) => void;
};

const OPTIONS: TypeFilterValue[] = ["all", ...POKEMON_TYPES];

export function TypeFilter({ value, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.content}
    >
      {OPTIONS.map((option) => {
        const selected = option === value;
        const color = option === "all" ? null : TYPE_COLORS[option];
        const fill = color?.background ?? "#FFFFFF";
        return (
          <TouchableOpacity
            key={option}
            onPress={() => onChange(option)}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[
              styles.chip,
              selected
                ? { backgroundColor: fill, borderColor: color?.accent ?? fill }
                : [glass.surface, color && { borderColor: withAlpha(color.accent, 0.35) }],
            ]}
          >
            {color && !selected ? (
              <View style={[styles.dot, { backgroundColor: color.background }]} />
            ) : null}
            <Text style={[styles.label, selected && { color: readableTextColor(fill) }]}>
              {option === "all" ? "All" : capitalize(option)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 17,
    borderWidth: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(255,255,255,0.85)",
  },
});
