/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Material 3 color roles (RGB triplets defined in index.css)
        primary: "rgb(var(--md-primary) / <alpha-value>)",
        "on-primary": "rgb(var(--md-on-primary) / <alpha-value>)",
        "primary-container": "rgb(var(--md-primary-container) / <alpha-value>)",
        "on-primary-container": "rgb(var(--md-on-primary-container) / <alpha-value>)",
        secondary: "rgb(var(--md-secondary) / <alpha-value>)",
        "on-secondary": "rgb(var(--md-on-secondary) / <alpha-value>)",
        "secondary-container": "rgb(var(--md-secondary-container) / <alpha-value>)",
        "on-secondary-container": "rgb(var(--md-on-secondary-container) / <alpha-value>)",
        tertiary: "rgb(var(--md-tertiary) / <alpha-value>)",
        "on-tertiary": "rgb(var(--md-on-tertiary) / <alpha-value>)",
        "tertiary-container": "rgb(var(--md-tertiary-container) / <alpha-value>)",
        "on-tertiary-container": "rgb(var(--md-on-tertiary-container) / <alpha-value>)",
        error: "rgb(var(--md-error) / <alpha-value>)",
        "error-container": "rgb(var(--md-error-container) / <alpha-value>)",
        "on-error-container": "rgb(var(--md-on-error-container) / <alpha-value>)",
        surface: {
          DEFAULT: "rgb(var(--md-surface) / <alpha-value>)",
          dim: "rgb(var(--md-surface-dim) / <alpha-value>)",
          low: "rgb(var(--md-surface-low) / <alpha-value>)",
          container: "rgb(var(--md-surface-container) / <alpha-value>)",
          high: "rgb(var(--md-surface-high) / <alpha-value>)",
          highest: "rgb(var(--md-surface-highest) / <alpha-value>)",
        },
        "on-surface": "rgb(var(--md-on-surface) / <alpha-value>)",
        "on-surface-variant": "rgb(var(--md-on-surface-variant) / <alpha-value>)",
        outline: {
          DEFAULT: "rgb(var(--md-outline) / <alpha-value>)",
          variant: "rgb(var(--md-outline-variant) / <alpha-value>)",
        },
        "inverse-surface": "rgb(var(--md-inverse-surface) / <alpha-value>)",
        "inverse-on-surface": "rgb(var(--md-inverse-on-surface) / <alpha-value>)",
        // Legacy aliases (kept for shadcn/ui components)
        background: "rgb(var(--md-surface) / <alpha-value>)",
        foreground: "rgb(var(--md-on-surface) / <alpha-value>)",
        border: "rgb(var(--md-outline-variant) / <alpha-value>)",
        input: "rgb(var(--md-outline-variant) / <alpha-value>)",
        ring: "rgb(var(--md-primary) / <alpha-value>)",
        muted: { DEFAULT: "rgb(var(--md-surface-container) / <alpha-value>)", foreground: "rgb(var(--md-on-surface-variant) / <alpha-value>)" },
        accent: { DEFAULT: "rgb(var(--md-secondary-container) / <alpha-value>)", foreground: "rgb(var(--md-on-secondary-container) / <alpha-value>)" },
      },
      fontFamily: {
        sans: ['"Roboto Flex"', 'Roboto', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', '"Noto Sans"', 'sans-serif'],
        mono: ['"Roboto Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      // M3 Expressive motion: standard + emphasized + spring (overshoot)
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.2, 0, 0, 1)',
        emphasized: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        e1: "0 1px 2px 0 rgb(0 0 0 / 0.30), 0 1px 3px 1px rgb(0 0 0 / 0.15)",
        e2: "0 1px 2px 0 rgb(0 0 0 / 0.30), 0 2px 6px 2px rgb(0 0 0 / 0.15)",
        e3: "0 4px 8px 3px rgb(0 0 0 / 0.15), 0 1px 3px 0 rgb(0 0 0 / 0.30)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
