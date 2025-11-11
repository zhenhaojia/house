// 为每个城市创建测试房源数据
const axios = require('axios');

// 主要城市列表
const mainCities = [
  '北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '重庆', '武汉', '西安',
  '天津', '苏州', '郑州', '长沙', '沈阳', '青岛', '大连', '厦门', '福州', '合肥',
  '无锡', '宁波', '佛山', '东莞', '济南', '石家庄', '太原', '长春', '哈尔滨', '南昌'
];

// 生成测试房源数据
function generateCityListings() {
  const listings = [];
  
  mainCities.forEach(city => {
    // 为每个城市生成2-3个房源
    const cityCount = Math.floor(Math.random() * 2) + 2; // 2-3个房源
    
    for (let i = 0; i < cityCount; i++) {
      const district = generateDistrict(city);
      const price = generatePrice(city);
      const area = generateArea();
      const houseType = generateHouseType();
      
      listings.push({
        title: `${district}${generateTitleSuffix(houseType)}`,
        city: city,
        district: district,
        address: generateAddress(district),
        price: price,
        area: area,
        houseType: houseType,
        description: generateDescription(city, district, houseType, price, area),
        contactName: generateContactName(),
        contactPhone: generatePhone(),
        contactWechat: generateWechat(),
        status: 'published'
      });
    }
  });
  
  return listings;
}

// 辅助函数
function generateDistrict(city) {
  const districts = {
    '北京': ['朝阳区', '海淀区', '西城区', '东城区', '丰台区', '石景山区', '通州区'],
    '上海': ['浦东新区', '徐汇区', '长宁区', '静安区', '普陀区', '虹口区', '杨浦区'],
    '广州': ['天河区', '越秀区', '海珠区', '荔湾区', '白云区', '黄埔区', '番禺区'],
    '深圳': ['南山区', '福田区', '罗湖区', '宝安区', '龙岗区', '盐田区', '龙华区'],
    '杭州': ['上城区', '下城区', '西湖区', '拱墅区', '江干区', '滨江区', '萧山区'],
    '南京': ['玄武区', '秦淮区', '建邺区', '鼓楼区', '浦口区', '栖霞区', '雨花台区'],
    '成都': ['锦江区', '青羊区', '金牛区', '武侯区', '成华区', '龙泉驿区', '青白江区'],
    '重庆': ['渝中区', '大渡口区', '江北区', '沙坪坝区', '九龙坡区', '南岸区', '北碚区'],
    '武汉': ['江岸区', '江汉区', '硚口区', '汉阳区', '武昌区', '青山区', '洪山区'],
    '西安': ['新城区', '碑林区', '莲湖区', '灞桥区', '未央区', '雁塔区', '阎良区']
  };
  
  if (districts[city]) {
    return districts[city][Math.floor(Math.random() * districts[city].length)];
  }
  
  // 默认返回区
  const defaultDistricts = ['中心区', '主城区', '新区', '开发区'];
  return defaultDistricts[Math.floor(Math.random() * defaultDistricts.length)];
}

function generatePrice(city) {
  const basePrices = {
    '北京': 8000, '上海': 8500, '深圳': 8000, '广州': 6000,
    '杭州': 5000, '南京': 4500, '成都': 3500, '重庆': 3000,
    '武汉': 3500, '西安': 3000
  };
  
  const basePrice = basePrices[city] || 3500;
  return Math.floor(basePrice * (0.8 + Math.random() * 0.4)); // 价格浮动20%
}

function generateArea() {
  const areas = [45, 60, 75, 85, 95, 105, 120, 140];
  return areas[Math.floor(Math.random() * areas.length)];
}

function generateHouseType() {
  const types = ['1室1厅1卫', '2室1厅1卫', '2室2厅1卫', '3室2厅2卫', '4室2厅2卫'];
  return types[Math.floor(Math.random() * types.length)];
}

function generateTitleSuffix(houseType) {
  const suffixes = ['精装公寓', '温馨住宅', '豪华小区', '优质房源', '精品住宅'];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  return `${houseType}${suffix}`;
}

function generateAddress(district) {
  const streets = ['人民路', '建设大街', '中山路', '解放路', '和平路', '青年路', '文化路'];
  const street = streets[Math.floor(Math.random() * streets.length)];
  const number = Math.floor(Math.random() * 200) + 1;
  return `${district}${street}${number}号`;
}

function generateDescription(city, district, houseType, price, area) {
  const templates = [
    `${city}${district}${houseType}，面积${area}㎡，月租金${price}元。地理位置优越，交通便利，周边配套设施齐全。`,
    `位于${city}${district}的${houseType}，面积${area}平方米，月租${price}元。户型方正，采光良好，生活便利。`,
    `${houseType}位于${city}${district}，面积${area}㎡，租金${price}元/月。周边商业氛围浓厚，生活配套设施完善。`
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateContactName() {
  const surnames = ['张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴'];
  const names = ['先生', '女士', '经理', '老师', '房东'];
  return surnames[Math.floor(Math.random() * surnames.length)] + names[Math.floor(Math.random() * names.length)];
}

function generatePhone() {
  return '1' + Math.floor(Math.random() * 9) + '9' + 
         Math.floor(Math.random() * 10) + '00' + 
         Math.floor(Math.random() * 10000).toString().padStart(4, '0');
}

function generateWechat() {
  const prefixes = ['wx', 'wechat', ''];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const numbers = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return prefix + numbers;
}

// 批量添加房源
async function batchAddListings() {
  const listings = generateCityListings();
  const baseURL = 'http://localhost:8000/api/listings';
  
  console.log(`将为 ${mainCities.length} 个城市创建 ${listings.length} 个房源...`);
  
  for (let i = 0; i < listings.length; i++) {
    const listing = listings[i];
    
    try {
      const response = await axios.post(baseURL, listing);
      
      if (response.data.success) {
        console.log(`✓ [${i + 1}/${listings.length}] 成功添加: ${listing.city} - ${listing.title}`);
      } else {
        console.log(`✗ [${i + 1}/${listings.length}] 添加失败: ${listing.city} - ${response.data.error}`);
      }
    } catch (error) {
      console.log(`✗ [${i + 1}/${listings.length}] 网络错误: ${listing.city} - ${error.message}`);
    }
    
    // 避免请求过快
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n房源添加完成！');
  console.log(`总计: ${listings.length} 个房源，覆盖 ${mainCities.length} 个城市`);
}

// 导出数据供手动检查
const allListings = generateCityListings();
console.log('生成的房源数据:');
console.log(JSON.stringify(allListings, null, 2));

console.log('\n房源统计:');
const cityStats = {};
allListings.forEach(listing => {
  cityStats[listing.city] = (cityStats[listing.city] || 0) + 1;
});

Object.entries(cityStats).forEach(([city, count]) => {
  console.log(`${city}: ${count} 个房源`);
});

console.log(`\n总房源数: ${allListings.length}`);
console.log(`覆盖城市数: ${Object.keys(cityStats).length}`);

// 如果直接运行此脚本，则执行批量添加
if (require.main === module) {
  batchAddListings().catch(console.error);
}

module.exports = { generateCityListings, batchAddListings };