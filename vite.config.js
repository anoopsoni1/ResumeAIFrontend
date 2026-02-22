import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa';




export default defineConfig({
  plugins: [react(), tailwindcss() ,
     VitePWA({
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
      },
      registerType: 'autoUpdate',
      manifest: {
        name: 'ResumeAI - AI Resume Builder & Optimizer',
        short_name: 'Resume AI',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0ea5e9',
        icons: [
          { src: '/one.png', sizes: '192x192', purpose: 'maskable', type: 'image/png' },
          { src: '/one.png', sizes: '512x512', purpose: 'maskable', type: 'image/png' }
        ]
      }
    })
  ],
})
