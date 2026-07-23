const STORAGE_KEY = "fdown_theme";

export function getStoredTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  return (localStorage.getItem(STORAGE_KEY) as "dark" | "light") || "dark";
}

export function setStoredTheme(theme: "dark" | "light") {
  localStorage.setItem(STORAGE_KEY, theme);
  document.documentElement.setAttribute("data-theme", theme === "light" ? "light" : "");
}

export function toggleStoredTheme(): "dark" | "light" {
  const next = getStoredTheme() === "dark" ? "light" : "dark";
  setStoredTheme(next);
  return next;
}
