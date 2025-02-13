import { type Options } from 'tsup'

const commonConfig: Options = {
  dts: true,
  minify: false,
  treeshake: true,
  external: [/^virtual:.*/],
}

export const tsup = (): Options[] => [
  {
    ...commonConfig,
    entry: {
      'client/index': 'src/client/index.ts',
    },
    target: 'es2015',
    format: ['esm', 'cjs'],
    platform: 'browser',
    injectStyle: true,
    splitting: false,
    external: [...(commonConfig.external || []), /^vite-plugin-prerelease\/client/],
  },
  {
    ...commonConfig,
    entry: {
      index: 'src/node/index.ts',
      server: 'src/node/server.ts',
    },
    platform: 'node',
    target: 'node16',
    format: ['esm', 'cjs'],
  },
]
