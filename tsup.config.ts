import { type Options } from 'tsup'
import pkg from './package.json'

const commonConfig: Options = {
  dts: true,
  minify: false,
  treeshake: true,
  external: [/^virtual:.*/],
}

const client: Options = {
  ...commonConfig,
  entry: {
    'client/index': 'src/client/index.ts',
  },
  target: 'es2015',
  format: ['esm', 'cjs'],
  platform: 'browser',
  injectStyle: true,
  splitting: false,
  external: [...(commonConfig.external || []), /^vite-plugin-prerelease\/client/, ...Object.keys(pkg.dependencies)],
}

const node: Options = {
  ...commonConfig,
  entry: {
    index: 'src/node/index.ts',
    server: 'src/node/server.ts',
    astro: 'src/node/astro/index.ts',
  },
  platform: 'node',
  target: 'node16',
  format: ['esm', 'cjs'],
}

export const tsup = (): Options[] => [client, node]
