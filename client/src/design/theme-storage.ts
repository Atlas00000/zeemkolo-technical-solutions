/** Shared theme constants — safe for server + client (no "use client"). */

export const THEME_STORAGE_KEY = "zeemkolo-theme";

export type ThemePreference = "light" | "dark" | "system";

export const THEME_DEFAULT: ThemePreference = "light";

/** Inline script to apply stored theme before paint (avoids flash). Default: light. */
export function themeBootstrapInline(): string {
  return `(function(){try{var k='${THEME_STORAGE_KEY}';var t=localStorage.getItem(k);var pref=t==='light'||t==='dark'||t==='system'?t:'${THEME_DEFAULT}';var dark=pref==='dark'||(pref==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.classList.toggle('dark',dark);r.dataset.theme=pref;}catch(e){}})();`;
}
