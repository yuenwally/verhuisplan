import stylistic from '@stylistic/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import importPlugin from 'eslint-plugin-import';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      '@stylistic': stylistic,
      'react-hooks': reactHooksPlugin,
      react: reactPlugin,
      import: importPlugin,
    },
    rules: {
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],

      '@stylistic/semi': ['error', 'always'],

      '@stylistic/no-extra-semi': 'error',

      '@stylistic/operator-linebreak': ['error', 'before', { overrides: { '=': 'after' } }],

      '@stylistic/eol-last': ['error', 'always'],

      '@stylistic/space-in-parens': ['error', 'never'],

      '@stylistic/object-curly-newline': ['error', { 'consistent': true }],

      '@stylistic/object-curly-spacing': ['error', 'always'],

      '@stylistic/array-bracket-spacing': ['error', 'never'],

      '@stylistic/function-call-spacing': ['error', 'never'],

      '@stylistic/no-multi-spaces': 'error',

      '@stylistic/no-trailing-spaces': 'error',

      '@stylistic/comma-dangle': ['error', 'always-multiline'],

      '@stylistic/arrow-parens': ['error', 'always'],

      '@stylistic/arrow-spacing': 'error',

      '@stylistic/block-spacing': 'error',

      '@stylistic/member-delimiter-style': 'error',

      '@stylistic/type-named-tuple-spacing': ['error'],

      '@stylistic/type-generic-spacing': ['error'],

      '@stylistic/type-annotation-spacing': 'error',

      '@stylistic/brace-style': ['error', '1tbs', { 'allowSingleLine': false }],

      '@stylistic/indent': ['error', 2],

      'curly': ['error', 'all'],

      'react-refresh/only-export-components': 'off',

      'react-hooks/exhaustive-deps': 'off',

      'import/no-unresolved': 'error',

      'import/no-named-as-default-member': 'off',

      'import/no-cycle': ['error', { 'maxDepth': Infinity }],

      '@stylistic/max-len': ['error', {
        'ignoreTrailingComments': true,
        'tabWidth': 2,
        'code': 100,
        'ignoreUrls': true,
        'ignoreStrings': true,
        'ignoreRegExpLiterals': true,
        'ignoreTemplateLiterals': true,
      }],

      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
            'type',
          ],
          'newlines-between': 'never',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],

      '@stylistic/padding-line-between-statements': ['error',
        {
          blankLine: 'always',
          prev: 'if',
          next: '*',
        },
        {
          blankLine: 'always',
          prev: '*',
          next: 'if',
        },
      ],

      '@stylistic/no-mixed-operators': [
        'error',
        {
          'groups': [
            ['&&', '||'],
          ],
          'allowSamePrecedence': false,
        },
      ],
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
