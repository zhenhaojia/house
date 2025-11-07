// 使用后端已有的mysql2依赖来创建测试用户
import mysql from 'mysql2/promise';

async function createTestUser() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '123456',
      database: 'house_rental'
    });

    console.log('正在创建测试用户...');

    // 检查用户表是否存在
    const [tables] = await connection.execute("SHOW TABLES LIKE 'users'");
    if (tables.length === 0) {
      console.log('❌ users表不存在，请先创建数据库表结构');
      return;
    }

    // 检查是否已有用户
    const [existingUsers] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`当前用户数量: ${existingUsers[0].count}`);

    // 创建测试房东用户
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.default.hash('123456', 10);
    
    const [result] = await connection.execute(
      'INSERT INTO users (username, password_hash, email, phone, role, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      ['landlord1', passwordHash, 'landlord1@example.com', '13800138000', 'landlord']
    );

    console.log('✅ 测试用户创建成功！');
    console.log(`   用户名: landlord1`);
    console.log(`   密码: 123456`);
    console.log(`   角色: landlord`);

    await connection.end();

  } catch (error) {
    console.error('❌ 创建测试用户失败:', error.message);
    console.log('\n💡 可能的原因:');
    console.log('   1. MySQL服务未启动');
    console.log('   2. 数据库密码不正确');
    console.log('   3. house_rental数据库不存在');
    console.log('   4. users表结构不正确');
  }
}

createTestUser();