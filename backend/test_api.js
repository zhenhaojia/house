import mysql from 'mysql2/promise';

async function testDatabaseAPI() {
  try {
    console.log('🔗 连接到MySQL数据库...');
    
    const pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: '200506050012zhj.',
      database: 'easyrent'
    });

    const connection = await pool.getConnection();
    console.log('✅ 数据库连接成功');

    // 1. 测试房源查询API
    console.log('\n🏠 测试房源查询API:');
    const [listings] = await connection.execute('SELECT * FROM listings WHERE status = ?', ['published']);
    console.log(`📊 已发布房源数量: ${listings.length}`);
    
    if (listings.length > 0) {
      listings.forEach((listing, index) => {
        console.log(`  ${index + 1}. ${listing.title} - ${listing.city} ${listing.district} - ¥${listing.price}/月`);
      });
    }

    // 2. 测试用户查询API
    console.log('\n👥 测试用户查询API:');
    const [users] = await connection.execute('SELECT id, username, email, role FROM users');
    console.log(`📊 用户总数: ${users.length}`);
    
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.username} (${user.email}) - 角色: ${user.role}`);
    });

    // 3. 测试搜索功能API
    console.log('\n🔍 测试搜索功能API:');
    const [searchResults] = await connection.execute(
      'SELECT * FROM listings WHERE status = ? AND (title LIKE ? OR description LIKE ?) ORDER BY created_at DESC LIMIT 5', 
      ['published', '%公寓%', '%公寓%']
    );
    console.log(`📊 搜索"公寓"结果数量: ${searchResults.length}`);

    // 4. 测试统计功能API
    console.log('\n📈 测试统计功能API:');
    const [stats] = await connection.execute(
      'SELECT city, COUNT(*) as count, AVG(price) as avg_price FROM listings WHERE status = ? GROUP BY city', 
      ['published']
    );
    console.log('📊 各城市房源统计:');
    stats.forEach(stat => {
      console.log(`  ${stat.city}: ${stat.count}套房源，平均价格: ¥${Math.round(stat.avg_price)}/月`);
    });

    // 5. 测试插入新数据API
    console.log('\n➕ 测试插入新数据API:');
    const newListing = {
      title: '测试房源 - 朝阳区精装公寓',
      city: '北京',
      district: '朝阳区',
      address: '朝阳门外大街',
      price: 8000,
      house_type: '2室1厅',
      area: 85,
      description: '精装修，设施齐全，交通便利',
      status: 'published'
    };

    const [insertResult] = await connection.execute(
      'INSERT INTO listings (title, city, district, address, price, house_type, area, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [newListing.title, newListing.city, newListing.district, newListing.address, newListing.price, newListing.house_type, newListing.area, newListing.description, newListing.status]
    );
    console.log(`✅ 新房源插入成功，ID: ${insertResult.insertId}`);

    // 6. 验证新插入的数据
    const [verifyListing] = await connection.execute('SELECT * FROM listings WHERE id = ?', [insertResult.insertId]);
    console.log(`✅ 验证新房源: ${verifyListing[0].title} - ¥${verifyListing[0].price}/月`);

    // 7. 测试更新数据API
    console.log('\n✏️ 测试更新数据API:');
    const [updateResult] = await connection.execute(
      'UPDATE listings SET price = ? WHERE id = ?',
      [8500, insertResult.insertId]
    );
    console.log(`✅ 房源价格更新成功，影响行数: ${updateResult.affectedRows}`);

    // 8. 测试删除数据API
    console.log('\n🗑️ 测试删除数据API:');
    const [deleteResult] = await connection.execute('DELETE FROM listings WHERE id = ?', [insertResult.insertId]);
    console.log(`✅ 测试房源删除成功，影响行数: ${deleteResult.affectedRows}`);

    connection.release();
    console.log('\n🎉 所有API测试完成！');
    console.log('📊 数据库连接正常，所有CRUD操作成功执行');

  } catch (error) {
    console.error('❌ API测试错误:', error.message);
  }
}

testDatabaseAPI();