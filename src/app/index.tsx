import { BlurTargetView, BlurView } from "expo-blur";
import { router } from "expo-router";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BACKGROUND_COLOR, GlassBackground } from "@/components/glass-background";
import { CARD_HEIGHT, PokemonCard } from "@/components/pokemon-card";
import { SearchBar } from "@/components/search-bar";
import { ShinyToggle } from "@/components/shiny-toggle";
import { TypeFilter, type TypeFilterValue } from "@/components/type-filter";
import { capitalize, fetchPokemons, filterPokemons } from "@/lib/pokemon";
import type { Pokemon } from "@/types/pokemon";

const PAGE_SIZE = 24;
const H_PADDING = 16;
const GAP = 12;

export default function Index() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const cardWidth = (width - H_PADDING * 2 - GAP) / 2;
  const blurTargetRef = useRef<View | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TypeFilterValue>("all");
  const [page, setPage] = useState(1);
  const deferredQuery = useDeferredValue(query);

  const load = useCallback(
    (force = false) =>
      fetchPokemons({ force })
        .then((data) => {
          setPokemons(data);
          setError(null);
        })
        .catch((e) => setError(e instanceof Error ? e.message : "Something went wrong")),
    []
  );

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load(true);
    setPage(1);
    setRefreshing(false);
  }, [load]);

  const retry = useCallback(() => {
    setLoading(true);
    load(true).finally(() => setLoading(false));
  }, [load]);

  const onChangeQuery = useCallback((text: string) => {
    setQuery(text);
    setPage(1);
  }, []);

  const onChangeType = useCallback((value: TypeFilterValue) => {
    setType(value);
    setPage(1);
  }, []);

  const openPokemon = useCallback((pokemon: Pokemon) => {
    router.push({ pathname: "/pokemon/[id]", params: { id: String(pokemon.id) } });
  }, []);

  const filtered = useMemo(
    () => filterPokemons(pokemons, deferredQuery, type),
    [pokemons, deferredQuery, type]
  );
  const visible = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page]);
  const hasMore = visible.length < filtered.length;
  const isFiltering = query.trim().length > 0 || type !== "all";
  const listTop = headerHeight + GAP;

  const loadNextPage = useCallback(() => {
    if (hasMore) setPage((p) => p + 1);
  }, [hasMore]);

  const getItemLayout = useCallback(
    (_: ArrayLike<Pokemon> | null | undefined, index: number) => ({
      length: CARD_HEIGHT,
      offset: listTop + (CARD_HEIGHT + GAP) * index,
      index,
    }),
    [listTop]
  );

  const typeLabel = type === "all" ? "" : `${capitalize(type)} `;

  return (
    <View style={styles.screen}>
      <BlurTargetView ref={blurTargetRef} style={StyleSheet.absoluteFill}>
        <GlassBackground />
        {loading || headerHeight === 0 ? (
          <View style={[styles.center, { paddingTop: listTop }]}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.emptyText}>Catching them all...</Text>
          </View>
        ) : error ? (
          <View style={[styles.center, { paddingTop: listTop }]}>
            <Text style={styles.emptyTitle}>Couldn&apos;t load Pokémon</Text>
            <Text style={styles.emptyText}>{error}</Text>
            <TouchableOpacity onPress={retry} activeOpacity={0.8} style={styles.retry}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={visible}
            keyExtractor={(item) => String(item.id)}
            numColumns={2}
            renderItem={({ item }) => (
              <PokemonCard pokemon={item} width={cardWidth} onPress={openPokemon} />
            )}
            columnWrapperStyle={styles.row}
            getItemLayout={getItemLayout}
            onEndReached={loadNextPage}
            onEndReachedThreshold={0.6}
            initialNumToRender={12}
            maxToRenderPerBatch={12}
            windowSize={9}
            removeClippedSubviews
            contentContainerStyle={[
              styles.list,
              { paddingTop: listTop, paddingBottom: insets.bottom + 32 },
            ]}
            scrollIndicatorInsets={{ top: headerHeight }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#FFFFFF"
                progressViewOffset={headerHeight}
              />
            }
            ListFooterComponent={
              hasMore ? (
                <ActivityIndicator style={styles.footer} color="#FFFFFF" />
              ) : visible.length > PAGE_SIZE ? (
                <Text style={[styles.emptyText, styles.footer]}>
                  That&apos;s all {filtered.length} {typeLabel}Pokémon!
                </Text>
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={styles.emptyTitle}>No Pokémon found</Text>
                <Text style={styles.emptyText}>
                  {query.trim()
                    ? `No ${typeLabel}Pokémon match “${query.trim()}”`
                    : `No ${typeLabel}Pokémon here`}
                </Text>
              </View>
            }
          />
        )}
      </BlurTargetView>

      <View
        style={styles.header}
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
      >
        <BlurView
          blurTarget={blurTargetRef}
          blurMethod="dimezisBlurViewSdk31Plus"
          intensity={60}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.headerContent, { paddingTop: insets.top + 8 }]}>
          <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
            Pokédex by Aurnab 🥰
          </Text>
          <View style={styles.titleRow}>
            <Text style={styles.subtitle}>
              {loading
                ? "Loading…"
                : isFiltering
                  ? `${filtered.length} of ${pokemons.length} Pokémon`
                  : `${pokemons.length} Pokémon`}
            </Text>
            <ShinyToggle />
          </View>
          <SearchBar
            value={query}
            onChangeText={onChangeQuery}
            placeholder="Search by name, number or type"
          />
        </View>
        <TypeFilter value={type} onChange={onChangeType} />
        <View style={styles.headerDivider} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    backgroundColor: "rgba(11,16,32,0.45)",
  },
  headerContent: {
    paddingHorizontal: H_PADDING,
    paddingBottom: 12,
    gap: 12,
  },
  headerDivider: {
    height: StyleSheet.hairlineWidth,
    marginTop: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: -4,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  subtitle: {
    flex: 1,
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
  },
  list: {
    paddingHorizontal: H_PADDING,
    gap: GAP,
    flexGrow: 1,
  },
  row: {
    gap: GAP,
  },
  footer: {
    paddingVertical: 20,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  emptyText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
  },
  retry: {
    marginTop: 12,
    backgroundColor: "#7C3AED",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
