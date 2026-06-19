import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--color-chalk)",
        input: "var(--color-chalk)",
        ring: "var(--color-signal-orange)",
        background: "var(--color-mist)",
        foreground: "var(--color-carbon)",
        "signal-orange": "#ff682c",
        "sienna-bronze": "#816729",
        carbon: "#202020",
        graphite: "#4d4d4d",
        slate: "#828282",
        fog: "#f5f5f5",
        mist: "#efefef",
        chalk: "#e8e8e8",
        paper: "#ffffff",
        primary: {
          DEFAULT: "var(--color-carbon)",
          foreground: "var(--color-paper)",
        },
        secondary: {
          DEFAULT: "var(--color-fog)",
          foreground: "var(--color-carbon)",
        },
        destructive: {
          DEFAULT: "#d32f2f",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "var(--color-fog)",
          foreground: "var(--color-slate)",
        },
        accent: {
          DEFAULT: "var(--color-signal-orange)",
          foreground: "var(--color-paper)",
        },
        popover: {
          DEFAULT: "var(--color-paper)",
          foreground: "var(--color-carbon)",
        },
        card: {
          DEFAULT: "var(--color-paper)",
          foreground: "var(--color-carbon)",
        },
      },
      fontFamily: {
        polysans: ["var(--font-polysans)"],
        inter: ["var(--font-inter)"],
        sans: ["var(--font-inter)"],
      },
      fontSize: {
        caption: ["12px", { lineHeight: "1.5" }],
        body: ["16px", { lineHeight: "1.38" }],
        "body-lg": ["18px", { lineHeight: "1.33" }],
        subheading: ["32px", { lineHeight: "1.19", letterSpacing: "-0.64px" }],
        heading: ["40px", { lineHeight: "1.13", letterSpacing: "-0.8px" }],
        display: ["66px", { lineHeight: "0.91", letterSpacing: "-1.32px" }],
      },
      spacing: {
        "8": "8px",
        "12": "12px",
        "16": "16px",
        "20": "20px",
        "36": "36px",
        "40": "40px",
        "60": "60px",
        "140": "140px",
      },
      borderRadius: {
        lg: "8px",
        md: "6px",
        sm: "3px",
        xl: "12px",
        "2xl": "20px",
        full: "200px",
        tags: "20px",
        cards: "8px",
        inputs: "8px",
        buttons: "20px",
        navpill: "200px",
      },
      maxWidth: {
        page: "1200px",
      },
      gap: {
        section: "80px",
        element: "20px",
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
};

export default config;
