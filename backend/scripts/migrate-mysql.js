import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import mysql from '../src/config/mysql.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function migrateMySQL() {
  try {
    console.log('🚀 开始MySQL数据库迁移...')
    
    // 读取迁移文件
    const migrationsDir = path.join(__dirname, '../../database/migrations')
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('_simple.sql') || file.endsWith('_mysql.sql'))
      .sort() // 按文件名排序
    
    console.log(`📁 找到 ${files.length} 个MySQL迁移文件`)
    
    for (const file of files) {
      const filePath = path.join(migrationsDir, file)
      const sql = fs.readFileSync(filePath, 'utf8')
      
      console.log(`📄 执行迁移: ${file}`)
      
      // 执行SQL文件中的每个语句
      const statements = sql.split(';').filter(stmt => stmt.trim())
      
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            const result = await mysql.query(statement.trim())
            if (!result.success) {
              console.warn(`⚠️ SQL执行警告: ${result.error}`)
              // 继续执行下一条语句，不抛出错误
            }
          } catch (error) {
            // 如果是表已存在的错误，忽略并继续
            if (error.message.includes('already exists') || error.message.includes('Duplicate')) {
              console.warn(`⚠️ 表已存在，跳过创建: ${file}`)
            } else {
              throw error
            }
          }
        }
      }
      
      console.log(`✅ 完成迁移: ${file}`)
    }
    
    console.log('🎉 所有MySQL迁移完成！')
    
  } catch (error) {
    console.error('❌ 迁移失败:', error.message)
    process.exit(1)
  }
}

// 运行迁移
migrateMySQL()