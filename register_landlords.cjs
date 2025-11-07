// 直接通过数据库注册三个房东账号
const mysql = require('mysql2/promise')
const bcrypt = require('bcryptjs')

const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '200506050012zhj.',
    database: 'easyrent'
}

const landlords = [
    {
        username: 'landlord1',
        email: 'landlord1@example.com',
        password: '123456',
        phone: '13800138001',
        role: 'landlord'
    },
    {
        username: 'landlord2',
        email: 'landlord2@example.com',
        password: '123456',
        phone: '13800138002',
        role: 'landlord'
    },
    {
        username: 'landlord3',
        email: 'landlord3@example.com',
        password: '123456',
        phone: '13800138003',
        role: 'landlord'
    }
]

async function registerLandlords() {
    let connection
    try {
        connection = await mysql.createConnection(dbConfig)
        console.log('数据库连接成功')
        
        for (const landlord of landlords) {
            // 检查用户是否已存在
            const [existingUsers] = await connection.execute(
                'SELECT id FROM users WHERE username = ? OR email = ?',
                [landlord.username, landlord.email]
            )
            
            if (existingUsers.length > 0) {
                console.log(`用户 ${landlord.username} 已存在，跳过注册`)
                continue
            }
            
            // 加密密码
            const saltRounds = 10
            const passwordHash = await bcrypt.hash(landlord.password, saltRounds)
            
            // 插入用户
            const [result] = await connection.execute(
                'INSERT INTO users (username, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
                [landlord.username, landlord.email, passwordHash, landlord.phone, landlord.role]
            )
            
            console.log(`✅ 成功注册房东账号: ${landlord.username} (ID: ${result.insertId})`)
        }
        
        console.log('\n🎉 所有房东账号注册完成！')
        console.log('\n房东账号信息：')
        console.log('1. landlord1 - 密码: 123456 - 手机: 13800138001')
        console.log('2. landlord2 - 密码: 123456 - 手机: 13800138002')
        console.log('3. landlord3 - 密码: 123456 - 手机: 13800138003')
        
    } catch (error) {
        console.error('注册失败:', error)
    } finally {
        if (connection) {
            await connection.end()
        }
    }
}

// 运行注册函数
registerLandlords()