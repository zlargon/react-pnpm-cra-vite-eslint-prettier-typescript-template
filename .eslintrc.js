module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'react-app',
    'react-app/jest',
    'prettier', // Turns off all rules that are unnecessary or might conflict with Prettier
  ],
  rules: {
    // For testing purpose, we should not access 'window' object directly
    // https://eslint.org/docs/rules/no-restricted-globals
    'no-restricted-globals': [
      'error',
      {
        name: 'window',
        message: 'Please use src/utils/getWindow.ts instead. Read more details at src/utils/getWindow.md', // prettier-ignore
      },
    ],
  },
};
