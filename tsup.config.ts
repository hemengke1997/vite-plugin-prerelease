import { type Options } from 'tsup'

const commonConfig = (option: Options): Options => {
  return {
    dts: true,
    minify: false,
    sourcemap: !!option.watch,
    treeshake: true,
    external: [/^virtual:.*/, /vite/],
  }
}

export const tsup = (option: Options): Options[] => [
  {
    ...commonConfig(option),
    entry: {
      'client/index': 'src/client/index.ts',
    },
    target: 'es2015',
    format: 'esm',
    platform: 'browser',
    injectStyle: true,
    splitting: false,
  },
  {
    ...commonConfig(option),
    entry: {
      'index': 'src/node/index.ts',
      'remix': 'src/node/remix/index.ts',
      'remix/client': 'src/node/remix/client.tsx',
      'remix/server': 'src/node/remix/server.ts',
    },
    platform: 'node',
    target: 'node16',
    format: ['esm', 'cjs'],
    external: [/^virtual:.*/, 'vite-plugin-prerelease/client'],
  },
]
