module.exports = ({ env }) => [
  // 其他中间件配置保持不变
  'strapi::logger',
  'strapi::errors',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // 添加 'unsafe-eval'
          "img-src": ["'self'", "data:", "blob:"],
          // 根据需要添加或修改其他资源的源
        },
      },
    },
  },
];