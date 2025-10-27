import { query, transaction, healthCheck, testConnection } from './mysql.js'
import dotenv from 'dotenv'

dotenv.config()

// 测试数据库连接
async function initializeDatabase() {
  const isConnected = await testConnection()
  if (isConnected) {
    console.log('✅ MySQL数据库连接成功')
  } else {
    console.log('⚠️  MySQL数据库连接失败，使用模拟数据模式')
  }
}

// 初始化数据库连接
initializeDatabase()

// 导出MySQL查询函数
export { query, transaction, healthCheck }
export default { query, transaction, healthCheck }