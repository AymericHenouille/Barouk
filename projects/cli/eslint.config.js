import globals from 'globals';
import tseslint from 'typescript-eslint';
import endormoon from 'eslint-config-endormoon';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  { 
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'], 
    languageOptions: { globals: globals.node },
  },
  tseslint.configs.recommended,
  endormoon,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]);
