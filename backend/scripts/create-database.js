import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

async function createDatabase() {
  try {
    // 先连接到MySQL服务器（不指定数据库）
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    })

    console.log('🔗 连接到MySQL服务器...')

    // 创建数据库（如果不存在）
    const dbName = process.env.DB_NAME || 'easyrent'
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``)
    console.log(`✅ 数据库 ${dbName} 创建成功`)

    await connection.end()
    console.log('🎉 数据库初始化完成')
    
  } catch (error) {
    console.error('❌ 数据库创建失败:', error.message)
    console.log('💡 提示: 请确保MySQL服务器正在运行，并且连接信息正确')
  }
}

createDatabase().catch(console.error)