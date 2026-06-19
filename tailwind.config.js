const {colors} = require('tailwindcss/defaultTheme')

/*
 |--------------------------------------------------------------------------
 | LaraDesk Design Tokens (Phase 0 - UI Upgrade)
 |--------------------------------------------------------------------------
 | Central source of truth for brand colors, typography, spacing, radius
 | and shadows. Prefer these tokens (e.g. `bg-primary-600`, `shadow-card`,
 | `rounded-xl`) over hard-coded values when restyling components.
 |
 | Breakpoints (Tailwind defaults, documented for the team):
 |   sm  >= 640px   small tablets / large phones (landscape)
 |   md  >= 768px   tablets
 |   lg  >= 1024px  small laptops
 |   xl  >= 1280px  desktops
 | Design mobile-first: base styles target phones, layer sm:/md:/lg: up.
 */

module.exports = {
    purge: [
        './resources/js/**/*.vue',
        './resources/sass/**/*.scss',
        './resources/views/**/*.blade.php',
    ],
    theme: {
        colors: {
            ...colors,
            // Brand / primary scale — used for primary actions, links, active states.
            primary: {
                50: '#eff6ff',
                100: '#dbeafe',
                200: '#bfdbfe',
                300: '#93c5fd',
                400: '#60a5fa',
                500: '#3b82f6',
                600: '#2563eb',
                700: '#1d4ed8',
                800: '#1e40af',
                900: '#1e3a8a',
            },
        },
        extend: {
            fontFamily: {
                // Inter for Latin, Noto Sans Thai for Thai glyphs, then system fallbacks.
                sans: [
                    'Inter',
                    'Noto Sans Thai',
                    'ui-sans-serif',
                    'system-ui',
                    '-apple-system',
                    'Segoe UI',
                    'Roboto',
                    'Helvetica Neue',
                    'Arial',
                    'sans-serif',
                ],
            },
            borderRadius: {
                xl: '0.75rem',
                '2xl': '1rem',
                '3xl': '1.5rem',
            },
            boxShadow: {
                card: '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px 0 rgba(15, 23, 42, 0.04)',
                'card-hover': '0 8px 24px -6px rgba(15, 23, 42, 0.12), 0 4px 8px -4px rgba(15, 23, 42, 0.06)',
                soft: '0 2px 8px rgba(15, 23, 42, 0.06)',
            },
            spacing: {
                18: '4.5rem',
                72: '18rem',
                80: '20rem',
                88: '22rem',
            },
            maxWidth: {
                '8xl': '88rem',
            },
        },
    },
    variants: {},
    plugins: [
        require('@tailwindcss/ui'),
        require('@tailwindcss/custom-forms'),
    ],
    future: {
        purgeLayersByDefault: true,
        removeDeprecatedGapUtilities: true,
    },
}
