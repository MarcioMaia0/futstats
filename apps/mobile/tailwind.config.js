/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#000000",
          950: "#030712",
        },
        brand: {
          gold: "#F2AD24",
          goldStrong: "#D99612",
        },
        surface: {
          base: "#0E0E0E",
          card: "#181818",
          muted: "#242424",
        },
        stroke: {
          default: "#5A5A5A",
          subtle: "#2C2C2C",
        },
        text: {
          body: "#FFFFFF",
          muted: "#8E8E8E",
          subdued: "#D7D7D7",
        },
      },
      fontFamily: {
        body: ["System"],
        brand: ["SedgwickAve_400Regular"],
        slab: ["RobotoSlab_700Bold"],
      },
    },
  },
  plugins: [],
};
