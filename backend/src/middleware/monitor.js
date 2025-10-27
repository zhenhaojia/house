import os from 'os'
import v8 from 'v8'

// 系统监控中间件
export const systemMonitor = (req, res, next) => {
  if (req.path === '/metrics') {
    const metrics = getSystemMetrics()
    return res.json(metrics)
  }
  next()
}

// 获取系统指标
export const getSystemMetrics = () => {
  const memory = process.memoryUsage()
  const cpuUsage = process.cpuUsage()
  const heapStats = v8.getHeapStatistics()
  
  return {
    timestamp: new Date().toISOString(),
    process: {
      pid: process.pid,
      uptime: Math.round(process.uptime()),
      memory: {
        rss: Math.round(memory.rss / 1024 / 1024),
        heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
        external: Math.round(memory.external / 1024 / 1024)
      },
      cpu: {
        user: Math.round(cpuUsage.user / 1000),
        system: Math.round(cpuUsage.system / 1000)
      }
    },
    system: {
      platform: os.platform(),
      arch: os.arch(),
      loadavg: os.loadavg(),
      totalMemory: Math.round(os.totalmem() / 1024 / 1024),
      freeMemory: Math.round(os.freemem() / 1024 / 1024),
      cpus: os.cpus().length
    },
    v8: {
      heapSizeLimit: Math.round(heapStats.heap_size_limit / 1024 / 1024),
      totalHeapSize: Math.round(heapStats.total_heap_size / 1024 / 1024),
      usedHeapSize: Math.round(heapStats.used_heap_size / 1024 / 1024),
      totalAvailableSize: Math.round(heapStats.total_available_size / 1024 / 1024)
    },
    node: {
      version: process.version,
      versions: process.versions
    }
  }
}

// 请求统计
const requestStats = {
  total: 0,
  byMethod: {},
  byStatus: {},
  byPath: {},
  responseTimes: []
}

export const requestMonitor = (req, res, next) => {
  const startTime = Date.now()
  
  // 监听响应完成
  res.on('finish', () => {
    const duration = Date.now() - startTime
    
    // 更新统计
    requestStats.total++
    
    // 按方法统计
    requestStats.byMethod[req.method] = (requestStats.byMethod[req.method] || 0) + 1
    
    // 按状态码统计
    requestStats.byStatus[res.statusCode] = (requestStats.byStatus[res.statusCode] || 0) + 1
    
    // 按路径统计
    const path = req.path.split('?')[0]
    requestStats.byPath[path] = (requestStats.byPath[path] || 0) + 1
    
    // 响应时间统计
    requestStats.responseTimes.push(duration)
    
    // 只保留最近1000个响应时间
    if (requestStats.responseTimes.length > 1000) {
      requestStats.responseTimes.shift()
    }
  })
  
  next()
}

// 获取请求统计
export const getRequestStats = () => {
  const responseTimes = requestStats.responseTimes
  const avgResponseTime = responseTimes.length > 0 
    ? Math.round(responseTimes.reduce((a, b) => a + b) / responseTimes.length)
    : 0
    
  const sortedTimes = [...responseTimes].sort((a, b) => a - b)
  const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)] || 0
  const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)] || 0
  
  return {
    totalRequests: requestStats.total,
    requestsByMethod: requestStats.byMethod,
    requestsByStatus: requestStats.byStatus,
    requestsByPath: requestStats.byPath,
    responseTime: {
      average: avgResponseTime,
      p95: p95,
      p99: p99,
      min: sortedTimes[0] || 0,
      max: sortedTimes[sortedTimes.length - 1] || 0
    }
  }
}

// 健康检查端点
export const healthCheck = (req, res) => {
  const metrics = getSystemMetrics()
  const requestStats = getRequestStats()
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: metrics.process.uptime,
    memory: metrics.process.memory,
    requests: requestStats
  }
  
  res.json(health)
}

// 性能监控端点
export const performanceMetrics = (req, res) => {
  const systemMetrics = getSystemMetrics()
  const requestMetrics = getRequestStats()
  
  res.json({
    system: systemMetrics,
    requests: requestMetrics
  })
}