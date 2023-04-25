const defaultTheme = require('tailwindcss/defaultTheme')
const plugin = require('tailwindcss/plugin')
const svgToMiniDataURI = require('mini-svg-data-uri')
const textStyles = require('./config/textStyles.json')
const chroma = require('chroma.ts')

function withOpacityValue(variable) {
    return ({ opacityValue }) => `rgb(var(${variable}) / ${opacityValue ?? 1})`
}

function createStyles(prefix, object) {
    let components = {}
    Object.entries(object).forEach(([key, value]) => {
        if (['inherit', 'currentColor', 'transparent'].includes(value)) return
        if (typeof value === 'object') {
            components = {
                ...components,
                ...createStyles(
                    (subKey) =>
                        subKey === 'DEFAULT'
                            ? prefix(key)
                            : `${prefix(key)}-${subKey}`,
                    value
                ),
            }
        } else {
            const backgroundColor =
                typeof value === 'function' ? value(1) : value
            let darkScale = ['tertiary'].includes(key) ? 900 : 100
            try {
                if (
                    chroma.color(backgroundColor).textColor().equals('#ffffff')
                ) {
                    darkScale = 100
                } else darkScale = 900
            } catch (error) {}
            const color = `rgb(var(--color-dark-scale-${darkScale}))`
            let contrastColor = backgroundColor
            if (
                ['primary', 'secondary', 'tertiary'].find((item) =>
                    prefix(key).includes(item)
                )
            ) {
                contrastColor = color
            }
            components = {
                ...components,
                [prefix(key)]: {
                    backgroundColor,
                    color,
                    '&.btn-outline': {
                        backgroundColor: 'transparent',
                        color: contrastColor,
                        border: `1px solid ${backgroundColor}`,
                    },
                    '&.btn-outline:disabled': {
                        background: 'none',
                        border: `1px solid ${backgroundColor}`,
                    },
                    '&.btn-outline:hover:not(:disabled)': {
                        backgroundColor,
                        color,
                        border: `1px solid ${backgroundColor}`,
                    },
                },
            }
        }
    })
    return components
}

module.exports = {
    // important: [ '#root', '#popup' ],
    // important: true,
    darkMode: 'class',
    content: ['./src/**/*.{js,jsx,ts,tsx}', './index.html'],
    theme: {
        extend: {
            screens: {
                extension: '400px',
            },
            container: {
                padding: {
                    DEFAULT: '2rem',
                },
            },
            fontFamily: {
                sans: ['lato', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                primary: {
                    DEFAULT: withOpacityValue('--color-primary-500'), // #716EFF
                    500: withOpacityValue('--color-primary-500'), // #716EFF
                    300: 'rgba(var(--color-primary-300))', // #9E01FF;
                    200: withOpacityValue('--color-primary-200'), // #C172FF
                    100: withOpacityValue('--color-primary-100'), // #CED6FF
                },
                secondary: withOpacityValue('--color-secondary'), // #0E1F4D
                tertiary: withOpacityValue('--color-dark-scale-100'), // #FFFFFF
                active: withOpacityValue('--color-active'), // #6EFFCB
                text: withOpacityValue('--color-text'), // #5F6881
                error: withOpacityValue('--color-error'), // #FF5C6F
                'info-light': 'rgba(var(--color-info-light))', // #DDF3FF;

                status: {
                    send: withOpacityValue('--color-status-send'), // #FF58BC
                    receive: withOpacityValue('--color-status-receive'), // #00C7CC
                    contract: withOpacityValue('--color-status-contract'), // #716EFF
                    pending: 'rgba(var(--color-status-pending))', // #000000
                    cancel: withOpacityValue('--color-status-cancel'), // #45445A
                    offer: withOpacityValue('--color-primary-500'), // #716EFF
                },
                'dark-scale': {
                    900: withOpacityValue('--color-dark-scale-900'), // #000000
                    100: withOpacityValue('--color-dark-scale-100'), // #FFFFFF
                },
                skeleton: 'rgba(var(--color-skeleton))', // #5F6881
            },
            backgroundImage: {
                main: 'url("/images/bg/main.svg")',
                landing: 'url("/images/bg/landing.png")',
                welcome: 'url("/images/bg/welcome.png")',
                close: 'url("/images/icons/close.svg")',
                checked: `url("${svgToMiniDataURI(`<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.20833 0.5C1.71256 0.5 0.5 1.71257 0.5 3.20833V12.7917C0.5 14.2874 1.71257 15.5 3.20833 15.5H12.7917C14.2874 15.5 15.5 14.2874 15.5 12.7917V3.20833C15.5 1.71256 14.2874 0.5 12.7917 0.5H3.20833ZM11.5668 6.15028L7.40017 10.3167C7.15608 10.5608 6.76033 10.5608 6.51633 10.3167L4.84647 8.64692C4.60239 8.40283 4.60239 8.00708 4.84647 7.76308C5.09054 7.519 5.48627 7.519 5.73035 7.76308L6.95825 8.99092L10.683 5.26638C10.9271 5.02231 11.3227 5.02232 11.5668 5.2664C11.8109 5.51048 11.8109 5.90622 11.5668 6.15028Z" fill="#6EFFCB"/>
                    </svg>                    
                `)}")`,
                loading: 'url("/images/bg/loading.png")',
            },
            dropShadow: {
                'asset-logo': '0px 0px 12px #716EFF',
            },
        },
    },
    plugins: [
        plugin(function ({ addVariant }) {
            addVariant('child', '& > *')
            addVariant('recursively', '& *')
        }),
        plugin(function ({ addUtilities, theme, e }) {
            const utilities = textStyles.map(
                ({ key, fontWeight, fontSize }) => ({
                    [`.${e(`text-${key}`)}`]: {
                        fontSize,
                        fontWeight: theme('fontWeight')[fontWeight],
                        lineHeight: 1.2,
                    },
                })
            )
            addUtilities(utilities)
        }),
        plugin(function ({ addComponents, theme, e }) {
            const components = createStyles(
                (key) => `.${e(`btn-${key}`)}`,
                theme('colors')
            )
            addComponents(components)
        }),
    ],
}
