/*
  Vite configuration for the CUNY-Connect client.
  This file sets up the React plugin and the dev server.
  Owner: Person 1
  TODO: Adjust the build settings for deployment if needed.
*/
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // The port is fixed because CLIENT_URL in server/.env has to match it for CORS to allow requests.
  server: {
    port: 5173,
  },
});
