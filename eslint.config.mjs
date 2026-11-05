import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const nextConfigPath = require.resolve("eslint-config-next");

const nextPlugin = require(
  require.resolve("@next/eslint-plugin-next", { paths: [nextConfigPath] })
);
const reactPlugin = require(
  require.resolve("eslint-plugin-react", { paths: [nextConfigPath] })
);
const reactHooksPlugin = require(
  require.resolve("eslint-plugin-react-hooks", { paths: [nextConfigPath] })
);
const tsParser = require(
  require.resolve("@typescript-eslint/parser", { paths: [nextConfigPath] })
);

const eslintConfig = [
  {
    ignores: [".next/*", "node_modules/*"],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "@next/next": nextPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];

export default eslintConfig;
