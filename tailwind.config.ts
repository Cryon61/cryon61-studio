import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#07080c",
        surface: "#0e1118",
        card: "#12151e",
        line: "#1d2230",
        brand: { DEFAULT: "#7c5cff", soft: "#a594ff", cyan: "#38d5ff" },
      },
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
