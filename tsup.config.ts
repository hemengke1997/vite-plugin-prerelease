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
    ...commonConfig(option),
    entry: {
      index: 'src/node/index.ts',
    },
    platform: 'node',
    target: 'node16',
    format: ['esm', 'cjs'],
  },
  {
    entry: ['src/client/**/*.{ts,tsx,css}'],
    dts: !option.watch,
    target: 'es2015',
    format: 'esm',
    outDir: 'dist/client',
    platform: 'browser',
    ...bundleless(),
  },
])
