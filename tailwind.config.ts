import { type Config } from 'tailwindcss'

export default {
  content: ['./src/client/**/*.{ts,tsx}'],
  prefix: 'pw-', // Prerelease Widget
  corePlugins: {
    preflight: false,
  },
  important: '#__prerelease_widget',
} as Config
