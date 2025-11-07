import mysql from 'mysql2/promise';

async function checkUsers() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '123456',
      database: 'house_rental'
    });

    console.log('正在检查数据库中的用户数据...\n');

    // 检查所有用户
    const [users] = await connection.execute('SELECT username, password_hash, role FROM users');
    
    if (users.length === 0) {
      console.log('❌ 数据库中没有用户数据！');
    } else {
      console.log('✅ 数据库中的用户数据:');
      users.forEach(user => {
        console.log(`   用户名: ${user.username}, 角色: ${user.role}, 密码哈希: ${user.password_hash.substring(0, 20)}...`);
      });
    }

    // 检查房东用户
    console.log('\n🔍 检查房东用户:');
    const [landlords] = await connection.execute('SELECT username, password_hash FROM users WHERE role = "landlord"');
    
    if (landlords.length === 0) {
      console.log('❌ 没有找到房东用户！');
    } else {
      console.log('✅ 找到的房东用户:');
      landlords.forEach(landlord => {
        console.log(`   用户名: ${landlord.username}, 密码哈希: ${landlord.password_hash.substring(0, 20)}...`);
      });
    }

    await connection.end();
    
    console.log('\n💡 建议:');
    if (users.length === 0) {
      console.log('   1. 运行 register_landlords.cjs 脚本创建测试用户');
      console.log('   2. 或者在前端注册新用户');
    } else {
      console.log('   请尝试使用上面列出的用户名进行登录');
    }

  } catch (error) {
    console.error('❌ 数据库连接错误:', error.message);
    console.log('\n💡 可能的原因:');
    console.log('   1. MySQL服务未启动');
    console.log('   2. 数据库密码不正确');
    console.log('   3. house_rental数据库不存在');
  }
}

checkUsers();