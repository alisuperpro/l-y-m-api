module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: "standard-with-typescript",
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "@typescript-eslint/no-misused-promises": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/space-before-function-paren": "off",
    "@typescript-eslint/no-extraneous-class": "off",
    "@typescript-eslint/strict-boolean-expressions": "off",
    "@typescript-eslint/unbound-method": "off",
  },
};
