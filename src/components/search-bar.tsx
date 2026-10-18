import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { glass } from "@/components/glass-panel";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function SearchBar({ value, onChangeText, placeholder = "Search" }: Props) {
  return (
    <View style={[styles.container, glass.surface]}>
      <Text style={styles.icon}>⌕</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.45)"
        selectionColor="#A78BFA"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        keyboardAppearance="dark"
        style={styles.input}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChangeText("")}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          style={styles.clear}
        >
          <Text style={styles.clearText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
  },
  icon: {
    fontSize: 22,
    color: "rgba(255,255,255,0.6)",
    marginRight: 8,
    marginTop: -2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#FFFFFF",
    paddingVertical: 0,
  },
  clear: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  clearText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
