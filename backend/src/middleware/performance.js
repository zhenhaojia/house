// 性能监控中间件
export const performanceMonitor = (req, res, next) => {
  const start = Date.now()
  const startMemory = process.memoryUsage()
  
  // 监听响应完成
  res.on('finish', () => {
    const duration = Date.now() - start
    const endMemory = process.memoryUsage()
    
    const memoryDiff = {
      rss: endMemory.rss - startMemory.rss,
      heapTotal: endMemory.heapTotal - startMemory.heapTotal,
      heapUsed: endMemory.heapUsed - startMemory.heapUsed
    }
    
    // 记录慢请求
    if (duration > 1000) {
      console.warn(`慢请求: ${req.method} ${req.originalUrl} - ${duration}ms`)
    }
    
    // 记录内存使用异常
    if (memoryDiff.heapUsed > 10 * 1024 * 1024) { // 10MB
      console.warn(`高内存使用: ${req.method} ${req.originalUrl} - ${Math.round(memoryDiff.heapUsed / 1024 / 1024)}MB`)
    }
    
    // 记录性能指标
    if (process.env.NODE_ENV === 'development') {
      console.log(`性能: ${req.method} ${req.originalUrl} - ${duration}ms, 内存: +${Math.round(memoryDiff.heapUsed / 1024)}KB`)
    }
  })
  
  next()
}

// 缓存中间件
export const cacheMiddleware = (duration = 300) => { // 默认5分钟
  return (req, res, next) => {
    // 只缓存GET请求
    if (req.method !== 'GET') {
      return next()
    }
    
    // 设置缓存头
    res.set('Cache-Control', `public, max-age=${duration}`)
    next()
  }
}

// 压缩优化
export const compressionOptimization = (req, res, next) => {
  // 检查客户端是否支持压缩
  const acceptEncoding = req.headers['accept-encoding']
  if (!acceptEncoding || !acceptEncoding.includes('gzip')) {
    return next()
  }
  
  // 设置压缩头
  res.set('Content-Encoding', 'gzip')
  next()
}

// 数据库连接池监控
export const dbPoolMonitor = (pool) => {
  setInterval(() => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('数据库连接池错误:', err)
        return
      }
      
      // 检查连接状态
      connection.ping((error) => {
        if (error) {
          console.error('数据库连接心跳检查失败:', error)
        }
        connection.release()
      })
    })
  }, 30000) // 每30秒检查一次
}

// 内存泄漏监控
export const memoryLeakMonitor = () => {
  let lastMemoryUsage = process.memoryUsage()
  
  setInterval(() => {
    const currentMemoryUsage = process.memoryUsage()
    const memoryGrowth = currentMemoryUsage.heapUsed - lastMemoryUsage.heapUsed
    
    // 如果内存持续增长超过100MB，可能存在内存泄漏
    if (memoryGrowth > 100 * 1024 * 1024) {
      console.error(`⚠️ 疑似内存泄漏: 内存增长 ${Math.round(memoryGrowth / 1024 / 1024)}MB`)
      
      // 记录堆栈信息
      if (process.env.NODE_ENV === 'development') {
        console.trace('内存增长堆栈跟踪')
      }
    }
    
    lastMemoryUsage = currentMemoryUsage
  }, 60000) // 每分钟检查一次
}

// 请求队列监控
export const requestQueueMonitor = () => {
  setInterval(() => {
    const activeHandles = process._getActiveHandles().length
    const activeRequests = process._getActiveRequests().length
    
    if (activeHandles > 1000 || activeRequests > 100) {
      console.warn(`高并发警告: 活动句柄 ${activeHandles}, 活动请求 ${activeRequests}`)
    }
  }, 30000) // 每30秒检查一次
}

// 性能指标导出
export const getPerformanceMetrics = () => {
  const memory = process.memoryUsage()
  const cpu = process.cpuUsage()
  const uptime = process.uptime()
  
  return {
    timestamp: new Date().toISOString(),
    memory: {
      rss: Math.round(memory.rss / 1024 / 1024) + 'MB',
      heapTotal: Math.round(memory.heapTotal / 1024 / 1024) + 'MB',
      heapUsed: Math.round(memory.heapUsed / 1024 / 1024) + 'MB',
      external: Math.round(memory.external / 1024 / 1024) + 'MB'
    },
    cpu: {
      user: Math.round(cpu.user / 1000) + 'ms',
      system: Math.round(cpu.system / 1000) + 'ms'
    },
    uptime: Math.round(uptime) + 's',
    activeHandles: process._getActiveHandles().length,
    activeRequests: process._getActiveRequests().length,
    version: process.version
  }
}