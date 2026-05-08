import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    // This is the most critical part for Mac/Vite 8
    nodePolyfills({
      include: ['buffer', 'process', 'crypto', 'stream', 'util'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  optimizeDeps: {
    // 🛡️ We force Vite to pre-bundle these so they don't break the browser
    include: ['@solana/web3.js', 'eventemitter3', 'buffer'],
    esbuildOptions: {
      target: 'esnext',
      supported: { bigint: true }
    }
  },
  resolve: {
    // This helps the Mac file system resolve the CommonJS modules
    alias: {
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
    },
  },
})