import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import cluster from 'cluster'
import os from 'os'
import dotenv from 'dotenv'

// 路由导入
import listingRoutes from './routes/listings.js'
import adminRoutes from './routes/admin.js'
import authRoutes from './routes/auth.js'

// 加载环境变量
dotenv.config()

const numCPUs = os.cpus().length
const PORT = process.env.PORT || 8000
const isProduction = process.env.NODE_ENV === 'production'

// 集群模式（生产环境）
if (cluster.isPrimary && isProduction) {
  console.log(`🖥️  主进程 ${process.pid} 正在运行`)
  
  // 根据CPU核心数创建子进程（最多使用8个核心）
  const workerCount = Math.min(numCPUs, 8)
  console.log(`🚀 启动 ${workerCount} 个工作进程`)
  
  for (let i = 0; i < workerCount; i++) {
    cluster.fork()
  }
  
  cluster.on('exit', (worker, code, signal) => {
    console.log(`❌ 工作进程 ${worker.process.pid} 已退出`)
    console.log(`🔄 重新启动工作进程...`)
    cluster.fork()
  })
  
} else {
  // 工作进程或开发模式
  const app = express()
  
  // 生产环境安全配置
  if (isProduction) {
    // 安全头设置
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    }))
    
    // 生产环境速率限制（更宽松）
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15分钟
      max: 1000, // 每个IP每15分钟最多1000个请求
      message: '请求过于频繁，请稍后再试',
      standardHeaders: true,
      legacyHeaders: false,
    })
    app.use(limiter)
    
    // 压缩优化
    app.use(compression({
      level: 6,
      threshold: 1024,
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false
        }
        return compression.filter(req, res)
      }
    }))
  } else {
    // 开发环境配置
    app.use(helmet())
    app.use(compression())
    
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 500,
    })
    app.use(limiter)
  }
  
  // CORS配置
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }))
  
  // 请求体解析优化
  app.use(express.json({ 
    limit: '10mb',
    verify: (req, res, buf) => {
      req.rawBody = buf
    }
  }))
  app.use(express.urlencoded({ 
    extended: true,
    limit: '10mb'
  }))
  
  // 静态文件服务优化
  app.use('/uploads', express.static('uploads', {
    maxAge: isProduction ? '1d' : '0',
    etag: true,
    lastModified: true
  }))
  
  // 请求日志中间件
  app.use((req, res, next) => {
    const start = Date.now()
    res.on('finish', () => {
      const duration = Date.now() - start
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`)
    })
    next()
  })
  
  // API路由
  app.use('/api/listings', listingRoutes)
  app.use('/api/admin', adminRoutes)
  app.use('/api/auth', authRoutes)
  
  // 健康检查端点（包含系统信息）
  app.get('/health', (req, res) => {
    const memoryUsage = process.memoryUsage()
    const systemInfo = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      process: {
        pid: process.pid,
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB',
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
          external: Math.round(memoryUsage.external / 1024 / 1024) + 'MB'
        },
        uptime: Math.round(process.uptime()) + 's'
      },
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version
      }
    }
    res.status(200).json(systemInfo)
  })
  
  // 性能监控端点
  app.get('/metrics', (req, res) => {
    if (!isProduction) {
      return res.status(403).json({ error: '仅在生产环境可用' })
    }
    
    const metrics = {
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      uptime: process.uptime(),
      activeHandles: process._getActiveHandles().length,
      activeRequests: process._getActiveRequests().length
    }
    
    res.json(metrics)
  })
  
  // 404处理
  app.use('*', (req, res) => {
    res.status(404).json({ 
      error: '路由不存在',
      path: req.originalUrl,
      method: req.method
    })
  })
  
  // 全局错误处理
  app.use((error, req, res, next) => {
    console.error('服务器错误:', error)
    
    // 生产环境不暴露详细错误信息
    const errorResponse = isProduction 
      ? { error: '内部服务器错误' }
      : { 
          error: error.message,
          stack: error.stack
        }
    
    res.status(error.status || 500).json(errorResponse)
  })
  
  // 优雅关闭处理
  process.on('SIGTERM', () => {
    console.log('收到SIGTERM信号，开始优雅关闭...')
    process.exit(0)
  })
  
  process.on('SIGINT', () => {
    console.log('收到SIGINT信号，开始优雅关闭...')
    process.exit(0)
  })
  
  const server = app.listen(PORT, () => {
    console.log(`🚀 服务器运行在端口 ${PORT}`)
    console.log(`📊 环境: ${process.env.NODE_ENV || 'development'}`)
    console.log(`🌐 前端地址: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`)
    console.log(`🖥️  工作进程 ${process.pid} 已启动`)
    
    if (isProduction) {
      console.log(`⚡ 集群模式: 使用 ${Math.min(numCPUs, 8)} 个工作进程`)
      console.log(`💾 内存限制: ${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`)
    }
  })
  
  // 服务器超时设置
  server.timeout = 30000 // 30秒超时
  server.keepAliveTimeout = 5000 // 5秒keep-alive超时
}