/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
        extend: {
                borderRadius: {
                        lg: 'var(--radius)',
                        md: 'calc(var(--radius) - 2px)',
                        sm: 'calc(var(--radius) - 4px)'
                },
                fontFamily: {
                        heading: ['"DM Serif Display"', 'serif'],
                        body: ['"Outfit"', 'sans-serif'],
                },
                colors: {
                        spine: {
                                50: '#eef8ff',
                                100: '#d8eeff',
                                200: '#b9e1ff',
                                300: '#89cfff',
                                400: '#51b3ff',
                                500: '#2991ff',
                                600: '#0ea5e9',
                                700: '#0b7cc4',
                                800: '#10659f',
                                900: '#13547d',
                        },
                        mint: {
                                50: '#ecfdf5',
                                100: '#d1fae5',
                                200: '#a7f3d0',
                                300: '#6ee7b7',
                                400: '#34d399',
                                500: '#10b981',
                                600: '#059669',
                                700: '#047857',
                                800: '#065f46',
                                900: '#064e3b',
                        },
                        warn: {
                                400: '#fbbf24',
                                500: '#f59e0b',
                                600: '#d97706',
                        },
                        dark: '#0c1222',
                        'dark-card': '#131b2e',
                        'dark-surface': '#1a2540',
                        background: 'hsl(var(--background))',
                        foreground: 'hsl(var(--foreground))',
                        card: {
                                DEFAULT: 'hsl(var(--card))',
                                foreground: 'hsl(var(--card-foreground))'
                        },
                        popover: {
                                DEFAULT: 'hsl(var(--popover))',
                                foreground: 'hsl(var(--popover-foreground))'
                        },
                        primary: {
                                DEFAULT: 'hsl(var(--primary))',
                                foreground: 'hsl(var(--primary-foreground))'
                        },
                        secondary: {
                                DEFAULT: 'hsl(var(--secondary))',
                                foreground: 'hsl(var(--secondary-foreground))'
                        },
                        muted: {
                                DEFAULT: 'hsl(var(--muted))',
                                foreground: 'hsl(var(--muted-foreground))'
                        },
                        accent: {
                                DEFAULT: 'hsl(var(--accent))',
                                foreground: 'hsl(var(--accent-foreground))'
                        },
                        destructive: {
                                DEFAULT: 'hsl(var(--destructive))',
                                foreground: 'hsl(var(--destructive-foreground))'
                        },
                        border: 'hsl(var(--border))',
                        input: 'hsl(var(--input))',
                        ring: 'hsl(var(--ring))',
                        chart: {
                                '1': 'hsl(var(--chart-1))',
                                '2': 'hsl(var(--chart-2))',
                                '3': 'hsl(var(--chart-3))',
                                '4': 'hsl(var(--chart-4))',
                                '5': 'hsl(var(--chart-5))'
                        }
                },
                keyframes: {
                        'accordion-down': {
                                from: { height: '0' },
                                to: { height: 'var(--radix-accordion-content-height)' }
                        },
                        'accordion-up': {
                                from: { height: 'var(--radix-accordion-content-height)' },
                                to: { height: '0' }
                        },
                        'float': {
                                '0%, 100%': { transform: 'translateY(0px)' },
                                '50%': { transform: 'translateY(-20px)' },
                        },
                        'float-slow': {
                                '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                                '50%': { transform: 'translateY(-30px) rotate(5deg)' },
                        },
                        'pulse-glow': {
                                '0%, 100%': { boxShadow: '0 0 20px rgba(14, 165, 233, 0.3)' },
                                '50%': { boxShadow: '0 0 40px rgba(14, 165, 233, 0.6)' },
                        },
                        'slide-up': {
                                '0%': { transform: 'translateY(60px)', opacity: '0' },
                                '100%': { transform: 'translateY(0)', opacity: '1' },
                        },
                        'slide-down': {
                                '0%': { transform: 'translateY(-40px)', opacity: '0' },
                                '100%': { transform: 'translateY(0)', opacity: '1' },
                        },
                        'slide-left': {
                                '0%': { transform: 'translateX(60px)', opacity: '0' },
                                '100%': { transform: 'translateX(0)', opacity: '1' },
                        },
                        'slide-right': {
                                '0%': { transform: 'translateX(-60px)', opacity: '0' },
                                '100%': { transform: 'translateX(0)', opacity: '1' },
                        },
                        'fade-in': {
                                '0%': { opacity: '0' },
                                '100%': { opacity: '1' },
                        },
                        'scale-in': {
                                '0%': { transform: 'scale(0.8)', opacity: '0' },
                                '100%': { transform: 'scale(1)', opacity: '1' },
                        },
                        'spin-slow': {
                                '0%': { transform: 'rotate(0deg)' },
                                '100%': { transform: 'rotate(360deg)' },
                        },
                        'morph': {
                                '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
                                '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
                        },
                        'ripple': {
                                '0%': { transform: 'scale(0)', opacity: '0.6' },
                                '100%': { transform: 'scale(4)', opacity: '0' },
                        },
                },
                animation: {
                        'accordion-down': 'accordion-down 0.2s ease-out',
                        'accordion-up': 'accordion-up 0.2s ease-out',
                        'float': 'float 3s ease-in-out infinite',
                        'float-slow': 'float-slow 6s ease-in-out infinite',
                        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
                        'slide-up': 'slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                        'slide-down': 'slide-down 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                        'slide-left': 'slide-left 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                        'slide-right': 'slide-right 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                        'fade-in': 'fade-in 1s ease-out',
                        'scale-in': 'scale-in 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                        'spin-slow': 'spin-slow 12s linear infinite',
                        'morph': 'morph 8s ease-in-out infinite',
                        'ripple': 'ripple 0.6s linear',
                }
        }
  },
  plugins: [require("tailwindcss-animate")],
};
