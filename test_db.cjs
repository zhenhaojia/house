const mysql = require('mysql2/promise');

async function testDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '200506050012zhj.',
      database: 'easyrent'
    });

    console.log('✅ 数据库连接成功');
    
    // 检查用户表是否存在
    const [tables] = await connection.execute('SHOW TABLES LIKE "users"');
    console.log('📊 用户表检查:', tables.length > 0 ? '✅ 存在' : '❌ 不存在');
    
    if (tables.length > 0) {
      // 检查表结构
      const [columns] = await connection.execute('DESCRIBE users');
      console.log('📋 用户表结构:', columns.map(col => col.Field));
      
      // 检查是否有重复用户
      const [existing] = await connection.execute('SELECT id FROM users WHERE username = ? OR email = ?', ['testlandlord', 'test@test.com']);
      console.log('🔍 重复用户检查:', existing.length > 0 ? '⚠️ 存在重复' : '✅ 无重复');
      
      // 尝试插入测试数据
      try {
        const passwordHash = await require('bcrypt').hash('123456', 10);
        const [result] = await connection.execute(
          'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
          ['testlandlord', 'test@test.com', passwordHash, 'landlord']
        );
        console.log('✅ 测试数据插入成功，ID:', result.insertId);
      } catch (insertError) {
        console.log('❌ 插入测试数据失败:', insertError.message);
      }
    }
    
    await connection.end();
  } catch (error) {
    console.error('❌ 数据库错误:', error.message);
  }
}

testDatabase();