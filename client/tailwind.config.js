/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0F19",
        shell: "#121826",
        panel: "#1A2238",
        border: "#2A344A",
        profit: "#00C896",
        danger: "#FF4D4F",
        active: "#3B82F6",
        warning: "#F59E0B",
        text: "#E5E7EB",
        muted: "#9CA3AF",
        dim: "#6B7280",
      },
      boxShadow: {
        panel: "0 25px 80px rgba(0, 0, 0, 0.38)",
        glow: "0 0 0 1px rgba(59,130,246,0.22), 0 0 24px rgba(59,130,246,0.18)",
        profit: "0 0 0 1px rgba(0,200,150,0.22), 0 0 30px rgba(0,200,150,0.2)",
        danger: "0 0 0 1px rgba(255,77,79,0.24), 0 0 30px rgba(255,77,79,0.18)",
      },
      backgroundImage: {
        grid: "radial-gradient(circle at 1px 1px, rgba(229,231,235,0.06) 1px, transparent 0)",
      },
      fontFamily: {
        display: ["Segoe UI", "Trebuchet MS", "sans-serif"],
        body: ["Segoe UI", "Trebuchet MS", "sans-serif"],
      },
    },
  },
  plugins: [],
};
