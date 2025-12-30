/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Puedes cambiar esta paleta por cualquiera de las opciones en PALETAS-COLORES-PROFESIONALES.md
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',  // Azul principal
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        accent: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',  // Teal de acento
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        neutral: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        }
      },
      fontFamily: {
        // FUENTES MODERNAS 2024-2025
        // Opción Recomendada: DM Sans + Fraunces
        display: ['DM Sans', 'system-ui', 'sans-serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],

        // ALTERNATIVAS (descomentar la que prefieras):

        // Opción 2: Lato + Merriweather (Probada y confiable)
        // display: ['Lato', 'system-ui', 'sans-serif'],
        // sans: ['Lato', 'system-ui', 'sans-serif'],
        // serif: ['Merriweather', 'Georgia', 'serif'],

        // Opción 3: Manrope + Crimson Pro (Sofisticada)
        // display: ['Manrope', 'system-ui', 'sans-serif'],
        // sans: ['Manrope', 'system-ui', 'sans-serif'],
        // serif: ['Crimson Pro', 'Georgia', 'serif'],

        // Opción 4: Poppins + Lora (Cálida y moderna)
        // display: ['Poppins', 'system-ui', 'sans-serif'],
        // sans: ['Poppins', 'system-ui', 'sans-serif'],
        // serif: ['Lora', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in',
        'slide-up': 'slideUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}