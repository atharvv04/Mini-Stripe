module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-console': 'off', // Allow console.log for development
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'max-len': ['error', { code: 120 }],
    'camelcase': ['error', { properties: 'never' }],
    'no-underscore-dangle': 'off',
    'consistent-return': 'off',
    'no-param-reassign': ['error', { props: false }],
    'import/extensions': ['error', 'ignorePackages'],
    'import/prefer-default-export': 'off',
  },
  overrides: [
    {
      files: ['tests/**/*.js'],
      env: {
        jest: true,
      },
    },
  ],
}; 