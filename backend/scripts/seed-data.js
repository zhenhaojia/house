import mysql from '../src/config/mysql.js'

async function seedData() {
  try {
    console.log('🌱 开始添加测试数据...')
    
    // 插入测试房源数据
    const listings = [
      {
        title: '南山区高新园精装两房',
        city: '深圳',
        district: '南山区',
        price: 6500,
        house_type: '2室1厅',
        area: 75,
        description: '精装修，家电齐全，近地铁站，交通便利，周边配套设施完善',
        contact_name: '张先生',
        contact_phone: '138-0013-8000',
        status: 'published'
      },
      {
        title: '朝阳区国贸一室一厅',
        city: '北京',
        district: '朝阳区',
        price: 8500,
        house_type: '1室1厅',
        area: 60,
        description: '豪华装修，视野开阔，交通便利，近商业中心',
        contact_name: '李女士',
        contact_phone: '139-0013-9000',
        status: 'published'
      },
      {
        title: '天河区珠江新城三房',
        city: '广州',
        district: '天河区',
        price: 12000,
        house_type: '3室2厅',
        area: 120,
        description: '豪华装修，江景房，小区环境优美，配套设施齐全',
        contact_name: '王经理',
        contact_phone: '136-0013-7000',
        status: 'published'
      },
      {
        title: '西湖区西溪湿地公寓',
        city: '杭州',
        district: '西湖区',
        price: 5500,
        house_type: '1室0厅',
        area: 45,
        description: '精装修单身公寓，近西溪湿地，环境优美，适合年轻人',
        contact_name: '陈小姐',
        contact_phone: '137-0013-6000',
        status: 'published'
      },
      {
        title: '武侯区天府软件园附近',
        city: '成都',
        district: '武侯区',
        price: 3800,
        house_type: '2室1厅',
        area: 80,
        description: '简装修，近软件园，交通便利，生活设施齐全',
        contact_name: '刘先生',
        contact_phone: '135-0013-5000',
        status: 'published'
      }
    ]
    
    for (const listing of listings) {
      const result = await mysql.query(
        `INSERT INTO listings (title, city, district, price, house_type, area, description, contact_phone, status, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [listing.title, listing.city, listing.district, listing.price, listing.house_type, listing.area, listing.description, listing.contact_phone, listing.status]
      )
      
      if (result.success) {
        console.log(`✅ 添加房源: ${listing.title}`)
      }
    }
    
    console.log('🎉 测试数据添加完成')
    process.exit(0)
  } catch (error) {
    console.error('❌ 添加测试数据失败:', error.message)
    process.exit(1)
  }
}

seedData()