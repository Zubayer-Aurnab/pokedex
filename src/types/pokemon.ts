export const POKEMON_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
] as const;

export type PokemonType = (typeof POKEMON_TYPES)[number];

export const STAT_NAMES = [
  "hp",
  "attack",
  "defense",
  "special-attack",
  "special-defense",
  "speed",
] as const;

export type StatName = (typeof STAT_NAMES)[number];

export interface PokemonSummary {
  id: number;
  name: string;
}

export interface Pokemon extends PokemonSummary {
  types: PokemonType[];
}

export interface PokemonStat {
  name: StatName;
  value: number;
}

export interface PokemonAbility {
  name: string;
  hidden: boolean;
}

/** One evolution stage; holds several entries when the chain branches (e.g. Eevee). */
export type EvolutionStage = PokemonSummary[];

export interface PokemonDetail extends Pokemon {
  height: number;
  weight: number;
  genus: string;
  description: string;
  abilities: PokemonAbility[];
  stats: PokemonStat[];
  evolution: EvolutionStage[];
}

export interface NamedAPIResource {
  name: string;
  url: string;
}

export interface PokemonSpeciesListResponse {
  count: number;
  results: NamedAPIResource[];
}

export interface PokemonTypeResponse {
  name: string;
  pokemon: { slot: number; pokemon: NamedAPIResource }[];
}

export interface PokemonResponse {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: { slot: number; type: NamedAPIResource }[];
  abilities: { slot: number; is_hidden: boolean; ability: NamedAPIResource }[];
  stats: { base_stat: number; effort: number; stat: NamedAPIResource }[];
}

export interface PokemonSpeciesResponse {
  id: number;
  name: string;
  genera: { genus: string; language: NamedAPIResource }[];
  flavor_text_entries: {
    flavor_text: string;
    language: NamedAPIResource;
    version: NamedAPIResource;
  }[];
  evolution_chain: { url: string } | null;
}

export interface EvolutionChainLink {
  species: NamedAPIResource;
  evolves_to: EvolutionChainLink[];
}

export interface EvolutionChainResponse {
  id: number;
  chain: EvolutionChainLink;
}
