import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: '#4338ca', // Indigo 700
          light: '#6366f1', // Indigo 500
          dark: '#312e81', // Indigo 900
        },
        secondary: {
          DEFAULT: '#1e1b4b', // Indigo 950 (Navy)
        },
        neutral: {
             50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            900: '#0f172a',
        }
      },
      boxShadow: {
        'neo': '5px 5px 0px 0px #000000',
        'neo-sm': '3px 3px 0px 0px #000000',
        'neo-lg': '8px 8px 0px 0px #000000', 
      },
      borderRadius: {
        'neo': '0px', // Bauhaus often uses sharp edges, or maybe slight rounding. Let's start with sharp.
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)'], // Defaulting to Next.js font for now
      }
    },
  },
  plugins: [],
};
export default config;
