import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

// 路由导入
import listingRoutes from './routes/listings.js'
import searchRoutes from './routes/search.js'
import userRoutes from './routes/user.js'
import analyticsRoutes from './routes/analytics.js'
import adminRoutes from './routes/admin.js'
import authRoutes from './routes/auth.js'

// 加载环境变量
dotenv.config()

const app = express()
const PORT = process.env.PORT || 8000

// 安全中间件
app.use(helmet())
app.use(compression())

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 限制每个IP每15分钟最多100个请求
})
app.use(limiter)

// CORS配置
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004', 'http://localhost:3005'],
  credentials: true
}))

// 解析请求体
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// 静态文件服务
app.use('/uploads', express.static('uploads'))

// API路由
app.use('/api/listings', listingRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/user', userRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/auth', authRoutes)

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  })
})

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ error: '路由不存在' })
})

// 全局错误处理
app.use((error, req, res, next) => {
  console.error('服务器错误:', error)
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? '内部服务器错误' 
      : error.message 
  })
})

app.listen(PORT, () => {
  console.log(`🚀 服务器运行在端口 ${PORT}`)
  console.log(`📊 环境: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🌐 前端地址: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`)
})