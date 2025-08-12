import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import endormoon from 'eslint-config-endormoon';

export default defineConfig([
  { 
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'], 
    languageOptions: { 
      globals: globals.node,
    },
    extends: [
      endormoon,
    ],
  },
  tseslint.configs.recommended,
]);
