export const STORAGE_KEY = "tkw-theme";

/** Inline script body executed before first paint — see ThemeBootScript.tsx. */
export function getThemeBootScriptBody(): string {
  return `(function(){try{var KEY='${STORAGE_KEY}';var stored=null;try{stored=window.localStorage.getItem(KEY)}catch(e){stored=null}var mode=(stored==='light'||stored==='dark'||stored==='system')?stored:'system';var systemDark=(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);var resolved=(mode==='light'||mode==='dark')?mode:(systemDark?'dark':'light');var root=document.documentElement;if(resolved==='dark'){root.setAttribute('data-theme','dark')}else{root.removeAttribute('data-theme')}root.setAttribute('data-theme-mode',mode);root.style.colorScheme=resolved}catch(e){}})();`;
}
