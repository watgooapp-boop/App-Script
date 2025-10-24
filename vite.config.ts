import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // This tells Vite the correct base path for the GitHub Pages subdirectory.
  base: '/App-Script/',
});
