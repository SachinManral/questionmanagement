/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f172a",    // Slate-950 (Main BG)
        surface: "#1e293b",       // Slate-800 (Card BG)
        surfaceHover: "#334155",  // Slate-700
        primary: "#6366f1",       // Indigo-500 (Buttons/Links)
        accent: "#818cf8",        // Indigo-400 (Hover states)
        success: "#10b981",       // Emerald-500 (Progress/Checkmarks)
        muted: "#94a3b8",         // Slate-400 (Secondary text)
        border: "#1e293b",        // Slate-800 (Borders)
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'bounce-in': 'bounce-in 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        slideUp: {
          'from': {
            transform: 'translateY(10px)',
            opacity: '0',
          },
          'to': {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
        'slide-in-right': {
          'from': {
            transform: 'translateX(100%)',
            opacity: '0',
          },
          'to': {
            transform: 'translateX(0)',
            opacity: '1',
          },
        },
        'scale-in': {
          'from': {
            transform: 'scale(0.9)',
            opacity: '0',
          },
          'to': {
            transform: 'scale(1)',
            opacity: '1',
          },
        },
        'bounce-in': {
          '0%': {
            transform: 'scale(0.3)',
            opacity: '0',
          },
          '50%': {
            transform: 'scale(1.05)',
          },
          '70%': {
            transform: 'scale(0.9)',
          },
          '100%': {
            transform: 'scale(1)',
            opacity: '1',
          },
        },
      },
    },
  },
  plugins: [],
}