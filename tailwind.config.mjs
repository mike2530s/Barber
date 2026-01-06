/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    darkMode: 'class',
    theme: {
        extend: {
            container: {
                center: true,
                padding: {
                    DEFAULT: '1rem',
                    sm: '2rem',
                    lg: '4rem',
                    xl: '5rem',
                    '2xl': '6rem',
                },
            },
            colors: {
                // Paleta personalizada para barbería elegante
                primary: {
                    DEFAULT: '#D4AF37',
                    light: '#E5C158',
                    dark: '#C19B2A',
                },
                barber: {
                    gold: '#D4AF37',
                    'gold-light': '#E5C158',
                    dark: '#1a1a1a',
                    darker: '#0f0f0f',
                    gray: '#2a2a2a',
                },
            },
            fontFamily: {
                'display': ['Playfair Display', 'serif'],
                'sans': ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'glow': 'glow 2s ease-in-out infinite alternate',
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
                glow: {
                    '0%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)' },
                    '100%': { boxShadow: '0 0 40px rgba(212, 175, 55, 0.6)' },
                },
            },
        },
    },
    plugins: [require('daisyui')],
    daisyui: {
        themes: [
            {
                dark: {
                    ...require("daisyui/src/theming/themes")["dark"],
                    primary: "#D4AF37",
                    "primary-content": "#1a1a1a",
                    secondary: "#E5C158",
                    accent: "#C19B2A",
                    neutral: "#2a2a2a",
                    "base-100": "#1a1a1a",
                    "base-200": "#0f0f0f",
                    "base-300": "#2a2a2a",
                },
            },
        ],
        darkTheme: "dark",
        base: true,
        styled: true,
        utils: true,
    },
}
