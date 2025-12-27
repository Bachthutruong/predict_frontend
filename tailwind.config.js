/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
      extend: {
        maxWidth: {
          '8xl': '1440px',
        }
      }
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#1a73e8", // Google Blue
          foreground: "#ffffff",
          hover: "#1557b0",
        },
        secondary: {
          DEFAULT: "#e8f0fe", // Light blue background
          foreground: "#1a73e8",
        },
        accent: {
          DEFAULT: "#f1f3f4", // Google Gray
          foreground: "#202124",
        },
        destructive: {
          DEFAULT: "#d93025", // Google Red
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#f1f3f4",
          foreground: "#5f6368",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#202124",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#202124",
        },
        success: {
          DEFAULT: "#188038", // Google Green
          foreground: "#ffffff",
        },
        warning: {
          DEFAULT: "#f9ab00", // Google Yellow
          foreground: "#ffffff",
        },
      },
      borderRadius: {
        lg: "0.5rem", // 8px
        md: "0.375rem", // 6px
        sm: "0.25rem", // 4px
        xl: "1rem", // 16px
        "2xl": "1.5rem", // 24px
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'google': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)', // Very subtle, like Tailwind shadow-sm but slightly tweaked
        'google-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)', // Like Tailwind shadow-md
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

