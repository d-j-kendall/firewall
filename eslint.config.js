// eslint.config.js
import js from "eslint" // <-- Change import name here
import eslintPluginImport from "eslint-plugin-import"
import eslintPluginPromise from "eslint-plugin-promise"
import globals from "globals"
import tseslint from "typescript-eslint"

export default tseslint.config(
  // TypeScript specific configurations
  ...tseslint.configs.recommended, // Or recommendedTypeChecked for stricter rules
  // If using recommendedTypeChecked, ensure parserOptions.project is set below

  // Promise plugin configuration
  {
    plugins: {
      promise: eslintPluginPromise
    },
    rules: {
      ...eslintPluginPromise.configs.recommended.rules
    }
  },

  // Import plugin configuration
  {
    plugins: {
      import: eslintPluginImport
    },
    settings: {
      "import/resolver": {
        typescript: true,
        node: true
      }
    },
    rules: {
      // Base import rules (subset of plugin:import/recommended)
      "import/no-unresolved": "error",
      "import/named": "error",
      "import/namespace": "error",
      "import/default": "error",
      "import/export": "error",
      // TypeScript specific import rules (plugin:import/typescript)
      "import/no-unresolved": "off", // Handled by TypeScript itself

      // Custom import rules from your previous config
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
            "type"
          ],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true }
        }
      ],
      "import/extensions": [
        "error",
        "ignorePackages",
        {
          js: "never",
          jsx: "never",
          ts: "never",
          tsx: "never"
        }
      ]
    }
  },

  // Global configuration applying to TS files
  {
    files: ["**/*.ts", "**/*.tsx"], // Apply these settings to TypeScript files
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true, // Automatically uses ./tsconfig.json
        tsconfigRootDir: import.meta.dirname // Helps ESLint find tsconfig relative to eslint.config.js
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
        // Manually define webextension globals or find a plugin/config for it
        // Example:
        chrome: "readonly"
      }
    },
    rules: {
      // Your custom rules from .eslintrc.json
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": [
        "warn",
        {
          allowExpressions: true
        }
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" }
      ]
    }
  },

  // Ignore patterns configuration
  {
    ignores: [
      "node_modules/",
      "build/", // Adjust if your build dir is different (e.g., dist/)
      "dist/",
      "**/*.js", // Ignore compiled JS if they exist alongside TS
      ".plasmo/"
    ]
  }
)
