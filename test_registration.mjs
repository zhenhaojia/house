import mysql from 'mysql2/promise';

async function testDatabaseConnection() {
  try {
    console.log('正在连接数据库...');
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '200506050012zhj.',
      database: 'easyrent'
    });

    console.log('✅ 数据库连接成功');

    // 检查users表是否存在
    const [tables] = await connection.execute("SHOW TABLES LIKE 'users'");
    if (tables.length === 0) {
      console.log('❌ users表不存在');
      return;
    }

    console.log('✅ users表存在');

    // 检查表结构
    const [columns] = await connection.execute('DESCRIBE users');
    console.log('\n📋 users表结构:');
    columns.forEach(col => {
      console.log(`  ${col.Field} (${col.Type})`);
    });

    // 检查现有用户
    const [users] = await connection.execute('SELECT id, username, email, role FROM users LIMIT 5');
    console.log('\n👥 现有用户:');
    if (users.length === 0) {
      console.log('  暂无用户数据');
    } else {
      users.forEach(user => {
        console.log(`  ID: ${user.id}, 用户名: ${user.username}, 邮箱: ${user.email}, 角色: ${user.role}`);
      });
    }

    // 测试插入新用户
    console.log('\n🧪 测试插入新用户...');
    try {
      const testUsername = 'testuser_' + Date.now();
      const testEmail = 'test_' + Date.now() + '@example.com';
      
      const [result] = await connection.execute(
        'INSERT INTO users (username, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
        [testUsername, testEmail, 'test_hash', '13800138000', 'tenant']
      );
      
      console.log('✅ 用户插入成功，ID:', result.insertId);
      
      // 清理测试数据
      await connection.execute('DELETE FROM users WHERE id = ?', [result.insertId]);
      console.log('✅ 测试数据已清理');
      
    } catch (insertError) {
      console.error('❌ 用户插入失败:', insertError.message);
      console.error('详细错误信息:', insertError);
    }

    await connection.end();
    
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    console.error('详细错误信息:', error);
  }
}

// 测试API注册功能
async function testApiRegistration() {
  console.log('\n🌐 测试API注册功能...');
  
  const testData = {
    username: 'apitest_' + Date.now(),
    email: 'apitest_' + Date.now() + '@example.com',
    password: '123456',
    phone: '13800138000'
  };

  try {
    const response = await fetch('http://localhost:8005/api/user/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log('API响应状态:', response.status);
    console.log('API响应数据:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ API注册成功');
    } else {
      console.log('❌ API注册失败:', result.error);
    }
    
  } catch (apiError) {
    console.error('❌ API调用失败:', apiError.message);
  }
}

// 运行测试
async function runTests() {
  console.log('🚀 开始测试租客注册功能...\n');
  
  await testDatabaseConnection();
  await testApiRegistration();
  
  console.log('\n🏁 测试完成');
}

runTests().catch(console.error);