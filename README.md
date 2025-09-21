backend link
https://github.com/GeliusIHe/pingtowerbackend



### install:
```
pnpm install
```

### запуск dev
```
pnpm dev
```



[//]: # (# React + TypeScript + Vite)

[//]: # ()
[//]: # (This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.)

[//]: # ()
[//]: # (Currently, two official plugins are available:)

[//]: # ()
[//]: # (- [@vitejs/plugin-react]&#40;https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react&#41; uses [Babel]&#40;https://babeljs.io/&#41; for Fast Refresh)

[//]: # (- [@vitejs/plugin-react-swc]&#40;https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc&#41; uses [SWC]&#40;https://swc.rs/&#41; for Fast Refresh)

[//]: # ()
[//]: # (## Expanding the ESLint configuration)

[//]: # ()
[//]: # (If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:)

[//]: # ()
[//]: # (```js)

[//]: # (export default defineConfig&#40;[)

[//]: # (  globalIgnores&#40;['dist']&#41;,)

[//]: # (  {)

[//]: # (    files: ['**/*.{ts,tsx}'],)

[//]: # (    extends: [)

[//]: # (      // Other configs...)

[//]: # ()
[//]: # (      // Remove tseslint.configs.recommended and replace with this)

[//]: # (      tseslint.configs.recommendedTypeChecked,)

[//]: # (      // Alternatively, use this for stricter rules)

[//]: # (      tseslint.configs.strictTypeChecked,)

[//]: # (      // Optionally, add this for stylistic rules)

[//]: # (      tseslint.configs.stylisticTypeChecked,)

[//]: # ()
[//]: # (      // Other configs...)

[//]: # (    ],)

[//]: # (    languageOptions: {)

[//]: # (      parserOptions: {)

[//]: # (        project: ['./tsconfig.node.json', './tsconfig.app.json'],)

[//]: # (        tsconfigRootDir: import.meta.dirname,)

[//]: # (      },)

[//]: # (      // other options...)

[//]: # (    },)

[//]: # (  },)

[//]: # (]&#41;)

[//]: # (```)

[//]: # ()
[//]: # (You can also install [eslint-plugin-react-x]&#40;https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x&#41; and [eslint-plugin-react-dom]&#40;https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom&#41; for React-specific lint rules:)

[//]: # ()
[//]: # (```js)

[//]: # (// eslint.config.js)

[//]: # (import reactX from 'eslint-plugin-react-x')

[//]: # (import reactDom from 'eslint-plugin-react-dom')

[//]: # ()
[//]: # (export default defineConfig&#40;[)

[//]: # (  globalIgnores&#40;['dist']&#41;,)

[//]: # (  {)

[//]: # (    files: ['**/*.{ts,tsx}'],)

[//]: # (    extends: [)

[//]: # (      // Other configs...)

[//]: # (      // Enable lint rules for React)

[//]: # (      reactX.configs['recommended-typescript'],)

[//]: # (      // Enable lint rules for React DOM)

[//]: # (      reactDom.configs.recommended,)

[//]: # (    ],)

[//]: # (    languageOptions: {)

[//]: # (      parserOptions: {)

[//]: # (        project: ['./tsconfig.node.json', './tsconfig.app.json'],)

[//]: # (        tsconfigRootDir: import.meta.dirname,)

[//]: # (      },)

[//]: # (      // other options...)

[//]: # (    },)

[//]: # (  },)

[//]: # (]&#41;)

[//]: # (```)
