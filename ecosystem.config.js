// PM2_INSTANCES  — number of processes (keep 1 for long-polling mode)
// WORKER_THREADS — libuv thread pool size for file I/O (UV_THREADPOOL_SIZE)
const instances = parseInt(process.env.PM2_INSTANCES || '1', 10);
const workerThreads = parseInt(process.env.WORKER_THREADS || '4', 10);

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
        UV_THREADPOOL_SIZE: workerThreads,
      },
    },
  ],
};
