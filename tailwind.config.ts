import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Ruda', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Lovelo', 'Ruda', 'system-ui', 'sans-serif'],
      },
      // Enhanced font sizes (+20-30% body, +40-70% headings)
      fontSize: {
        'xs': ['0.875rem', { lineHeight: '1.5' }],      // 14px (was 12px)
        'sm': ['1rem', { lineHeight: '1.6' }],          // 16px (was 14px)
        'base': ['1.125rem', { lineHeight: '1.7' }],    // 18px (was 16px)
        'lg': ['1.25rem', { lineHeight: '1.6' }],       // 20px (was 18px)
        'xl': ['1.5rem', { lineHeight: '1.5' }],        // 24px (was 20px)
        '2xl': ['1.875rem', { lineHeight: '1.4' }],     // 30px (was 24px)
        '3xl': ['2.25rem', { lineHeight: '1.3' }],      // 36px (was 30px)
        '4xl': ['3rem', { lineHeight: '1.2' }],         // 48px (was 36px)
        '5xl': ['3.75rem', { lineHeight: '1.1' }],      // 60px (was 48px)
        '6xl': ['4.5rem', { lineHeight: '1.1' }],       // 72px (was 60px)
        '7xl': ['5.5rem', { lineHeight: '1.05' }],      // 88px (was 72px)
      },
      // Enhanced spacing for more breathing room
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        optimis: {
          green: "hsl(var(--optimis-green))",
          "green-light": "hsl(var(--optimis-green-light))",
          "green-pastel": "hsl(var(--optimis-green-pastel))",
          "green-dark": "hsl(var(--optimis-green-dark))",
          gold: "hsl(var(--optimis-gold))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        'soft': '0 4px 20px -4px rgba(0, 0, 0, 0.08)',
        'card': '0 8px 30px -8px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 16px 40px -12px rgba(0, 0, 0, 0.15)',
        'premium': '0 20px 50px -16px rgba(0, 0, 0, 0.18)',
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
        "fade-in": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-in-left": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out",
        "fade-in-up": "fade-in-up 0.7s ease-out",
        "fade-in-delay": "fade-in 0.6s ease-out 0.2s both",
        "fade-in-delay-2": "fade-in 0.6s ease-out 0.4s both",
        "scale-in": "scale-in 0.4s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
