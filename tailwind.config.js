/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/views/**/*.ejs"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "hover-lift": "hoverLift 0.3s ease-out",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "bounce-gentle": "bounceGentle 0.3s ease-in-out",
        float: "float 4s ease-in-out infinite",
        "rotate-slow": "rotateSlow 8s linear infinite",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
        "slide-up": "slideUp 0.6s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        hoverLift: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-8px)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(61, 190, 255, 0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(61, 190, 255, 0.6)" },
        },
        bounceGentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-2px)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%": { transform: "translateY(-10px) rotate(2deg)" },
          "66%": { transform: "translateY(-5px) rotate(-1deg)" },
        },
        rotateSlow: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      colors: {
        teal: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
          950: "#042f2e",
        },
        amber: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          950: "#451a03",
        },
        // Colores principales del proyecto
        primary: "#3DBEFF",
        secondary: "#061f35",
        "dark-bg": "#0d1117",
        "card-bg": "rgba(69, 51, 188, 0.08)",
        "text-light": "#dceeff",
        "text-white": "#ffffff",
        // Colores adicionales para contacto
        "accent-blue": "#0f538f",
        "contact-cyan": "#00bcd4",
        "social-facebook": "#1877f2",
        "social-instagram": "#e4405f",
        "border-color": "#061f35",
        "tab-bg": "#334155",
        "tab-hover": "#475569",
        "tab-active": "#3dbeff",
        "badge-teal": "rgba(20,184,166,0.2)",
        "badge-yellow": "rgba(245,158,11,0.2)",
        "badge-purple": "rgba(168,85,247,0.2)",
      },
      backgroundImage: {
        "hero-pattern":
          "url('https://colombia.unir.net/wp-content/uploads/sites/4/2020/08/ficha_1920x1080_02.png')",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glow: "0 0 20px rgba(61, 190, 255, 0.3)",
        "glow-lg": "0 0 30px rgba(61, 190, 255, 0.6)",
        contact: "0 6px 15px rgba(0, 122, 255, 0.4)",
        "contact-hover": "0 8px 20px rgba(56, 141, 231, 0.6)",
      },
      borderRadius: {
        contact: "40px",
        card: "20px",
      },
      spacing: {
        contact: "40px",
        card: "20px",
      },
    },
  },
  plugins: [],
};
