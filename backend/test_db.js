import mysql from 'mysql2/promise';

async function testDatabase() {
  try {
    const pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: '200506050012zhj.',
      database: 'easyrent'
    });

    console.log('🔗 测试数据库连接...');
    
    const connection = await pool.getConnection();
    console.log('✅ 数据库连接成功');
    
    // 测试查询表是否存在
    const [tables] = await connection.execute('SHOW TABLES LIKE "listings"');
    console.log('表查询结果:', tables);
    
    if (tables.length > 0) {
      console.log('✅ listings表存在');
      
      // 测试简单查询
      const [rows] = await connection.execute('SELECT COUNT(*) as count FROM listings');
      console.log('房源数量:', rows[0].count);
      
      // 测试带参数的查询
      const [rows2] = await connection.execute('SELECT * FROM listings WHERE status = ?', ['published']);
      console.log('已发布房源数量:', rows2.length);
      
      // 测试后端API使用的查询
      const [rows3] = await connection.execute('SELECT * FROM listings WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?', ['published', 10, 0]);
      console.log('分页查询结果数量:', rows3.length);
    } else {
      console.log('❌ listings表不存在');
    }
    
    connection.release();
    console.log('✅ 数据库测试完成');
    
  } catch (error) {
    console.error('❌ 数据库测试错误:', error.message);
    console.error('错误详情:', error);
  }
}

testDatabase();