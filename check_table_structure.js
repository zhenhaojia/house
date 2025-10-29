// 检查数据库表结构
const mysql = require('mysql2/promise');

async function checkTableStructure() {
  try {
    const dbConfig = {
      host: 'localhost',
      user: 'root',
      password: '123456',
      database: 'housing_db',
      port: 3306
    };
    
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 检查表结构
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'listings' 
      AND TABLE_SCHEMA = 'housing_db'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('📊 listings表结构:');
    columns.forEach(col => {
      console.log(`${col.COLUMN_NAME} (${col.DATA_TYPE}) - ${col.IS_NULLABLE === 'YES' ? '可空' : '非空'}`);
    });
    
    // 检查当前数据
    const [currentData] = await connection.execute('SELECT COUNT(*) as count FROM listings');
    console.log('📊 当前房源数量:', currentData[0].count);
    
    await connection.end();
  } catch (error) {
    console.error('❌ 检查表结构失败:', error.message);
  }
}

checkTableStructure();