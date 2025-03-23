import type { Config } from "tailwindcss";

const config = {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx,rb,erb,html}",
		"./app/views/**/*.{erb,html,rb}",
		"./src/**/*.{ts,tsx}",
		"./*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '1rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				"retro-purple": "#9b87f5",
				"retro-cream": "#F5F1E8",
				"retro-orange": "#FF9D6C",
				"retro-teal": "#83D1C4",
				"retro-pink": "#FFAFC5",
				"terminal-black": "#121212",
				"terminal-dark": "#1a1a1a",
				"terminal-gray": "#2a2a2a",
				"terminal-text": "#d0d0d0",
				"terminal-success": "#0f9d58",
				"terminal-error": "#db4437",
				"terminal-warning": "#f4b400",
				"neon-green": "#39ff14",
				"neon-purple": "#bc13fe",
				"neon-blue": "#0ff0fc",
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				'pixel': ['"Press Start 2P"', 'cursive'],
				'sans': ['"Inter"', 'sans-serif'],
				'mono': ['"JetBrains Mono"', 'monospace'],
				'code': ['"Fira Code"', 'monospace'],
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
				'pulse-subtle': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.85' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'shimmer': {
					'0%': { backgroundPosition: '-500px 0' },
					'100%': { backgroundPosition: '500px 0' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'scale-up': {
					'0%': { transform: 'scale(0.97)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'blink': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0' }
				},
				'retro-load': {
					'0%': { width: '0%' },
					'100%': { width: '100%' }
				},
				'matrix-drop': {
					'0%': { transform: 'translateY(-100%)', opacity: '1' },
					'100%': { transform: 'translateY(100%)', opacity: '0' }
				},
				'server-pulse': {
					'0%, 100%': { opacity: '1', boxShadow: '0 0 5px currentColor' },
					'50%': { opacity: '0.6', boxShadow: '0 0 10px currentColor' }
				},
				'glitch-horizontal': {
					'0%': { transform: 'translateX(-2px)' },
					'25%': { transform: 'translateX(2px)' },
					'50%': { transform: 'translateX(-1px)' },
					'75%': { transform: 'translateX(1px)' },
					'100%': { transform: 'translateX(0)' }
				},
				'loading-bar': {
					'0%': { width: '0%' },
					'100%': { width: '100%' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-subtle': 'pulse-subtle 3s ease-in-out infinite',
				'float': 'float 6s ease-in-out infinite',
				'shimmer': 'shimmer 3s linear infinite',
				'slide-up': 'slide-up 0.3s ease-out',
				'fade-in': 'fade-in 0.4s ease-out',
				'scale-up': 'scale-up 0.3s ease-out',
				'blink': 'blink 1s step-end infinite',
				'retro-load': 'retro-load 1s ease-out',
				'matrix-drop': 'matrix-drop 2s linear infinite',
				'server-pulse': 'server-pulse 2s ease-in-out infinite',
				'glitch-horizontal': 'glitch-horizontal 0.3s ease-in-out',
				'loading-bar': 'loading-bar 2s ease-out forwards',
				'page-transition': 'fade-in 0.5s ease-out, scale-up 0.5s ease-out'
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'retro-gradient': 'linear-gradient(135deg, #9b87f5 0%, #F5F1E8 100%)',
				'shimmer-gradient': 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)',
				'cyber-gradient': 'linear-gradient(135deg, #bc13fe 0%, #0ff0fc 100%)',
				'terminal-gradient': 'linear-gradient(180deg, #1a1a1a 0%, #121212 100%)',
				'matrix-pattern': 'linear-gradient(rgba(0, 255, 70, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 70, 0.15) 1px, transparent 1px)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
module.exports = config;