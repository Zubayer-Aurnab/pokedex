import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EvolutionChain } from "@/components/evolution-chain";
import { BACKGROUND_COLOR, GlassBackground } from "@/components/glass-background";
import { glass, GlassPanel } from "@/components/glass-panel";
import { SparkleCluster } from "@/components/sparkle";
import { StatBar } from "@/components/stat-bar";
import { getTypeColor, readableTextColor, withAlpha } from "@/constants/typeColors";
import { useShinyMode } from "@/context/shiny-mode";
import { playCry } from "@/lib/cries";
import {
  artworkUrl,
  capitalize,
  fetchPokemonDetail,
  formatId,
  formatName,
  getCachedPokemon,
  getCachedPokemonDetail,
  POKEMON_COUNT,
  STAT_LABELS,
} from "@/lib/pokemon";
import type { PokemonDetail, PokemonSummary } from "@/types/pokemon";

type Result = { id: number; data?: PokemonDetail; error?: string };

export default function PokemonDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Number(params.id);
  const insets = useSafeAreaInsets();
  const { shiny } = useShinyMode();
  const [result, setResult] = useState<Result | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchPokemonDetail(id)
      .then((data) => !cancelled && setResult({ id, data }))
      .catch(
        (e) =>
          !cancelled &&
          setResult({ id, error: e instanceof Error ? e.message : "Something went wrong" })
      );
    return () => {
      cancelled = true;
    };
  }, [id, attempt]);

  const cachedDetail = getCachedPokemonDetail(id);
  const current = result?.id === id ? result : cachedDetail ? { id, data: cachedDetail } : null;
  const pokemon = current?.data;
  const basic = pokemon ?? getCachedPokemon(id);
  const color = getTypeColor(basic?.types[0]);
  // iOS presents this as a page sheet below the status bar; Android/web are full screen.
  const topPadding = Platform.OS === "ios" ? 16 : insets.top + 12;

  const close = () => (router.canGoBack() ? router.back() : router.replace("/"));
  const show = (next: PokemonSummary) => {
    if (next.id !== id) router.setParams({ id: String(next.id) });
  };
  const showById = (nextId: number) => router.setParams({ id: String(nextId) });
  const replayCry = () => playCry({ id, name: basic?.name });
  const retry = () => {
    setResult(null);
    setAttempt((a) => a + 1);
  };

  return (
    <View style={styles.screen}>
      <GlassBackground tint={color.background} />
      <LinearGradient
        colors={[withAlpha(color.background, 0.7), withAlpha(color.background, 0)]}
        style={styles.heroGradient}
      />

      <ScrollView
        contentContainerStyle={{ paddingTop: topPadding, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={close}
            activeOpacity={0.75}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Close"
            style={[styles.iconButton, glass.surface]}
          >
            <Text style={styles.iconText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.topId}>{formatId(id)}</Text>
          <TouchableOpacity
            onPress={replayCry}
            activeOpacity={0.75}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Play cry"
            style={[styles.iconButton, glass.surface]}
          >
            <Text style={styles.iconText}>🔊</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.hero}>
          <Text style={styles.name} numberOfLines={1}>
            {basic ? formatName(basic.name) : " "}
          </Text>
          {pokemon?.genus ? <Text style={styles.genus}>{pokemon.genus}</Text> : null}
          <View style={styles.types}>
            {basic?.types.map((type) => {
              const typeColor = getTypeColor(type);
              return (
                <View
                  key={type}
                  style={[
                    styles.typePill,
                    {
                      backgroundColor: withAlpha(typeColor.background, 0.6),
                      borderColor: withAlpha(typeColor.accent, 0.7),
                    },
                  ]}
                >
                  <Text style={styles.typeText}>{capitalize(type)}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.imageRow}>
          <TouchableOpacity
            onPress={() => showById(id - 1)}
            disabled={id <= 1}
            activeOpacity={0.75}
            hitSlop={12}
            accessibilityLabel="Previous Pokémon"
            style={[styles.navButton, glass.surface, id <= 1 && styles.hidden]}
          >
            <Text style={styles.navText}>‹</Text>
          </TouchableOpacity>
          <View style={styles.artwork}>
            <Image
              source={{ uri: artworkUrl(id, shiny) }}
              style={styles.artworkImage}
              contentFit="contain"
              transition={250}
              cachePolicy="memory-disk"
            />
            {shiny ? <SparkleCluster scale={1.8} /> : null}
          </View>
          <TouchableOpacity
            onPress={() => showById(id + 1)}
            disabled={id >= POKEMON_COUNT}
            activeOpacity={0.75}
            hitSlop={12}
            accessibilityLabel="Next Pokémon"
            style={[styles.navButton, glass.surface, id >= POKEMON_COUNT && styles.hidden]}
          >
            <Text style={styles.navText}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {!current ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={color.accent} />
            </View>
          ) : !pokemon ? (
            <GlassPanel style={styles.center}>
              <Text style={styles.errorTitle}>Couldn&apos;t load this Pokémon</Text>
              <Text style={styles.body}>{current.error}</Text>
              <TouchableOpacity
                onPress={retry}
                activeOpacity={0.8}
                style={[styles.retry, { backgroundColor: color.background }]}
              >
                <Text style={[styles.retryText, { color: readableTextColor(color.background) }]}>
                  Try again
                </Text>
              </TouchableOpacity>
            </GlassPanel>
          ) : (
            <>
              <GlassPanel>
                {pokemon.description ? (
                  <Text style={styles.body}>{pokemon.description}</Text>
                ) : null}
                <View style={styles.infoRow}>
                  <InfoItem label="Height" value={`${pokemon.height} m`} />
                  <View style={styles.divider} />
                  <InfoItem label="Weight" value={`${pokemon.weight} kg`} />
                </View>
              </GlassPanel>

              <GlassPanel title="Abilities">
                <View style={styles.abilities}>
                  {pokemon.abilities.map((ability) => (
                    <View
                      key={ability.name}
                      style={[styles.abilityPill, { borderColor: withAlpha(color.accent, 0.6) }]}
                    >
                      <Text style={styles.abilityText}>
                        {formatName(ability.name)}
                        {ability.hidden ? <Text style={styles.hiddenTag}> · Hidden</Text> : null}
                      </Text>
                    </View>
                  ))}
                </View>
              </GlassPanel>

              <GlassPanel title="Base stats">
                {pokemon.stats.map((stat, index) => (
                  <StatBar
                    key={stat.name}
                    label={STAT_LABELS[stat.name]}
                    value={stat.value}
                    color={color.accent}
                    delay={index * 70}
                  />
                ))}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>
                    {pokemon.stats.reduce((sum, s) => sum + s.value, 0)}
                  </Text>
                </View>
              </GlassPanel>

              <GlassPanel title="Evolution">
                <EvolutionChain
                  stages={pokemon.evolution}
                  currentId={id}
                  accent={color.accent}
                  shiny={shiny}
                  onSelect={show}
                />
              </GlassPanel>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoValue}>{value}</Text>
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  heroGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 460,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  topId: {
    fontSize: 16,
    fontWeight: "800",
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 1,
  },
  hero: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 6,
  },
  name: {
    fontSize: 34,
    fontWeight: "800",
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowRadius: 8,
  },
  genus: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.75)",
  },
  types: {
    flexDirection: "row",
    gap: 8,
    minHeight: 28,
    marginTop: 4,
  },
  typePill: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  typeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  imageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  navText: {
    fontSize: 26,
    lineHeight: 28,
    color: "#FFFFFF",
    fontWeight: "600",
    marginTop: -2,
  },
  hidden: {
    opacity: 0,
  },
  artwork: {
    width: 240,
    height: 240,
  },
  artworkImage: {
    width: "100%",
    height: "100%",
  },
  content: {
    paddingHorizontal: 16,
    gap: 14,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 8,
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    paddingVertical: 12,
  },
  infoItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  infoLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  abilities: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  abilityPill: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  abilityText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  hiddenTag: {
    color: "rgba(255,255,255,0.5)",
    fontWeight: "500",
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    paddingTop: 10,
  },
  totalLabel: {
    width: 64,
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "800",
  },
  totalValue: {
    width: 32,
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "right",
  },
  retry: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
