import { Config } from '@stencil/core';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import { sass } from '@stencil/sass';

export const config: Config = {
  namespace: 'helix-grv-nextgen-canvas',
  enableCache: true,
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
      copy: [
        { src: 'global.scss' },
        { src: 'assets', dest: '../assets' },
      ]
    },
    {
      type: 'docs-readme'
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
      copy: [
        { src: 'assets' },
      ]
    }
  ],
  plugins: [
    nodePolyfills(),
    sass({
      includePaths: ['./node_modules'],
      injectGlobalPaths: [
      ]
    }),
  ],
  globalStyle: 'src/global.scss',
  globalScript: 'src/global.ts',
};
