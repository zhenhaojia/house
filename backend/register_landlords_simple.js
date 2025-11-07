// 简单的Node.js脚本来注册房东账号
import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '200506050012zhj.',
    database: 'easyrent'
};

const sqlStatements = [
    "SELECT '开始注册房东账号...' as status",
    "SELECT username, email FROM users WHERE username IN ('landlord1', 'landlord2', 'landlord3') OR email IN ('landlord1@example.com', 'landlord2@example.com', 'landlord3@example.com')",
    "INSERT INTO users (username, email, password_hash, phone, role, created_at) VALUES ('landlord1', 'landlord1@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '13800138001', 'landlord', NOW())",
    "INSERT INTO users (username, email, password_hash, phone, role, created_at) VALUES ('landlord2', 'landlord2@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '13800138002', 'landlord', NOW())",
    "INSERT INTO users (username, email, password_hash, phone, role, created_at) VALUES ('landlord3', 'landlord3@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '13800138003', 'landlord', NOW())",
    "SELECT '房东账号注册完成！' as status",
    "SELECT id, username, email, phone, role, created_at FROM users WHERE role = 'landlord' ORDER BY id DESC"
];

async function executeSQL() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ 数据库连接成功');
        
        for (const sql of sqlStatements) {
            try {
                const [results] = await connection.execute(sql);
                if (Array.isArray(results)) {
                    if (results.length > 0) {
                        console.log('📊 查询结果:', results);
                    } else {
                        console.log('✅ SQL执行成功');
                    }
                } else {
                    console.log('✅ SQL执行成功');
                }
            } catch (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    console.log('⚠️ 用户已存在，跳过插入');
                } else {
                    console.error('❌ SQL执行错误:', error.message);
                }
            }
        }
        
        console.log('\n🎉 所有SQL语句执行完成！');
        
    } catch (error) {
        console.error('❌ 数据库连接失败:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

executeSQL();