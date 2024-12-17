import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import {nodePolyfills} from 'vite-plugin-node-polyfills';
import commonjs from 'vite-plugin-commonjs';


export default defineConfig({
  plugins: [solid(), commonjs()],
  resolve: {
    alias: {
      events: 'rollup-plugin-node-polyfills/polyfills/events.js',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
        }),
        NodeModulesPolyfillPlugin(),
      ],
    },
  },
});
