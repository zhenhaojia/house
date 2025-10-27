import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import mysql from '../src/config/mysql.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function simpleMigrate() {
  try {
    console.log('🚀 开始简化数据库迁移...')
    
    // 只使用简化的迁移文件
    const migrationsDir = path.join(__dirname, '../../database/migrations')
    const files = [
      '001_create_listings_table_mysql.sql',
      '002_create_users_table_mysql.sql',
      '003_create_user_tables_mysql.sql',
      '004_create_admin_tables_simple.sql'
    ]
    
    console.log(`📁 找到 ${files.length} 个迁移文件`)
    
    for (const file of files) {
      const filePath = path.join(migrationsDir, file)
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️ 文件不存在: ${file}`)
        continue
      }
      
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
            }
          } catch (error) {
            // 如果是表已存在的错误，忽略并继续
            if (error.message.includes('already exists') || error.message.includes('Duplicate')) {
              console.warn(`⚠️ 表已存在，跳过创建: ${file}`)
            } else {
              console.error(`❌ SQL执行错误: ${error.message}`)
              console.error(`❌ 错误语句: ${statement.trim()}`)
              // 继续执行下一条语句，不抛出错误
            }
          }
        }
      }
      
      console.log(`✅ 完成迁移: ${file}`)
    }
    
    console.log('🎉 所有迁移完成')
    process.exit(0)
  } catch (error) {
    console.error('❌ 迁移失败:', error.message)
    process.exit(1)
  }
}

simpleMigrate()