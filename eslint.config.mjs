import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';

export default defineConfig([
  ...nextVitals,
  {
    rules: {
      '@next/next/no-img-element': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react/no-unescaped-entities': 'off',
      'no-unused-vars': 'off',
    },
  },
  globalIgnores([
    '.next/**',
    'node_modules/**',
    'src/server/public-backend/Router/**',
    'src/server/admin-backend/routes/**',
  ]),
]);
