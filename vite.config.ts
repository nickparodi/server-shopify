// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// // https://vitejs.dev/config/
// export default defineConfig({
//   server: {
//     host: 'localhost',
//     port: 5173
//   }
// });

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'https://server-shopify-hscc.onrender.com',
  },
  build: {
    outDir: './dist',
    emptyOutDir: true,
  },
  publicDir: 'public',
});
