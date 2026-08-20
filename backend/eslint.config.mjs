import tseslint from "typescript-eslint";

export default tseslint.config(
  ...tseslint.configs.recommended,
  {
    rules: {
      // A leading underscore marks a parameter that must exist for its
      // position but is deliberately unused.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Nest relies on decorator metadata and constructor injection, which
      // trips a couple of the defaults.
      "@typescript-eslint/no-extraneous-class": "off",
      "@typescript-eslint/interface-name-prefix": "off",
    },
  },
  { ignores: ["dist/**", "node_modules/**"] },
);
