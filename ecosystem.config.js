// PM2_INSTANCES controls how many processes to spawn.
// Keep at 1 for Telegram long-polling mode — multiple instances
// would each receive duplicate updates from Telegram's API.
// Scale > 1 only when switching to webhook mode.
const instances = parseInt(process.env.PM2_INSTANCES || '1', 10);

module.exports = {
  apps: [
    {
      name: 'xodiyev-payment-bot',
      script: './dist/index.js',

      instances,
      exec_mode: instances > 1 ? 'cluster' : 'fork',

      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,

      env_production: {
        NODE_ENV: 'production',
        PM2_INSTANCES: '1',
      },
    },
  ],
};
