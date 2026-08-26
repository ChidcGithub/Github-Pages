/**
 * Dynamic M3 Expressive theming driven by time-of-day × season.
 *
 * Pipeline:  anchor colors (RGB) --linear interp--> seed RGB --to HSL-->
 * parametric M3 scheme --> written onto <html> as `--md-*` variables,
 * smoothly overriding the static palette in index.css.
 *
 * Day anchors:  dawn pale-yellow → noon sky-blue → afternoon SEASONAL →
 * dusk orange → night deep-blue. Season anchors drift linearly across the
 * year: spring green → summer blue → autumn maple-red → winter gray.
 */

type RGB = { r: number; g: number; b: number };
type HSL = { h: number; s: number; l: number };

/* ------------------------------------------------------------------ */
/* Color conversion helpers                                           */
/* ------------------------------------------------------------------ */

function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function lerpRgb(a: RGB, b: RGB, t: number): RGB {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  };
}

function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (max === rn) h = ((gn - bn) / d) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  return { h, s, l };
}

/** Convert HSL to an `r g b` triplet usable inside rgb(var(--x)) */
function hslTriplet(h: number, sPct: number, lPct: number): string {
  const s = Math.min(Math.max(sPct, 0), 100) / 100;
  const l = Math.min(Math.max(lPct, 0), 100) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let rn = 0;
  let gn = 0;
  let bn = 0;
  if (hp < 1) [rn, gn, bn] = [c, x, 0];
  else if (hp < 2) [rn, gn, bn] = [x, c, 0];
  else if (hp < 3) [rn, gn, bn] = [0, c, x];
  else if (hp < 4) [rn, gn, bn] = [0, x, c];
  else if (hp < 5) [rn, gn, bn] = [x, 0, c];
  else [rn, gn, bn] = [c, 0, x];
  const m = l - c / 2;
  const to255 = (v: number) => Math.round((v + m) * 255);
  return `${to255(rn)} ${to255(gn)} ${to255(bn)}`;
}

/* ------------------------------------------------------------------ */
/* Anchors                                                            */
/* ------------------------------------------------------------------ */

interface TimeAnchor {
  /** minutes since midnight */
  min: number;
  hex: string;
}

// Time-of-day seed colors (become the M3 "primary" hue source)
const TIME_ANCHORS: TimeAnchor[] = [
  { min: 3 * 60, hex: "#4655B0" }, // deep of night — deep blue
  { min: 6.5 * 60, hex: "#B08D2A" }, // morning — pale yellow
  { min: 12 * 60, hex: "#4A90D9" }, // noon — sky blue
  { min: 15 * 60, hex: "" }, // afternoon — injected seasonal color
  { min: 18.5 * 60, hex: "#D97A2B" }, // evening — orange
  { min: 21 * 60, hex: "#4655B0" }, // night — deep blue
];

const SEASONAL_SLOT = 15 * 60;

// Season anchors on a chronological ring. Winter appears twice so the
// gray "holds" through mid-January instead of drifting toward spring
// immediately after the December solstice.
const SEASON_ANCHORS: { month: number; day: number; hex: string }[] = [
  { month: 1, day: 15, hex: "#8B8E94" }, // deep winter — gray (hold)
  { month: 3, day: 1, hex: "#6FA83C" }, // spring — pale green
  { month: 6, day: 1, hex: "#4AA3CF" }, // summer — light blue
  { month: 8, day: 10, hex: "#D9A23B" }, // late summer — ripe gold (bridges blue→red without a muddy dip)
  { month: 9, day: 1, hex: "#C74E2A" }, // autumn — maple red
  { month: 12, day: 1, hex: "#8B8E94" }, // early winter — gray
];

function dayOfYear(date: Date): number {
  return (
    Math.floor(
      (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
        Date.UTC(date.getFullYear(), 0, 1)) /
        86_400_000
    ) + 1
  );
}

/** Linearly-interpolated seasonal seed for the given date */
function seasonalSeed(date: Date): RGB {
  const year = date.getFullYear();
  const doy = dayOfYear(date);

  const lenThis = Math.round((Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86_400_000);
  const lenPrev = Math.round((Date.UTC(year, 0, 1) - Date.UTC(year - 1, 0, 1)) / 86_400_000);

  const points = [...SEASON_ANCHORS]
    .sort((a, b) => a.month * 31 + a.day - (b.month * 31 + b.day))
    .map((a) => ({
      doy: Math.floor((Date.UTC(year, a.month - 1, a.day) - Date.UTC(year, 0, 1)) / 86_400_000) + 1,
      rgb: hexToRgb(a.hex),
    }));

  // Extend the ring across year boundaries:
  //   …prev winter → [this year's anchors]… → next hold → next spring…
  const last = points[points.length - 1];
  points.unshift({ doy: last.doy - lenPrev, rgb: last.rgb });
  const firstTwo = points.slice(1, 3);
  for (const p of firstTwo) {
    points.push({ doy: p.doy + lenThis, rgb: p.rgb });
  }

  let prev = points[0];
  let next = points[1];
  for (let i = 0; i < points.length - 1; i++) {
    if (doy >= points[i].doy && doy < points[i + 1].doy) {
      prev = points[i];
      next = points[i + 1];
      break;
    }
  }
  const t = Math.min(Math.max((doy - prev.doy) / Math.max(1, next.doy - prev.doy), 0), 1);
  return lerpRgb(prev.rgb, next.rgb, t);
}

/** Interpolated seed for the current moment (RGB → HSL for generation) */
export function currentSeed(now = new Date()): HSL {
  const seasonal = seasonalSeed(now);
  const points = TIME_ANCHORS.map((a) => ({
    min: a.min,
    rgb: a.min === SEASONAL_SLOT ? seasonal : hexToRgb(a.hex),
  }));

  const m = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  let prev = points[points.length - 1];
  let next = points[0];
  let span = 1440 - prev.min + next.min; // wrap-around segment
  let offset = m >= prev.min ? m - prev.min : m + (1440 - prev.min);

  for (let i = 0; i < points.length - 1; i++) {
    if (m >= points[i].min && m < points[i + 1].min) {
      prev = points[i];
      next = points[i + 1];
      span = next.min - prev.min;
      offset = m - prev.min;
      break;
    }
  }

  return rgbToHsl(lerpRgb(prev.rgb, next.rgb, offset / Math.max(1, span)));
}

/* ------------------------------------------------------------------ */
/* Parametric M3 scheme generation                                    */
/* ------------------------------------------------------------------ */

type SchemeVars = Record<string, string>;

/**
 * Chroma multiplier from seed saturation. The power curve lifts the
 * low-saturation dips that RGB interpolation produces mid-transition,
 * keeping every phase of the day gently colorful instead of gray.
 */
function chromaOf(s: number): number {
  return Math.pow(Math.min(Math.max(s, 0), 1), 0.55);
}

function lightScheme({ h, s }: HSL): SchemeVars {
  const c = chromaOf(s);
  return {
    primary: hslTriplet(h, 42 * c, 46),
    "on-primary": hslTriplet(h, 0, 100),
    "primary-container": hslTriplet(h, 90 * c, 91),
    "on-primary-container": hslTriplet(h, 95 * c, 17),
    secondary: hslTriplet(h, 14 * c, 39),
    "on-secondary": hslTriplet(h, 0, 100),
    "secondary-container": hslTriplet(h, 40 * c, 90),
    "on-secondary-container": hslTriplet(h, 30 * c, 13),
    tertiary: hslTriplet(h + 58, 30 * c, 41),
    "on-tertiary": hslTriplet(h + 58, 0, 100),
    "tertiary-container": hslTriplet(h + 58, 85 * c, 89),
    "on-tertiary-container": hslTriplet(h + 58, 90 * c, 15),
    surface: hslTriplet(h, 65 * c, 98.6),
    "surface-dim": hslTriplet(h, 12 * c, 87),
    "surface-low": hslTriplet(h, 45 * c, 96.6),
    "surface-container": hslTriplet(h, 42 * c, 95.3),
    "surface-high": hslTriplet(h, 38 * c, 93),
    "surface-highest": hslTriplet(h, 32 * c, 90.6),
    "on-surface": hslTriplet(h, 6 * c, 12),
    "on-surface-variant": hslTriplet(h, 6 * c, 30),
    outline: hslTriplet(h, 4 * c, 48),
    "outline-variant": hslTriplet(h, 12 * c, 81),
    "inverse-surface": hslTriplet(h, 5 * c, 20),
    "inverse-on-surface": hslTriplet(h, 60 * c, 96),
  };
}

function darkScheme({ h, s }: HSL): SchemeVars {
  const c = chromaOf(s);
  return {
    primary: hslTriplet(h, 80 * c, 87),
    "on-primary": hslTriplet(h, 62 * c, 33),
    "primary-container": hslTriplet(h, 44 * c, 39),
    "on-primary-container": hslTriplet(h, 90 * c, 91),
    secondary: hslTriplet(h, 15 * c, 83),
    "on-secondary": hslTriplet(h, 16 * c, 21),
    "secondary-container": hslTriplet(h, 11 * c, 30),
    "on-secondary-container": hslTriplet(h, 35 * c, 90),
    tertiary: hslTriplet(h + 58, 42 * c, 83),
    "on-tertiary": hslTriplet(h + 58, 33 * c, 25),
    "tertiary-container": hslTriplet(h + 58, 26 * c, 35),
    "on-tertiary-container": hslTriplet(h + 58, 82 * c, 89),
    surface: hslTriplet(h, 10 * c, 8),
    "surface-dim": hslTriplet(h, 10 * c, 8),
    "surface-low": hslTriplet(h, 10 * c, 12),
    "surface-container": hslTriplet(h, 9 * c, 14),
    "surface-high": hslTriplet(h, 8 * c, 17),
    "surface-highest": hslTriplet(h, 7 * c, 21),
    "on-surface": hslTriplet(h, 10 * c, 90),
    "on-surface-variant": hslTriplet(h, 10 * c, 79),
    outline: hslTriplet(h, 4 * c, 58),
    "outline-variant": hslTriplet(h, 5 * c, 29),
    "inverse-surface": hslTriplet(h, 10 * c, 90),
    "inverse-on-surface": hslTriplet(h, 9 * c, 19),
  };
}

/* ------------------------------------------------------------------ */
/* Application                                                        */
/* ------------------------------------------------------------------ */

function apply(now = new Date()): void {
  const seed = currentSeed(now);
  const dark = document.documentElement.classList.contains("dark");
  const vars = dark ? darkScheme(seed) : lightScheme(seed);
  const root = document.documentElement;
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(`--md-${key}`, value);
  }

  // Keep the browser chrome tinted with the surface color
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]:not([media])');
  if (!meta) {
    const created = document.createElement("meta");
    created.name = "theme-color";
    created.content = `rgb(${vars.surface.split(" ").join(",")})`;
    document.head.appendChild(created);
  } else {
    meta.removeAttribute("media");
    meta.content = `rgb(${vars.surface.split(" ").join(",")})`;
  }
}

/**
 * Start the clock. Returns a cleanup function.
 * Re-applies every minute and whenever the light/dark class flips.
 */
export function initDynamicTheme(): () => void {
  apply();

  const tick = setInterval(() => apply(), 60_000);

  const observer = new MutationObserver(() => apply());
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

  return () => {
    clearInterval(tick);
    observer.disconnect();
  };
}
