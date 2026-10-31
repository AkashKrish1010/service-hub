/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A6BFF',
          hover: '#1254CC',
          50: '#EFF6FF',
          100: '#DBEAFE',
          600: '#1254CC',
          700: '#0E44AB',
        },
        accent: {
          DEFAULT: '#FF6B2B',
          hover: '#E55A1D',
          50: '#FFF7ED',
          100: '#FFEDD5',
          600: '#E55A1D',
        },
        surface: '#FFFFFF',
        canvas: '#F7F8FA',
        borderSubtle: '#E5E7EB',
        textMain: '#0D0D0D',
        textMuted: '#6B7280',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(13, 13, 13, 0.05)',
        cardHover: '0 10px 25px -5px rgba(26, 107, 255, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        floating: '0 12px 32px rgba(13, 13, 13, 0.12)',
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
      }
    },
  },
  plugins: [],
}
