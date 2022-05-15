const { defineConfig } = require('@vue/cli-service')

const baseUrl = process.env.VUE_APP_API_BASE_URL;

module.exports = defineConfig(
  {
    transpileDependencies: true,
    configureWebpack: {
      devServer: {
        proxy: {
          "/login": {
            target: baseUrl,
            pathRewrite: { '^/login': '/login' },
            changeOrigin: true,
            secure: false
          },
          "/checkout": {
            target: baseUrl,
            pathRewrite: { '^/checkout': '/checkout' },
            changeOrigin: true,
            secure: false
          },
          "/verify": {
            target: baseUrl,
            pathRewrite: { '^/verify': '/verify' },
            changeOrigin: true,
            secure: false
          },
        }
      }
    }
  },
);
