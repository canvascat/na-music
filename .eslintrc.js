module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: ["plugin:vue/vue3-essential", "standard"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parserOptions: {
    ecmaVersion: 2020,
    parser: "@typescript-eslint/parser",
    sourceType: "module",
  },
  plugins: ["vue", "@typescript-eslint"],
  rules: {
    "no-console": "off",
    "no-debugger": "off",
    "@typescript-eslint/explicit-module-boundary-types": 0,
    "@typescript-eslint/no-explicit-any": 0,
    camelcase: 0,
    "@typescript-eslint/ban-ts-comment": 0,
    "no-unused-expressions": 0,
  },
};
