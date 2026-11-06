import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        foreground: "rgb(var(--color-foreground) / <alpha-value>)",
        surface: {
          DEFAULT: "rgb(var(--color-surface) / <alpha-value>)",
          foreground: "rgb(var(--color-surface-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "rgb(var(--color-muted) / <alpha-value>)",
          foreground: "rgb(var(--color-muted-foreground) / <alpha-value>)",
        },
        border: {
          DEFAULT: "rgb(var(--color-border) / <alpha-value>)",
          hover: "rgb(var(--color-border-hover) / <alpha-value>)",
          control: "rgb(var(--color-control-border) / <alpha-value>)",
          "control-hover":
            "rgb(var(--color-control-border-hover) / <alpha-value>)",
        },
        "control-border": {
          DEFAULT: "rgb(var(--color-control-border) / <alpha-value>)",
          hover: "rgb(var(--color-control-border-hover) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          hover: "rgb(var(--color-primary-hover) / <alpha-value>)",
          foreground: "rgb(var(--color-primary-foreground) / <alpha-value>)",
          muted: "rgb(var(--color-primary-muted) / <alpha-value>)",
          "muted-foreground":
            "rgb(var(--color-primary-muted-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "rgb(var(--color-destructive) / <alpha-value>)",
          hover: "rgb(var(--color-destructive-hover) / <alpha-value>)",
          foreground:
            "rgb(var(--color-destructive-foreground) / <alpha-value>)",
          muted: "rgb(var(--color-destructive-muted) / <alpha-value>)",
          "muted-foreground":
            "rgb(var(--color-destructive-muted-foreground) / <alpha-value>)",
        },
        success: {
          DEFAULT: "rgb(var(--color-success) / <alpha-value>)",
          hover: "rgb(var(--color-success-hover) / <alpha-value>)",
          foreground: "rgb(var(--color-success-foreground) / <alpha-value>)",
          muted: "rgb(var(--color-success-muted) / <alpha-value>)",
          "muted-foreground":
            "rgb(var(--color-success-muted-foreground) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "rgb(var(--color-warning) / <alpha-value>)",
          hover: "rgb(var(--color-warning-hover) / <alpha-value>)",
          foreground: "rgb(var(--color-warning-foreground) / <alpha-value>)",
          muted: "rgb(var(--color-warning-muted) / <alpha-value>)",
          "muted-foreground":
            "rgb(var(--color-warning-muted-foreground) / <alpha-value>)",
        },
        focus: "rgb(var(--color-focus) / <alpha-value>)",
      },
      borderRadius: {
        sm: "var(--radius-sm, 0.25rem)",
        md: "var(--radius-md, 0.375rem)",
        lg: "var(--radius-lg, 0.5rem)",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      },
      fontSize: {
        "page-title": [
          "1.5rem",
          { lineHeight: "2rem", letterSpacing: "-0.025em", fontWeight: "600" },
        ],
        "section-title": [
          "1.125rem",
          {
            lineHeight: "1.75rem",
            letterSpacing: "-0.015em",
            fontWeight: "600",
          },
        ],
        body: ["0.875rem", { lineHeight: "1.25rem", fontWeight: "400" }],
        "body-medium": [
          "0.875rem",
          { lineHeight: "1.25rem", fontWeight: "500" },
        ],
        caption: ["0.75rem", { lineHeight: "1rem", fontWeight: "500" }],
      },
      spacing: {
        sidebar: "var(--sidebar-width, 16rem)",
        "sidebar-collapsed": "var(--sidebar-collapsed-width, 4rem)",
        topbar: "var(--topbar-height, 3.5rem)",
        "control-sm": "2rem",
        "control-md": "2.5rem",
        "control-lg": "2.75rem",
      },
      maxWidth: {
        "container-max": "80rem",
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          '"Liberation Mono"',
          '"Courier New"',
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
