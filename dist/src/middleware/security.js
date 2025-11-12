import rateLimit from 'express-rate-limit'

// API速率限制配置
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: (req) => {
    // 根据路径设置不同的限制
    if (req.path.includes('/api/admin')) {
      return 200 // 管理接口限制更严格
    }
    if (req.path.includes('/api/auth')) {
      return 50 // 认证接口限制最严格
    }
    return 500 // 普通API接口
  },
  message: {
    error: '请求过于频繁，请稍后再试',
    retryAfter: 15 * 60 // 15分钟后重试
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // 跳过健康检查
    return req.path === '/health'
  }
})

// 文件上传限制
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 10, // 每小时最多10次上传
  message: {
    error: '上传次数过多，请1小时后再试'
  }
})

// 暴力破解防护
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 15分钟内最多5次登录尝试
  message: {
    error: '登录尝试过多，请15分钟后再试'
  },
  skipSuccessfulRequests: true // 成功登录后不计入限制
})

// CORS配置
export const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://yourdomain.com' // 替换为实际域名
    ]
    
    // 开发环境允许所有来源
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true)
    }
    
    // 生产环境检查来源
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('不允许的CORS请求'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-Api-Key'
  ],
  maxAge: 86400 // 24小时
}

// 请求验证中间件
export const validateRequest = (req, res, next) => {
  // 检查请求体大小
  const contentLength = req.headers['content-length']
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
    return res.status(413).json({ error: '请求体过大' })
  }
  
  // 检查Content-Type
  if (req.method === 'POST' || req.method === 'PUT') {
    const contentType = req.headers['content-type']
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(415).json({ error: '不支持的媒体类型' })
    }
  }
  
  next()
}

// SQL注入防护
export const sqlInjectionProtection = (req, res, next) => {
  const suspiciousPatterns = [
    /(\bUNION\b.*\bSELECT\b)/i,
    /(\bDROP\b.*\bTABLE\b)/i,
    /(\bINSERT\b.*\bINTO\b)/i,
    /(\bDELETE\b.*\bFROM\b)/i,
    /(\bUPDATE\b.*\bSET\b)/i,
    /(\bEXEC\b|\bEXECUTE\b)/i,
    /(\bWAITFOR\b.*\bDELAY\b)/i,
    /('|\"|`).*(\bOR\b|\bAND\b).*('|\"|`)/i
  ]
  
  // 检查查询参数
  const queryString = JSON.stringify(req.query)
  const bodyString = JSON.stringify(req.body)
  const combined = queryString + bodyString
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(combined)) {
      console.warn(`疑似SQL注入攻击: ${req.ip} - ${req.originalUrl}`)
      return res.status(400).json({ error: '非法请求' })
    }
  }
  
  next()
}

// XSS防护
export const xssProtection = (req, res, next) => {
  // 简单的XSS检测
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi
  ]
  
  const checkForXSS = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        for (const pattern of xssPatterns) {
          if (pattern.test(obj[key])) {
            return true
          }
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (checkForXSS(obj[key])) {
          return true
        }
      }
    }
    return false
  }
  
  if (checkForXSS(req.body) || checkForXSS(req.query)) {
    console.warn(`疑似XSS攻击: ${req.ip} - ${req.originalUrl}`)
    return res.status(400).json({ error: '非法请求' })
  }
  
  next()
}