import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [
    react()
  ],
  
  server: {
    port: 3000,
    open: true,
    // 开发服务器性能优化
    cors: true,
    hmr: {
      overlay: true
    }
  },
  
  build: {
    // 构建输出配置
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: mode === 'production' ? false : true,
    
    // 代码分割优化
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@cloudbase/js-sdk'],
          pdf: ['html2pdf.js'],
          docx: ['docx', 'file-saver']
        },
        // 文件名优化
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    
    // 构建性能优化
    minify: mode === 'production' ? 'terser' : false,
    terserOptions: {
      compress: {
        drop_console: mode === 'production', // 生产环境移除console
        drop_debugger: true
      }
    },
    
    // 大文件警告阈值
    chunkSizeWarningLimit: 1000,
    
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  
  // 依赖预构建优化
  optimizeDeps: {
    include: [
      '@cloudbase/js-sdk',
      'zustand',
      'html2pdf.js',
      'docx',
      'file-saver'
    ],
    exclude: []
  },
  
  // 解析配置
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@common': path.resolve(__dirname, 'src/components/common'),
      '@mobile': path.resolve(__dirname, 'src/components/mobile'),
      '@desktop': path.resolve(__dirname, 'src/components/desktop'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@mobile-pages': path.resolve(__dirname, 'src/pages/mobile'),
      '@desktop-pages': path.resolve(__dirname, 'src/pages/desktop'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@stores': path.resolve(__dirname, 'src/stores'),
      '@types': path.resolve(__dirname, 'src/types'),
      '@constants': path.resolve(__dirname, 'src/constants'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@data': path.resolve(__dirname, 'src/data'),
      '@config': path.resolve(__dirname, 'src/config'),
    }
  },
  
  // CSS优化
  css: {
    modules: {
      localsConvention: 'camelCase'
    },
    preprocessorOptions: {
      scss: {
        additionalData: '@import "@/styles/variables.scss";'
      }
    }
  },
  
  // 环境变量配置
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
}));
