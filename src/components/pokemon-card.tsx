import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { SparkleCluster } from "@/components/sparkle";
import { getTypeColor, withAlpha } from "@/constants/typeColors";
import { useShinyMode } from "@/context/shiny-mode";
import { artworkUrl, cardImageUrl, capitalize, formatId, formatName } from "@/lib/pokemon";
import type { Pokemon } from "@/types/pokemon";

export const CARD_HEIGHT = 150;

type Props = {
  pokemon: Pokemon;
  width: number;
  onPress: (pokemon: Pokemon) => void;
};

function PokemonCardBase({ pokemon, width, onPress }: Props) {
  const { shiny } = useShinyMode();
  const color = getTypeColor(pokemon.types[0]);
  const imageUri = cardImageUrl(pokemon.id, shiny);
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const source = failedUri === imageUri ? artworkUrl(pokemon.id) : imageUri;

  return (
    <TouchableOpacity
      onPress={() => onPress(pokemon)}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${formatName(pokemon.name)}, ${formatId(pokemon.id)}`}
      style={[
        styles.card,
        {
          width,
          backgroundColor: withAlpha(color.background, 0.18),
          borderColor: shiny ? "rgba(253, 230, 138, 0.7)" : withAlpha(color.accent, 0.4),
        },
      ]}
    >
      <LinearGradient
        colors={[withAlpha(color.background, 0.6), withAlpha(color.background, 0.06)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={["rgba(255,255,255,0.18)", "rgba(255,255,255,0)"]}
        style={styles.sheen}
      />
      <View style={styles.pokeball} />

      <Text style={styles.id}>{formatId(pokemon.id)}</Text>
      <Text style={styles.name} numberOfLines={1}>
        {formatName(pokemon.name)}
      </Text>
      <View style={styles.types}>
        {pokemon.types.map((type) => {
          const typeColor = getTypeColor(type);
          return (
            <View
              key={type}
              style={[
                styles.typePill,
                {
                  backgroundColor: withAlpha(typeColor.background, 0.55),
                  borderColor: withAlpha(typeColor.accent, 0.6),
                },
              ]}
            >
              <Text style={styles.typeText}>{capitalize(type)}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.imageWrap}>
        <Image
          source={{ uri: source }}
          style={styles.image}
          contentFit="contain"
          transition={200}
          cachePolicy="memory-disk"
          recyclingKey={String(pokemon.id)}
          onError={() => setFailedUri(imageUri)}
        />
        {shiny ? <SparkleCluster /> : null}
      </View>
    </TouchableOpacity>
  );
}

export const PokemonCard = memo(PokemonCardBase);

const styles = StyleSheet.create({
  card: {
    height: CARD_HEIGHT,
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
    overflow: "hidden",
  },
  sheen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: CARD_HEIGHT / 2,
  },
  pokeball: {
    position: "absolute",
    right: -26,
    bottom: -26,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 18,
    borderColor: "rgba(255,255,255,0.08)",
  },
  id: {
    position: "absolute",
    top: 12,
    right: 14,
    fontSize: 12,
    fontWeight: "800",
    color: "rgba(255,255,255,0.5)",
  },
  name: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 8,
    marginRight: 40,
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowRadius: 4,
  },
  types: {
    alignItems: "flex-start",
    gap: 5,
  },
  typePill: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  typeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  imageWrap: {
    position: "absolute",
    right: 4,
    bottom: 4,
    width: 92,
    height: 92,
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
