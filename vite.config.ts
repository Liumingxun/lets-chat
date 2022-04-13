import { defineConfig } from 'vite'
import { VitePluginNode } from 'vite-plugin-node'

export default defineConfig({
  plugins: [
    VitePluginNode({
      adapter(app, req, res) {
        app.getRequestListener(req, res)
      },
      appPath: './src/app.ts',
    }),
  ],
})
