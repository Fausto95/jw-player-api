import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import {uglify} from 'rollup-plugin-uglify';
import minify from 'rollup-plugin-babel-minify';

const getPlugins = env => {
  const plugins = [resolve(), commonjs()];
  if (env) {
    plugins.push(
      replace({
        'process.env.NODE_ENV': JSON.stringify(env)
      })
    );
  }
  plugins.push(
    babel({
      exclude: 'node_modules/**',
      babelrc: false,
      presets: [
        [
          '@babel/preset-env',
          {
            loose: true,
            modules: false,
            targets: '> 0.25%, not dead'
          }
        ]
      ],
      plugins: [
        [
          '@babel/plugin-transform-runtime',
          {
            helpers: false,
            regenerator: true
          }
        ]
      ]
    })
  );
  if (env === 'production') plugins.push(minify());
  return plugins;
};
const config = {
  input: 'index.js',
  output: {
    globals: {
      react: 'React'
    }
  },
  external: ['react'],
  plugins: getPlugins(process.env.BUILD_ENV)
};
module.exports = config;
