// 批量添加各城市房源数据的简化版本
const axios = require('axios');

// 主要城市列表 - 为每个城市添加1-2个房源
const cityListings = [
  // 北京
  {
    title: '朝阳区国贸豪华公寓',
    city: '北京',
    district: '朝阳区',
    address: '国贸CBD核心区',
    price: 12000,
    area: 85,
    houseType: '2室1厅1卫',
    description: '国贸CBD核心区豪华公寓，精装修，家具家电齐全，交通便利，周边配套设施完善。',
    contactName: '张经理',
    contactPhone: '13800138001',
    contactWechat: 'zhang138001',
    status: 'published'
  },
  {
    title: '海淀区中关村科技园公寓',
    city: '北京',
    district: '海淀区',
    address: '中关村大街',
    price: 9500,
    area: 75,
    houseType: '2室1厅1卫',
    description: '中关村科技园附近优质公寓，适合IT从业者，交通便利，生活设施齐全。',
    contactName: '李女士',
    contactPhone: '13900139002',
    contactWechat: 'li139002',
    status: 'published'
  },
  
  // 上海
  {
    title: '浦东新区陆家嘴江景房',
    city: '上海',
    district: '浦东新区',
    address: '陆家嘴金融中心',
    price: 15000,
    area: 95,
    houseType: '3室2厅2卫',
    description: '陆家嘴金融中心江景房，视野开阔，精装修，高端社区，安保完善。',
    contactName: '王先生',
    contactPhone: '13700137001',
    contactWechat: 'wang137001',
    status: 'published'
  },
  
  // 广州
  {
    title: '天河区珠江新城豪华公寓',
    city: '广州',
    district: '天河区',
    address: '珠江新城核心区',
    price: 9800,
    area: 88,
    houseType: '2室2厅1卫',
    description: '珠江新城CBD豪华公寓，高端装修，视野开阔，生活便利。',
    contactName: '刘先生',
    contactPhone: '13400134001',
    contactWechat: 'liu134001',
    status: 'published'
  },
  
  // 深圳
  {
    title: '南山区科技园精装三房',
    city: '深圳',
    district: '南山区',
    address: '科技园南区',
    price: 8500,
    area: 105,
    houseType: '3室2厅2卫',
    description: '科技园核心区域，精装修三房，适合家庭居住，周边科技企业集中。',
    contactName: '陈经理',
    contactPhone: '13500135001',
    contactWechat: 'chen135001',
    status: 'published'
  },
  
  // 杭州
  {
    title: '西湖区西湖边公寓',
    city: '杭州',
    district: '西湖区',
    address: '西湖景区附近',
    price: 6800,
    area: 65,
    houseType: '1室1厅1卫',
    description: '西湖景区附近优质公寓，环境优美，适合旅游居住，生活便利。',
    contactName: '赵女士',
    contactPhone: '13600136001',
    contactWechat: 'zhao136001',
    status: 'published'
  },
  
  // 南京
  {
    title: '玄武区玄武湖旁公寓',
    city: '南京',
    district: '玄武区',
    address: '玄武湖公园附近',
    price: 5500,
    area: 70,
    houseType: '2室1厅1卫',
    description: '玄武湖旁优质公寓，环境优美，交通便利，适合居住。',
    contactName: '周先生',
    contactPhone: '13300133001',
    contactWechat: 'zhou133001',
    status: 'published'
  },
  
  // 成都
  {
    title: '锦江区春熙路商圈公寓',
    city: '成都',
    district: '锦江区',
    address: '春熙路商业街',
    price: 3800,
    area: 60,
    houseType: '1室1厅1卫',
    description: '春熙路商圈核心位置，商业氛围浓厚，生活便利，适合年轻人。',
    contactName: '吴女士',
    contactPhone: '13200132001',
    contactWechat: 'wu132001',
    status: 'published'
  },
  
  // 重庆
  {
    title: '渝中区解放碑商务公寓',
    city: '重庆',
    district: '渝中区',
    address: '解放碑步行街',
    price: 3200,
    area: 55,
    houseType: '1室1厅1卫',
    description: '解放碑商圈核心位置，商务氛围浓厚，交通便利，视野开阔。',
    contactName: '郑先生',
    contactPhone: '13100131001',
    contactWechat: 'zheng131001',
    status: 'published'
  },
  
  // 武汉
  {
    title: '武昌区东湖旁公寓',
    city: '武汉',
    district: '武昌区',
    address: '东湖风景区',
    price: 3500,
    area: 65,
    houseType: '2室1厅1卫',
    description: '东湖风景区附近优质公寓，环境优美，适合居住和休闲。',
    contactName: '孙女士',
    contactPhone: '13000130001',
    contactWechat: 'sun130001',
    status: 'published'
  },
  
  // 更多城市...
  {
    title: '西安雁塔区大唐不夜城公寓',
    city: '西安',
    district: '雁塔区',
    address: '大唐不夜城附近',
    price: 2800,
    area: 60,
    houseType: '1室1厅1卫',
    description: '大唐不夜城景区附近，文化氛围浓厚，交通便利。',
    contactName: '钱先生',
    contactPhone: '12900129001',
    contactWechat: 'qian129001',
    status: 'published'
  },
  {
    title: '天津和平区海河旁公寓',
    city: '天津',
    district: '和平区',
    address: '海河风景区',
    price: 4500,
    area: 70,
    houseType: '2室1厅1卫',
    description: '海河风景区附近优质公寓，环境优美，生活便利。',
    contactName: '冯女士',
    contactPhone: '12800128001',
    contactWechat: 'feng128001',
    status: 'published'
  },
  {
    title: '苏州工业园区金鸡湖畔公寓',
    city: '苏州',
    district: '工业园区',
    address: '金鸡湖畔',
    price: 5200,
    area: 75,
    houseType: '2室1厅1卫',
    description: '金鸡湖畔优质公寓，环境优美，适合商务人士居住。',
    contactName: '林先生',
    contactPhone: '12700127001',
    contactWechat: 'lin127001',
    status: 'published'
  }
];

// 批量添加房源
async function batchAddListings() {
  const baseURL = 'http://localhost:8000/api/listings';
  
  console.log(`将为 ${new Set(cityListings.map(l => l.city)).size} 个城市创建 ${cityListings.length} 个房源...`);
  console.log('正在添加房源数据，请确保后端服务正在运行...\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < cityListings.length; i++) {
    const listing = cityListings[i];
    
    try {
      const response = await axios.post(baseURL, listing);
      
      if (response.data.success) {
        console.log(`✓ [${i + 1}/${cityListings.length}] 成功添加: ${listing.city} - ${listing.title}`);
        successCount++;
      } else {
        console.log(`✗ [${i + 1}/${cityListings.length}] 添加失败: ${listing.city} - ${response.data.error}`);
        failCount++;
      }
    } catch (error) {
      console.log(`✗ [${i + 1}/${cityListings.length}] 网络错误: ${listing.city} - ${error.message}`);
      failCount++;
    }
    
    // 避免请求过快
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('\n=== 房源添加完成！ ===');
  console.log(`成功: ${successCount} 个房源`);
  console.log(`失败: ${failCount} 个房源`);
  
  // 统计各城市房源数量
  const cityStats = {};
  cityListings.forEach(listing => {
    cityStats[listing.city] = (cityStats[listing.city] || 0) + 1;
  });
  
  console.log('\n=== 各城市房源统计 ===');
  Object.entries(cityStats).forEach(([city, count]) => {
    console.log(`${city}: ${count} 个房源`);
  });
  
  console.log(`\n总覆盖城市数: ${Object.keys(cityStats).length}`);
  console.log('\n现在您可以访问 http://localhost:3000 查看所有城市房源了！');
}

// 显示将要添加的房源信息
console.log('=== 准备添加的城市房源信息 ===');
const cities = new Set(cityListings.map(l => l.city));
console.log(`覆盖城市: ${Array.from(cities).join(', ')}`);
console.log(`总房源数: ${cityListings.length}\n`);

console.log('房源详情:');
cityListings.forEach((listing, index) => {
  console.log(`${index + 1}. ${listing.city} - ${listing.title} - ¥${listing.price}/月`);
});

console.log('\n如果您想立即执行批量添加，请确保后端服务正在运行，然后执行:');
console.log('node batch_add_city_listings.js');

// 如果直接运行此脚本，则执行批量添加
if (require.main === module) {
  batchAddListings().catch(console.error);
}

module.exports = { cityListings, batchAddListings };