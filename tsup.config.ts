import { defineConfig, type Options } from 'tsup'
import { bundleless } from 'tsup-plugin-bundleless'

const commonConfig = (option: Options): Options => {
  return {
    dts: true,
    clean: !option.watch,
    minify: false,
    sourcemap: !!option.watch,
    treeshake: true,
    external: [/^virtual:.*/, /vite/],
  }
}

export const tsup = defineConfig((option) => [
  {
    entry: ['src/client/**/*.{ts,tsx,css}'],
    dts: true,
    target: 'es2015',
    format: 'esm',
    outDir: 'dist/client',
    platform: 'browser',
    ...bundleless(),
  },
  {
    ...commonConfig(option),
    entry: {
      'index': 'src/node/index.ts',
      'remix': 'src/node/remix/index.ts',
      'remix/client': 'src/node/remix/client.tsx',
    },
    platform: 'node',
    target: 'node16',
    format: ['esm', 'cjs'],
    external: ['vite-plugin-prerelease/client'],
  },
])
