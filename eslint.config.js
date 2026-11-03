// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

/** Anything that can differ between JS engines or between runs is banned from the engine. */
const ENGINE_BANNED_MATH = ['random', 'sin', 'cos', 'tan', 'atan', 'atan2', 'exp', 'log', 'pow', 'hypot', 'cbrt', 'expm1', 'log1p', 'log2', 'log10', 'sinh', 'cosh', 'tanh', 'asin', 'acos'];

export default tseslint.config(
  { ignores: ['**/dist/**', '**/dev-dist/**', '**/node_modules/**', 'coverage/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-constant-condition': ['error', { checkLoops: false }],
    },
  },
  {
    files: ['packages/engine/src/**/*.ts'],
    rules: {
      'no-restricted-properties': [
        'error',
        ...ENGINE_BANNED_MATH.map((property) => ({ object: 'Math', property, message: 'Not bit-identical across JS engines (or not seeded). Use detmath.ts / rng.ts.' })),
        { object: 'Date', property: 'now', message: 'Engine must not read wall-clock time.' },
        { object: 'performance', property: 'now', message: 'Engine must not read wall-clock time.' },
      ],
      'no-restricted-globals': [
        'error',
        { name: 'Date', message: 'Engine must not read wall-clock time.' },
        { name: 'setTimeout', message: 'Engine is stepped by the host, never by timers.' },
        { name: 'setInterval', message: 'Engine is stepped by the host, never by timers.' },
        { name: 'performance', message: 'Engine must not read wall-clock time.' },
        { name: 'crypto', message: 'Use the seeded RNG.' },
      ],
    },
  },
);
