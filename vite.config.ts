import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from '@tailwindcss/vite';
import path from "path";
import { visualizer } from 'rollup-plugin-visualizer';
import { createHtmlPlugin } from 'vite-plugin-html';

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');
  const PORT = parseInt(env.PORT || '12000');
  const API_URL = env.API_URL || 'http://localhost:12001/api';
  const isProduction = mode === 'production';
  
  return {
  server: {
    host: "0.0.0.0",
    port: PORT,
    cors: true,
    strictPort: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
      "X-Frame-Options": "ALLOWALL",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer-when-downgrade",
      "Content-Security-Policy": "frame-ancestors 'self' https://*.all-hands.dev"
    },
    proxy: {
      '/api': {
        target: API_URL.replace('/api', ''),
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error:', err);
          });
          
          // Only log in development mode
          if (!isProduction) {
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
      ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/logs/**'],
    },
    hmr: {
      overlay: true,
      clientPort: PORT,
      host: 'localhost',
    },
    open: false,
    fs: {
      strict: true,
      allow: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'public')],
    },
  },
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),
    tailwindcss(),
    createHtmlPlugin({
      minify: isProduction,
      inject: {
        data: {
          title: 'Blogify - Modern Blog Platform',
          description: 'Share your thoughts with the world',
          apiUrl: API_URL,
          mode: mode,
        },
      },
    }),
    // Add bundle visualizer in production build
    isProduction && visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
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
    sourcemap: !isProduction,
    minify: isProduction ? 'terser' : false,
    terserOptions: {
      compress: {
        drop_console: isProduction,
        drop_debugger: isProduction,
        pure_funcs: isProduction ? ['console.log', 'console.debug', 'console.info'] : [],
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Create specific chunks for better caching
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('scheduler') || id.includes('prop-types')) {
              return 'vendor-react';
            }
            if (id.includes('@emotion') || id.includes('tailwindcss') || id.includes('styled')) {
              return 'vendor-ui';
            }
            if (id.includes('zustand') || id.includes('date-fns') || id.includes('lucide')) {
              return 'vendor-utils';
            }
            return 'vendor'; // All other node_modules
          }
          
          // Group app code by directory
          if (id.includes('/src/components/')) {
            return 'app-components';
          }
          if (id.includes('/src/pages/')) {
            return 'app-pages';
          }
          if (id.includes('/src/hooks/') || id.includes('/src/utils/') || id.includes('/src/lib/')) {
            return 'app-utils';
          }
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/.test(assetInfo.name)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/\.(woff2?|ttf|eot|otf)$/.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          if (/\.css$/.test(assetInfo.name)) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    target: 'es2018',
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    reportCompressedSize: true,
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1MB
  },
  preview: {
    port: PORT,
    host: '0.0.0.0',
    strictPort: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
      "X-Frame-Options": "ALLOWALL",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer-when-downgrade",
      "Content-Security-Policy": "frame-ancestors 'self' https://*.all-hands.dev"
    },
    proxy: {
      '/api': {
        target: API_URL.replace('/api', ''),
        changeOrigin: true,
        secure: false,
      }
    },
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      '@emotion/react', 
      '@emotion/styled',
      'zustand',
      'date-fns',
      'lucide-react'
    ],
    exclude: [],
    esbuildOptions: {
      target: 'es2020',
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
    'process.env.API_URL': JSON.stringify(API_URL),
    'import.meta.env.API_URL': JSON.stringify(API_URL),
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
  }
});
