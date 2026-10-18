import {
  type EvolutionChainLink,
  type EvolutionChainResponse,
  type EvolutionStage,
  type Pokemon,
  type PokemonDetail,
  type PokemonResponse,
  type PokemonSpeciesListResponse,
  type PokemonSpeciesResponse,
  type PokemonType,
  type PokemonTypeResponse,
  POKEMON_TYPES,
  type StatName,
  STAT_NAMES,
} from "@/types/pokemon";

const API_URL = "https://pokeapi.co/api/v2";
const SPRITES_URL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

export const POKEMON_COUNT = 1025;

export const STAT_LABELS: Record<StatName, string> = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
  speed: "Speed",
};

export function artworkUrl(id: number, shiny = false) {
  return `${SPRITES_URL}/other/official-artwork/${shiny ? "shiny/" : ""}${id}.png`;
}

export function cardImageUrl(id: number, shiny: boolean) {
  return shiny ? `${SPRITES_URL}/shiny/${id}.png` : artworkUrl(id);
}

export function formatId(id: number) {
  return `#${String(id).padStart(3, "0")}`;
}

export function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatName(value: string) {
  return value.split("-").map(capitalize).join(" ");
}

export function filterPokemons(
  pokemons: Pokemon[],
  query: string,
  type: PokemonType | "all"
): Pokemon[] {
  const q = query.trim().toLowerCase().replace(/^#/, "");
  const asNumber = q && /^\d+$/.test(q) ? String(Number(q)) : null;
  return pokemons.filter(
    (p) =>
      (type === "all" || p.types.includes(type)) &&
      (!q ||
        p.name.includes(q) ||
        formatName(p.name).toLowerCase().includes(q) ||
        p.types.some((t) => t.startsWith(q)) ||
        (asNumber !== null && String(p.id).startsWith(asNumber)))
  );
}

function isPokemonType(value: string): value is PokemonType {
  return (POKEMON_TYPES as readonly string[]).includes(value);
}

function isStatName(value: string): value is StatName {
  return (STAT_NAMES as readonly string[]).includes(value);
}

function idFromUrl(url: string) {
  return Number(url.split("/").filter(Boolean).pop());
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return (await response.json()) as T;
}

const pokemonById = new Map<number, Pokemon>();
const detailById = new Map<number, PokemonDetail>();
const evolutionByUrl = new Map<string, Promise<EvolutionStage[]>>();
let pokemonsRequest: Promise<Pokemon[]> | null = null;

export function getCachedPokemon(id: number) {
  return pokemonById.get(id);
}

export function getCachedPokemonDetail(id: number) {
  return detailById.get(id);
}

// Concurrent callers share one request; `force` bypasses the cached result.
export function fetchPokemons({ force = false } = {}): Promise<Pokemon[]> {
  if (force || !pokemonsRequest) {
    const request = loadPokemons();
    pokemonsRequest = request;
    request.catch(() => {
      if (pokemonsRequest === request) pokemonsRequest = null;
    });
  }
  return pokemonsRequest;
}

// Loading every Pokémon individually would take 1,000+ requests, so types are
// collected from the 18 type endpoints instead.
async function loadPokemons(): Promise<Pokemon[]> {
  const [species, typeLists] = await Promise.all([
    getJson<PokemonSpeciesListResponse>(`${API_URL}/pokemon-species?limit=${POKEMON_COUNT}`),
    Promise.all(POKEMON_TYPES.map((type) => getJson<PokemonTypeResponse>(`${API_URL}/type/${type}`))),
  ]);

  const typesById = new Map<number, { slot: number; type: PokemonType }[]>();
  typeLists.forEach((data, index) => {
    const type = POKEMON_TYPES[index];
    for (const { slot, pokemon } of data.pokemon) {
      const id = idFromUrl(pokemon.url);
      const entry = typesById.get(id) ?? [];
      entry.push({ slot, type });
      typesById.set(id, entry);
    }
  });

  const pokemons = species.results
    .map(({ name, url }): Pokemon => {
      const id = idFromUrl(url);
      return {
        id,
        name,
        types: (typesById.get(id) ?? []).sort((a, b) => a.slot - b.slot).map((t) => t.type),
      };
    })
    .sort((a, b) => a.id - b.id);

  for (const pokemon of pokemons) pokemonById.set(pokemon.id, pokemon);
  return pokemons;
}

function flattenChain(chain: EvolutionChainLink): EvolutionStage[] {
  const stages: EvolutionStage[] = [];
  let level: EvolutionChainLink[] = [chain];
  while (level.length > 0) {
    stages.push(
      level
        .map((link) => ({ id: idFromUrl(link.species.url), name: link.species.name }))
        .filter((p) => p.id <= POKEMON_COUNT)
    );
    level = level.flatMap((link) => link.evolves_to);
  }
  return stages.filter((stage) => stage.length > 0);
}

function fetchEvolution(url: string): Promise<EvolutionStage[]> {
  let request = evolutionByUrl.get(url);
  if (!request) {
    request = getJson<EvolutionChainResponse>(url).then((data) => flattenChain(data.chain));
    evolutionByUrl.set(url, request);
    request.catch(() => evolutionByUrl.delete(url));
  }
  return request;
}

export async function fetchPokemonDetail(id: number): Promise<PokemonDetail> {
  const cached = detailById.get(id);
  if (cached) return cached;

  const [pokemon, species] = await Promise.all([
    getJson<PokemonResponse>(`${API_URL}/pokemon/${id}`),
    getJson<PokemonSpeciesResponse>(`${API_URL}/pokemon-species/${id}`),
  ]);

  const evolution = species.evolution_chain
    ? await fetchEvolution(species.evolution_chain.url).catch(() => [])
    : [];

  const englishFlavor = species.flavor_text_entries.filter((f) => f.language.name === "en");

  const detail: PokemonDetail = {
    id,
    name: species.name,
    types: [...pokemon.types]
      .sort((a, b) => a.slot - b.slot)
      .map((t) => t.type.name)
      .filter(isPokemonType),
    height: pokemon.height / 10,
    weight: pokemon.weight / 10,
    genus: species.genera.find((g) => g.language.name === "en")?.genus ?? "",
    description: (englishFlavor.at(-1)?.flavor_text ?? "").replace(/[\n\f\r\u00ad]+/g, " "),
    abilities: pokemon.abilities.map((a) => ({ name: a.ability.name, hidden: a.is_hidden })),
    stats: pokemon.stats.flatMap((s) =>
      isStatName(s.stat.name) ? [{ name: s.stat.name, value: s.base_stat }] : []
    ),
    evolution,
  };

  detailById.set(id, detail);
  return detail;
}
