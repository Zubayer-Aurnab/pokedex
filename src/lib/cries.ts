import { type AudioPlayer, type AudioStatus, createAudioPlayer } from "expo-audio";
import { Platform } from "react-native";

import type { PokemonSummary } from "@/types/pokemon";

const POKEAPI_CRIES_URL = "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest";
const SHOWDOWN_CRIES_URL = "https://play.pokemonshowdown.com/audio/cries";

let player: AudioPlayer | null = null;
let queue: string[] = [];
let currentUri: string | null = null;
let failedUri: string | null = null;

// iOS (AVPlayer) can't decode PokeAPI's Ogg Vorbis cries, so it goes straight to
// Showdown's MP3s; other platforms try the Ogg first and fall back to the MP3.
function cryUrls({ id, name }: Partial<PokemonSummary> & { id: number }) {
  const ogg = `${POKEAPI_CRIES_URL}/${id}.ogg`;
  const mp3 = name ? `${SHOWDOWN_CRIES_URL}/${name.replace(/[^a-z0-9]/g, "")}.mp3` : null;
  const urls = Platform.OS === "ios" ? [mp3] : [ogg, mp3];
  return urls.filter((url): url is string => url !== null);
}

function onStatus(status: AudioStatus) {
  if (!status.error || currentUri === failedUri) return;
  failedUri = currentUri;
  playNext();
}

function getPlayer() {
  if (!player) {
    player = createAudioPlayer(null);
    player.volume = 0.6;
    player.addListener("playbackStatusUpdate", onStatus);
  }
  return player;
}

function playNext() {
  const uri = queue.shift();
  if (!uri) return;
  try {
    const p = getPlayer();
    currentUri = uri;
    p.replace({ uri });
    p.play();
  } catch (error) {
    console.warn("Could not play cry:", error);
    playNext();
  }
}

export function playCry(pokemon: Partial<PokemonSummary> & { id: number }) {
  queue = cryUrls(pokemon);
  failedUri = null;
  playNext();
}
