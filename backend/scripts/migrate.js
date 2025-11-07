import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import pool from '../src/config/database.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function runMigrations() {
  const client = await pool.connect()
  
  try {
    console.log('🚀 开始执行数据库迁移...')
    
    await client.query('BEGIN')

    // 创建迁移记录表
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 获取已执行的迁移
    const { rows: executedMigrations } = await client.query(
      'SELECT name FROM migrations ORDER BY name'
    )
    const executedNames = new Set(executedMigrations.map(m => m.name))

    // 读取迁移文件
    const migrationsDir = path.join(__dirname, '../../database/migrations')
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort()

    let executedCount = 0

    for (const file of files) {
      if (executedNames.has(file)) {
        console.log(`⏭️  跳过已执行的迁移: ${file}`)
        continue
      }

      console.log(`📝 执行迁移: ${file}`)
      
      const migrationPath = path.join(migrationsDir, file)
      const sql = fs.readFileSync(migrationPath, 'utf8')
      
      // 执行SQL文件
      await client.query(sql)
      
      // 记录迁移执行
      await client.query(
        'INSERT INTO migrations (name) VALUES ($1)',
        [file]
      )
      
      executedCount++
      console.log(`✅ 完成迁移: ${file}`)
    }

    await client.query('COMMIT')
    
    if (executedCount === 0) {
      console.log('✅ 所有迁移都已是最新版本')
    } else {
      console.log(`✅ 成功执行 ${executedCount} 个迁移文件`)
    }
    
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ 迁移执行失败:', error)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

runMigrations().catch(console.error)