module.exports = {
  apps: [{
    name: 'easyrent-backend',
    script: './src/server-prod.js',
    instances: 'max', // 使用所有CPU核心
    exec_mode: 'cluster', // 集群模式
    watch: false, // 生产环境不监听文件变化
    max_memory_restart: '1G', // 内存超过1G自动重启
    env: {
      NODE_ENV: 'production',
      PORT: 8000
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 8000
    },
    // 日志配置
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    // 性能监控
    node_args: '--max-old-space-size=1024', // 设置堆内存上限
    // 重启策略
    autorestart: true,
    restart_delay: 4000,
    // 健康检查
    health_check_url: 'http://localhost:8000/health',
    health_check_interval: 30000, // 30秒检查一次
    // 优雅关闭
    kill_timeout: 5000,
    listen_timeout: 3000
  }]
}