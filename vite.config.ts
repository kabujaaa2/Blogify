import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from '@tailwindcss/vite';
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 12000,
    cors: true,
    strictPort: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
      "X-Frame-Options": "ALLOWALL",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer-when-downgrade"
    },
    proxy: {
      '/api': {
        target: 'http://localhost:12001',
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error:', err);
          });
          
          // Only log in development mode
          if (mode === 'development') {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log(`Proxying ${req.method} request:`, req.url);
            });
            
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log(`Proxy response [${proxyRes.statusCode}]:`, req.url);
            });
          }
        },
      }
    },
    watch: {
      usePolling: true,
      ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
    },
    hmr: {
      overlay: true,
      clientPort: 12000,
      host: 'localhost',
    },
    open: false,
  },
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),
    tailwindcss(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@styles": path.resolve(__dirname, "./src/styles"),
      "@lib": path.resolve(__dirname, "./src/lib"),
      "@api": path.resolve(__dirname, "./src/api"),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  build: {
    outDir: 'dist',
    sourcemap: mode !== 'production',
    minify: mode === 'production' ? 'terser' : false,
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@emotion/react', '@emotion/styled', 'tailwindcss'],
          utils: ['date-fns', 'zustand', 'lucide-react'],
        },
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
    target: 'es2018',
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    reportCompressedSize: true,
    emptyOutDir: true,
  },
  preview: {
    port: 12000,
    host: '0.0.0.0',
    strictPort: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "X-Frame-Options": "ALLOWALL"
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@emotion/react', '@emotion/styled'],
    exclude: [],
  },
}));
