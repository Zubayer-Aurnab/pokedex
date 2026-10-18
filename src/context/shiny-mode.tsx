import { createContext, type ReactNode, useContext, useMemo, useState } from "react";

interface ShinyModeValue {
  shiny: boolean;
  toggleShiny: () => void;
}

const ShinyModeContext = createContext<ShinyModeValue | null>(null);

export function ShinyModeProvider({ children }: { children: ReactNode }) {
  const [shiny, setShiny] = useState(false);
  const value = useMemo(() => ({ shiny, toggleShiny: () => setShiny((s) => !s) }), [shiny]);
  return <ShinyModeContext value={value}>{children}</ShinyModeContext>;
}

export function useShinyMode() {
  const value = useContext(ShinyModeContext);
  if (!value) throw new Error("useShinyMode must be used inside <ShinyModeProvider>");
  return value;
}
