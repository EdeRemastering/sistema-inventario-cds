import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": "error",
      "no-unused-vars": "off", // Desactivar la regla base para usar la de TypeScript
    },
            ignores: [
              "node_modules/**",
              ".next/**",
              "out/**",
              "build/**",
              "next-env.d.ts",
              "src/generated/**",
              "src/test/**",
              "vitest.config.ts",
              "**/*.generated.*",
              "**/generated/**",
              "**/prisma/**",
              "**/*.wasm.js",
              "src/generated/prisma/**",
              "src/generated/**/*",
              "**/*.test.*",
              "**/*.spec.*",
            ],
  },
];

export default eslintConfig;
