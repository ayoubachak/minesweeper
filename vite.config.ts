import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Get the GitHub repository name for the base URL
// This is needed for GitHub Pages deployment
const getBase = () => {
  // For local development, use an empty base
  if (process.env.NODE_ENV === 'development') {
    return '/';
  }
  
  // For production, use the repository name
  // This assumes the GitHub Pages site will be at: https://username.github.io/minesweeper/
  return '/minesweeper/';
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: getBase(),
}); 