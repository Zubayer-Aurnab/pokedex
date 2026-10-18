import { Image } from "expo-image";
import { Fragment } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { withAlpha } from "@/constants/typeColors";
import { artworkUrl, formatName } from "@/lib/pokemon";
import type { EvolutionStage, PokemonSummary } from "@/types/pokemon";

const ITEM_WIDTH = 76;
const ITEM_GAP = 8;

type Props = {
  stages: EvolutionStage[];
  currentId: number;
  accent: string;
  shiny: boolean;
  onSelect: (pokemon: PokemonSummary) => void;
};

export function EvolutionChain({ stages, currentId, accent, shiny, onSelect }: Props) {
  if (stages.length <= 1) {
    return <Text style={styles.empty}>This Pokémon does not evolve.</Text>;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {stages.map((stage, index) => (
        <Fragment key={stage.map((p) => p.id).join("-")}>
          {index > 0 ? <Text style={styles.arrow}>›</Text> : null}
          <View
            style={[
              styles.stage,
              stage.length > 3 && { width: ITEM_WIDTH * 2 + ITEM_GAP },
            ]}
          >
            {stage.map((pokemon) => {
              const active = pokemon.id === currentId;
              return (
                <TouchableOpacity
                  key={pokemon.id}
                  onPress={() => onSelect(pokemon)}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={formatName(pokemon.name)}
                  style={styles.item}
                >
                  <View
                    style={[
                      styles.avatar,
                      active && {
                        borderColor: accent,
                        backgroundColor: withAlpha(accent, 0.18),
                      },
                    ]}
                  >
                    <Image
                      source={{ uri: artworkUrl(pokemon.id, shiny) }}
                      style={styles.image}
                      contentFit="contain"
                      transition={150}
                      cachePolicy="memory-disk"
                    />
                  </View>
                  <Text style={[styles.name, active && styles.nameActive]} numberOfLines={1}>
                    {formatName(pokemon.name)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Fragment>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  stage: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: ITEM_WIDTH,
    gap: ITEM_GAP,
  },
  arrow: {
    fontSize: 28,
    color: "rgba(255,255,255,0.4)",
    marginTop: -18,
  },
  item: {
    width: ITEM_WIDTH,
    alignItems: "center",
    gap: 6,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 54,
    height: 54,
  },
  name: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.65)",
  },
  nameActive: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  empty: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
  },
});
