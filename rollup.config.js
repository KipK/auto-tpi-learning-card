import terser from '@rollup/plugin-terser';
import gzipPlugin from 'rollup-plugin-gzip';

export default {
  input: 'src/auto-tpi-learning-card.js',
  output: {
    file: 'dist/auto-tpi-learning-card.js',
    format: 'es',
  },
  // Treat the CDN import as external to prevent Rollup from trying to resolve it
  external: ['https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js'],
  plugins: [
    terser(),
    gzipPlugin()
  ]
};