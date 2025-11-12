import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 日志级别
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
}

// 当前日志级别
const CURRENT_LEVEL = process.env.LOG_LEVEL || 'INFO'

// 确保日志目录存在
const logDir = path.join(__dirname, '../../logs')
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true })
}

// 日志文件路径
const getLogFilePath = (level) => {
  const date = new Date().toISOString().split('T')[0]
  return path.join(logDir, `${level.toLowerCase()}-${date}.log`)
}

// 格式化日志消息
const formatMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    level,
    message,
    pid: process.pid,
    ...meta
  }
  return JSON.stringify(logEntry)
}

// 写入日志文件
const writeToFile = (level, message, meta) => {
  const logMessage = formatMessage(level, message, meta)
  const filePath = getLogFilePath(level)
  
  fs.appendFile(filePath, logMessage + '\n', (err) => {
    if (err) {
      console.error('写入日志文件失败:', err)
    }
  })
}

// 控制台输出
const consoleOutput = (level, message, meta) => {
  const timestamp = new Date().toISOString()
  const prefix = `[${timestamp}] [${level}]`
  
  switch (level) {
    case 'ERROR':
      console.error(prefix, message, meta)
      break
    case 'WARN':
      console.warn(prefix, message, meta)
      break
    case 'INFO':
      console.info(prefix, message, meta)
      break
    case 'DEBUG':
      console.debug(prefix, message, meta)
      break
    default:
      console.log(prefix, message, meta)
  }
}

// 检查是否应该记录
const shouldLog = (level) => {
  return LOG_LEVELS[level] <= LOG_LEVELS[CURRENT_LEVEL]
}

// 日志类
class Logger {
  constructor(module = '') {
    this.module = module
  }
  
  error(message, meta = {}) {
    if (shouldLog('ERROR')) {
      const fullMessage = this.module ? `[${this.module}] ${message}` : message
      consoleOutput('ERROR', fullMessage, meta)
      writeToFile('ERROR', fullMessage, meta)
    }
  }
  
  warn(message, meta = {}) {
    if (shouldLog('WARN')) {
      const fullMessage = this.module ? `[${this.module}] ${message}` : message
      consoleOutput('WARN', fullMessage, meta)
      writeToFile('WARN', fullMessage, meta)
    }
  }
  
  info(message, meta = {}) {
    if (shouldLog('INFO')) {
      const fullMessage = this.module ? `[${this.module}] ${message}` : message
      consoleOutput('INFO', fullMessage, meta)
      writeToFile('INFO', fullMessage, meta)
    }
  }
  
  debug(message, meta = {}) {
    if (shouldLog('DEBUG')) {
      const fullMessage = this.module ? `[${this.module}] ${message}` : message
      consoleOutput('DEBUG', fullMessage, meta)
      writeToFile('DEBUG', fullMessage, meta)
    }
  }
  
  // HTTP请求日志
  http(req, res, responseTime) {
    if (shouldLog('INFO')) {
      const meta = {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        responseTime: responseTime + 'ms'
      }
      
      let level = 'INFO'
      if (res.statusCode >= 500) level = 'ERROR'
      else if (res.statusCode >= 400) level = 'WARN'
      
      const message = `${req.method} ${req.originalUrl} ${res.statusCode}`
      consoleOutput(level, message, meta)
      writeToFile(level, message, meta)
    }
  }
  
  // 数据库查询日志
  db(query, params, duration) {
    if (shouldLog('DEBUG')) {
      const meta = {
        query: query.length > 1000 ? query.substring(0, 1000) + '...' : query,
        params: params,
        duration: duration + 'ms'
      }
      
      this.debug('数据库查询', meta)
    }
  }
}

// 创建默认日志实例
const logger = new Logger()

export { Logger, logger as default }