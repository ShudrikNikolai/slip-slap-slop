// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
      ignores: ['eslint.config.mjs'],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    eslintPluginPrettierRecommended,
    {
      languageOptions: {
        globals: {
          ...globals.node,
          ...globals.jest,
        },
        sourceType: 'commonjs',
        parserOptions: {
          projectService: true,
          tsconfigRootDir: import.meta.dirname,
        },
      },
    },
    {
      rules: {
        '@typescript-eslint/no-floating-promises': 'warn',
        '@typescript-eslint/no-unsafe-argument': 'warn',
        '@typescript-eslint/unbound-method': 'error',
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'prettier/prettier': ['error', { endOfLine: 'auto' }],
        'class-methods-use-this': 0,
        'default-param-last': 0,

        // # Possible Errors
        'arrow-parens': [2, 'as-needed'],

        // # Best Practices
        curly: [
          2,
          'all',
        ],
        'dot-notation': 1,
        'no-multi-spaces': [
          2,
          {
            exceptions: {
              VariableDeclarator: true,
            },
          },
        ],
        'no-unmodified-loop-condition': 2,
        'no-useless-call': 'error',
        'no-undef-init': 'error',

        // # Node.js
        'callback-return': 2,
        'global-require': 2,
        'handle-callback-err': 2,
        'no-mixed-requires': [
          2,
          {
            grouping: true,
            allowCall: false,
          },
        ],
        'no-new-require': 2,
        'no-path-concat': 2,
        'no-sync': 2,

        // # Styling Issues
        'brace-style': [
          1,
          '1tbs',
        ],
        camelcase: 0,
        'linebreak-style': 2,
        'max-depth': [
          1,
          4,
        ],
        'padding-line-between-statements': [
          'error',
          { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
          { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
        ],
        'newline-before-return': 2,
        'max-len': [
          1,
          120,
        ],
        'max-nested-callbacks': [
          1,
          3,
        ],
        'max-params': [
          1,
          {
            max: 5,
          },
        ],
        'max-statements': [
          1,
          {
            max: 15,
          },
        ],
        'max-statements-per-line': [
          1,
          {
            max: 1,
          },
        ],
        'no-underscore-dangle': 0,
        'no-restricted-syntax': [
          2,
          'DebuggerStatement',
          'LabeledStatement',
          'WithStatement',
        ],
        'operator-assignment': 2,
        'operator-linebreak': [
          'error',
          'after',
          {
            overrides: {
              '?': 'before',
              ':': 'before',
            },
          },
        ],
        'sort-vars': 2,

        'arrow-body-style': 0,
        'constructor-super': 2,
        'no-this-before-super': 2,
        'prefer-arrow-callback': 0,
        'prefer-spread': 2,
        'require-yield': 2,
        'quotes': [2, 'single', { 'avoidEscape': true }],
        'semi': [2, 'always']
      },
    },
);
