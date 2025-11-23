import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Archivos a ignorar (debe ser el primer elemento)
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "next-env.d.ts",
      "src/generated/**",
      "vitest.config.ts",
      "**/*.generated.*",
      "**/generated/**",
      "**/prisma/**",
      "**/*.wasm.js",
      "src/generated/prisma/**",
      "src/generated/**/*",
    ],
  },
  
  // Configuración base de Next.js
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  
  // Reglas estrictas para todo el proyecto
  {
    rules: {
      // Variables no usadas = ERROR (sin excepciones)
      "@typescript-eslint/no-unused-vars": "error",
      "no-unused-vars": "off", // Desactivar la regla base
      
      // Tipo any = ERROR
      "@typescript-eslint/no-explicit-any": "error",
      
      // Otras reglas útiles
      "@typescript-eslint/no-empty-function": "warn",
      "@typescript-eslint/no-inferrable-types": "off",
      "prefer-const": "error",
      "no-var": "error",
    },
  },
  
  // Excepciones para archivos de test
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx", "src/test/**/*"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // Permitir any en tests
      "@typescript-eslint/no-unused-vars": "warn", // Solo advertencia en tests
    },
  },
];

export default eslintConfig;
