import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import gzipPlugin from 'rollup-plugin-gzip';

export default {
  input: 'src/auto-tpi-learning-card.js',
  output: {
    file: 'dist/auto-tpi-learning-card.js',
    format: 'es',
  },
  plugins: [
    nodeResolve(),
    terser(),
    gzipPlugin()
  ]
};