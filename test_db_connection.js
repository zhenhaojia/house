import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'easyrent',
  connectTimeout: 10000
};

async function testConnection() {
  try {
    console.log('🔍 测试数据库连接...');
    console.log('连接配置:', {
      host: config.host,
      port: config.port,
      user: config.user,
      database: config.database
    });
    
    const connection = await mysql.createConnection(config);
    console.log('✅ MySQL数据库连接成功');
    
    // 测试查询
    const [rows] = await connection.execute('SELECT 1 as status');
    console.log('✅ 基础查询测试成功:', rows);
    
    // 检查数据库是否存在
    const [dbs] = await connection.execute('SHOW DATABASES');
    console.log('📊 可用数据库:', dbs.map(db => db.Database));
    
    // 检查easyrent数据库的表
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 easyrent数据库表:', tables.map(t => t.Tables_in_easyrent));
    
    // 检查users表结构
    if (tables.some(t => t.Tables_in_easyrent === 'users')) {
      const [userColumns] = await connection.execute('DESCRIBE users');
      console.log('👤 users表结构:', userColumns);
      
      // 检查用户数据
      const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
      console.log('📊 users表记录数:', users[0].count);
    }
    
    // 检查listings表结构
    if (tables.some(t => t.Tables_in_easyrent === 'listings')) {
      const [listingColumns] = await connection.execute('DESCRIBE listings');
      console.log('🏠 listings表结构:', listingColumns);
      
      // 检查房源数据
      const [listings] = await connection.execute('SELECT COUNT(*) as count FROM listings');
      console.log('📊 listings表记录数:', listings[0].count);
    }
    
    await connection.end();
    console.log('✅ 数据库测试完成');
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    console.error('详细错误信息:', error);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('🎉 数据库连接和操作测试成功');
  } else {
    console.log('💥 数据库测试失败');
  }
  process.exit(success ? 0 : 1);
});