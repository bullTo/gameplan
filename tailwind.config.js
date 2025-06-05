/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from 'tailwindcss-animate';

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			'almost-black': '#1B1C25',
  			'dark-green': '#072730',
  			'bright-teal': '#0EADAB',
  			'teal-green': '#088280',
  			'dark-overlay': 'rgba(18, 19, 28, 0.5)',
  			'light-teal': 'rgba(14, 173, 171, 0.2)',
  			'dark-grey': '#4E4E50',
  			'light-grey': '#A1A1A2',
  			'accent-red': '#D03E35',
  			'accent-green': '#4CAF50',
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		fontFamily: {
  			poppins: [
  				'Poppins',
  				'sans-serif'
  			]
  		},
  		fontSize: {
  			'display-xl': [
  				'3.75rem',
  				{
  					lineHeight: '120%',
  					letterSpacing: '-1.2px'
  				}
  			],
  			'display-lg': [
  				'3.5rem',
  				{
  					lineHeight: '120%',
  					letterSpacing: '-1px'
  				}
  			],
  			'display-md': [
  				'2.75rem',
  				{
  					lineHeight: '135%',
  					letterSpacing: '-0.4px'
  				}
  			],
  			'display-sm': [
  				'2.25rem',
  				{
  					lineHeight: '140%',
  					letterSpacing: '0.2px'
  				}
  			],
  			'headline-lg': [
  				'2rem',
  				{
  					lineHeight: '145%',
  					letterSpacing: '0.4px'
  				}
  			],
  			'headline-md': [
  				'1.75rem',
  				{
  					lineHeight: '145%',
  					letterSpacing: '0.6px'
  				}
  			],
  			'headline-sm': [
  				'1.5rem',
  				{
  					lineHeight: '150%',
  					letterSpacing: '0.8px'
  				}
  			],
  			'title-lg': [
  				'1.25rem',
  				{
  					lineHeight: '160%',
  					letterSpacing: '1px'
  				}
  			],
  			'title-md': [
  				'1.125rem',
  				{
  					lineHeight: '160%',
  					letterSpacing: '1.2px'
  				}
  			],
  			'title-sm': [
  				'1rem',
  				{
  					lineHeight: '160%',
  					letterSpacing: '1.4px'
  				}
  			],
  			'button-lg': [
  				'1rem',
  				{
  					lineHeight: '160%',
  					letterSpacing: '1.4px'
  				}
  			],
  			'button-md': [
  				'0.875rem',
  				{
  					lineHeight: '170%',
  					letterSpacing: '1.2px'
  				}
  			],
  			'button-sm': [
  				'0.75rem',
  				{
  					lineHeight: '175%',
  					letterSpacing: '0.2px'
  				}
  			],
  			'body-lg': [
  				'1rem',
  				{
  					lineHeight: '160%',
  					letterSpacing: '1.4px'
  				}
  			],
  			'body-md': [
  				'0.875rem',
  				{
  					lineHeight: '170%',
  					letterSpacing: '0.6px'
  				}
  			],
  			'body-sm': [
  				'0.75rem',
  				{
  					lineHeight: '175%',
  					letterSpacing: '1.8px'
  				}
  			],
  			'body-xs': [
  				'0.625rem',
  				{
  					lineHeight: '180%',
  					letterSpacing: '2px'
  				}
  			]
  		},
  		borderRadius: {
  			lg: '0.5rem',
  			md: '0.375rem',
  			sm: '0.25rem'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: 0
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: 0
  				}
  			},
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [tailwindcssAnimate],
}
