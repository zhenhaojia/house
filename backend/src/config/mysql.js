import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

// 修复MySQL连接配置警告
const mysqlConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'easyrent',
  
  // 正确的连接池配置
  connectionLimit: parseInt(process.env.DB_POOL_LIMIT) || 10,
  acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT) || 60000,
  timeout: parseInt(process.env.DB_TIMEOUT) || 60000,
  reconnect: process.env.DB_RECONNECT !== 'false',
  
  // 字符集配置
  charset: 'utf8mb4',
  timezone: '+08:00', // 中国时区
  
  // 连接超时设置
  connectTimeout: 10000,
  
  // 支持多语句查询（谨慎使用）
  multipleStatements: false,
  
  // SSL配置（生产环境）
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
}

// 创建连接池
const pool = mysql.createPool(mysqlConfig)

// 连接池事件监听
pool.on('acquire', (connection) => {
  console.log('🔗 数据库连接获取成功，连接ID:', connection.threadId)
})

pool.on('release', (connection) => {
  console.log('🔗 数据库连接释放，连接ID:', connection.threadId)
})

pool.on('enqueue', () => {
  console.log('⏳ 等待可用数据库连接...')
})

// 测试数据库连接
const testConnection = async () => {
  try {
    const connection = await pool.getConnection()
    console.log('✅ MySQL数据库连接测试成功')
    connection.release()
    return true
  } catch (error) {
    console.error('❌ MySQL数据库连接失败:', error.message)
    return false
  }
}

// 执行查询的封装函数
const query = async (sql, params = []) => {
  const startTime = Date.now()
  
  try {
    const [rows, fields] = await pool.execute(sql, params)
    const duration = Date.now() - startTime
    
    // 记录慢查询
    if (duration > 1000) {
      console.warn(`🐌 慢查询警告: ${sql} - ${duration}ms`)
    }
    
    return { success: true, data: rows, fields, duration }
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`❌ 数据库查询错误: ${sql}`, error)
    
    return { 
      success: false, 
      error: error.message,
      sql,
      params,
      duration 
    }
  }
}

// 事务处理
const transaction = async (callback) => {
  const connection = await pool.getConnection()
  
  try {
    await connection.beginTransaction()
    const result = await callback(connection)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

// 获取连接池状态
const getPoolStatus = () => {
  return {
    totalConnections: pool._allConnections.length,
    activeConnections: pool._acquiringConnections.length,
    idleConnections: pool._freeConnections.length,
    waitingAcquires: pool._acquireQueue.length
  }
}

// 健康检查
const healthCheck = async () => {
  try {
    const result = await query('SELECT 1 as status')
    return {
      status: result.success ? 'healthy' : 'unhealthy',
      database: result.success ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}

export { pool, query, transaction, getPoolStatus, healthCheck, testConnection }
export default pool