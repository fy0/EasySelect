module.exports = {
  root: true,
  globals: { '_': true, 'chrome': true, 'browser': true },
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
    // '@vue/typescript/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2019
  },
  rules: {
    'no-new': 0,
    'no-console': 0,
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'prefer-const': 0,
    'quote-props': 0,
    'dot-notation': 0,
    'no-unused-vars': 0,
    '@typescript-eslint/no-unused-vars': 0,
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/no-explicit-any': 0,
    'no-useless-escape': 0
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)'
      ],
      env: {
        jest: true
      }
    }
  ]
}
