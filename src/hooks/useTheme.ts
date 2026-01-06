"use client"

export function useTheme() {
  // Dark mode removed — return fixed light theme and no-op setters
  return {
    theme: "light",
    setTheme: (_: string) => {},
    toggle: () => {},
  }
}
