import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // Design System Enforcement Rules
    rules: {
      // Warn about hardcoded hex colors in className strings
      "no-restricted-syntax": [
        "warn",
        {
          selector: "Literal[value=/^#[0-9a-fA-F]{3,6}$/]",
          message: "Use design system tokens instead of hardcoded hex colors. Use semantic tokens like 'bg-primary', 'text-foreground', etc.",
        },
      ],
    },
  },
  {
    // Rules for JSX/TSX files
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      // Warn about common hardcoded color patterns in className
      "no-restricted-syntax": [
        "warn",
        {
          selector: "TemplateLiteral[expressions.length=0] > TemplateElement[value.raw=/bg-\\[#[0-9a-fA-F]{3,6}\\]/]",
          message: "Avoid hardcoded hex colors in Tailwind classes. Use design system tokens like 'bg-primary', 'bg-secondary', etc.",
        },
        {
          selector: "TemplateLiteral[expressions.length=0] > TemplateElement[value.raw=/text-\\[#[0-9a-fA-F]{3,6}\\]/]",
          message: "Avoid hardcoded hex colors in Tailwind classes. Use design system tokens like 'text-foreground', 'text-primary', etc.",
        },
        {
          selector: "TemplateLiteral[expressions.length=0] > TemplateElement[value.raw=/border-\\[#[0-9a-fA-F]{3,6}\\]/]",
          message: "Avoid hardcoded hex colors in Tailwind classes. Use design system tokens like 'border-border', 'border-primary', etc.",
        },
        // Warn about arbitrary spacing values
        {
          selector: "TemplateLiteral[expressions.length=0] > TemplateElement[value.raw=/[p|m|gap|w|h]-\\[[0-9]+px\\]/]",
          message: "Avoid arbitrary pixel values. Use design system spacing scale (0-24) or layout primitives (Stack, Grid, Spacer).",
        },
        // Warn about arbitrary border radius
        {
          selector: "TemplateLiteral[expressions.length=0] > TemplateElement[value.raw=/rounded-\\[[0-9]+px\\]/]",
          message: "Avoid arbitrary border radius values. Use design system tokens: 'rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl'.",
        },
      ],
    },
  },
]);

export default eslintConfig;
