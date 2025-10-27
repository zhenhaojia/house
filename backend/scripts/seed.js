import pool from '../src/config/database.js'

async function seedDatabase() {
  const client = await pool.connect()
  
  try {
    console.log('🌱 开始填充测试数据...')
    await client.query('BEGIN')

    // 插入测试房源数据
    const testListings = [
      {
        title: '南山区高新园精装两房',
        city: '深圳',
        district: '南山区',
        address: '高新园科技园南区',
        price: 6500,
        house_type: '2室1厅',
        area: 75,
        description: '精装修，家电齐全，近地铁站，周边配套设施完善。房间采光良好，通风透气，适合白领居住。',
        main_image_url: '/images/listing1.jpg',
        image_urls: ['/images/listing1-1.jpg', '/images/listing1-2.jpg', '/images/listing1-3.jpg'],
        contact_phone: '138-1234-5678',
        contact_wechat: 'easyrent_138',
        features: ['精装修', '家电齐全', '近地铁', '拎包入住', '可短租'],
        amenities: ['WiFi', '空调', '洗衣机', '冰箱', '热水器', '电视'],
        status: 'published',
        view_count: 156,
        inquiry_count: 23
      },
      {
        title: '朝阳区国贸一室一厅',
        city: '北京',
        district: '朝阳区',
        address: '国贸CBD核心区',
        price: 8500,
        house_type: '1室1厅',
        area: 60,
        description: '豪华装修，视野开阔，交通便利，周边商业配套齐全，适合商务人士居住。',
        main_image_url: '/images/listing2.jpg',
        image_urls: ['/images/listing2-1.jpg', '/images/listing2-2.jpg'],
        contact_phone: '139-8765-4321',
        contact_wechat: 'easyrent_139',
        features: ['豪华装修', '视野开阔', '交通便利', '商务区'],
        amenities: ['WiFi', '空调', '洗衣机', '冰箱', '热水器', '电视', '健身房'],
        status: 'published',
        view_count: 89,
        inquiry_count: 15
      },
      {
        title: '浦东新区陆家嘴江景房',
        city: '上海',
        district: '浦东新区',
        address: '陆家嘴金融贸易区',
        price: 12000,
        house_type: '3室2厅',
        area: 120,
        description: '豪华江景房，正对黄浦江，视野极佳，精装修，家电品牌齐全，适合高端人士居住。',
        main_image_url: '/images/listing3.jpg',
        image_urls: ['/images/listing3-1.jpg', '/images/listing3-2.jpg', '/images/listing3-3.jpg'],
        contact_phone: '136-5555-6666',
        contact_wechat: 'easyrent_136',
        features: ['江景房', '豪华装修', '金融区', '高端社区'],
        amenities: ['WiFi', '空调', '洗衣机', '冰箱', '热水器', '电视', '健身房', '游泳池'],
        status: 'published',
        view_count: 234,
        inquiry_count: 45
      }
    ]

    for (const listing of testListings) {
      await client.query(
        `INSERT INTO listings (
          title, city, district, address, price, house_type, area, description,
          main_image_url, image_urls, contact_phone, contact_wechat, features,
          amenities, status, view_count, inquiry_count, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          listing.title,
          listing.city,
          listing.district,
          listing.address,
          listing.price,
          listing.house_type,
          listing.area,
          listing.description,
          listing.main_image_url,
          listing.image_urls,
          listing.contact_phone,
          listing.contact_wechat,
          listing.features,
          listing.amenities,
          listing.status,
          listing.view_count,
          listing.inquiry_count
        ]
      )
    }

    console.log(`✅ 成功插入 ${testListings.length} 条测试房源数据`)

    await client.query('COMMIT')
    console.log('🎉 数据库填充完成')

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ 数据填充失败:', error)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

seedDatabase().catch(console.error)