const mysql = require('mysql2/promise');

async function checkConstraints() {
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

    // 查询users表的约束信息
    console.log('\n🔍 查询users表约束信息...');
    
    // 方法1: 查询检查约束
    try {
      const [constraints] = await connection.execute(`
        SELECT CONSTRAINT_NAME, CHECK_CLAUSE 
        FROM information_schema.CHECK_CONSTRAINTS 
        WHERE CONSTRAINT_SCHEMA = 'easyrent' AND TABLE_NAME = 'users'
      `);
      
      if (constraints.length > 0) {
        console.log('📋 检查约束:');
        constraints.forEach(constraint => {
          console.log(`  约束名: ${constraint.CONSTRAINT_NAME}`);
          console.log(`  检查条件: ${constraint.CHECK_CLAUSE}`);
          console.log('');
        });
      } else {
        console.log('ℹ️ 未找到检查约束');
      }
    } catch (error) {
      console.log('ℹ️ 无法查询检查约束表，可能MySQL版本不支持');
    }

    // 方法2: 查看表结构
    console.log('\n📋 users表结构:');
    const [columns] = await connection.execute('DESCRIBE users');
    columns.forEach(col => {
      console.log(`  ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });

    // 方法3: 查看表创建语句
    console.log('\n📝 users表创建语句:');
    const [tables] = await connection.execute("SHOW CREATE TABLE users");
    console.log(tables[0]['Create Table']);

    await connection.end();
    
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    console.error('详细错误信息:', error);
  }
}

checkConstraints().catch(console.error);