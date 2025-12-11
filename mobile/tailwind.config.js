/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#06B6D4",
        secondary: "#2563EB",
        success: "#10B981",
        error: "#EF4444",
        warning: "#F59E0B",
        dark: "#0F172A",
        light: "#F8FAFC",
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
