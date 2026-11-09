import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load all env vars (not just VITE_*) so the Adaption key stays server-side
  const env = loadEnv(mode, process.cwd(), '')

  // Browser calls /api/adaption/*; the dev server adds the key and forwards it.
  const proxy = {
    '/api/adaption': {
      target: 'https://api.prod.adaptionlabs.ai',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/adaption/, '/api/v1'),
      headers: { Authorization: `Bearer ${env.ADAPTION_API_KEY || ''}` },
    },
  }

  return {
    plugins: [react()],
    define: {
      // Only a yes/no flag reaches the browser, never the key itself
      'import.meta.env.HAS_ADAPTION': JSON.stringify(Boolean(env.ADAPTION_API_KEY)),
    },
    server: { proxy },
    preview: { proxy },
  }
})
