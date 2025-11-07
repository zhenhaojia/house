import mysql from 'mysql2/promise';

async function checkData() {
  try {
    // 数据库配置
    const dbConfig = {
      host: 'localhost',
      user: 'root',
      password: '123456',
      database: 'housing_db',
      port: 3306
    };
    
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 检查房源表数据
    const [listings] = await connection.execute('SELECT COUNT(*) as count FROM listings');
    console.log('📊 房源总数:', listings[0].count);
    
    // 检查河北石家庄的房源
    const [shijiazhuang] = await connection.execute('SELECT * FROM listings WHERE city LIKE ?', ['%石家庄%']);
    console.log('🏠 石家庄房源数量:', shijiazhuang.length);
    
    if (shijiazhuang.length > 0) {
      console.log('📋 石家庄房源详情:');
      shijiazhuang.forEach((item, index) => {
        console.log(`${index + 1}. ${item.title} - ${item.city} - ¥${item.price}/月`);
      });
    }
    
    // 检查所有房源
    const [allListings] = await connection.execute('SELECT id, title, city, price, status FROM listings ORDER BY id DESC LIMIT 10');
    console.log('📋 最新10条房源:');
    allListings.forEach((item, index) => {
      console.log(`${index + 1}. ${item.title} - ${item.city} - ¥${item.price}/月 - ${item.status}`);
    });
    
    await connection.end();
  } catch (error) {
    console.error('❌ 数据库检查失败:', error.message);
  }
}

checkData();