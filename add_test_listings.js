// 通过API添加测试房源数据
const testListings = [
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
    title: '浦东新区陆家嘴江景房',
    city: '上海',
    district: '浦东新区',
    address: '陆家嘴金融中心',
    price: 15000,
    area: 95,
    houseType: '3室2厅2卫',
    description: '陆家嘴金融中心江景房，视野开阔，精装修，高端社区，安保完善。',
    contactName: '李女士',
    contactPhone: '13900139001',
    contactWechat: 'li139001',
    status: 'published'
  },
  {
    title: '长安区裕华路精装两房',
    city: '石家庄',
    district: '长安区',
    address: '裕华路与建设大街交叉口',
    price: 2800,
    area: 75,
    houseType: '2室1厅1卫',
    description: '长安区核心地段，精装修两房，家具家电齐全，交通便利，生活配套设施完善。',
    contactName: '王先生',
    contactPhone: '13700137001',
    contactWechat: 'wang137001',
    status: 'published'
  },
  {
    title: '桥西区新百广场附近公寓',
    city: '石家庄',
    district: '桥西区',
    address: '新百广场商圈',
    price: 2200,
    area: 60,
    houseType: '1室1厅1卫',
    description: '新百广场商圈单身公寓，精装修，拎包入住，周边商业配套齐全。',
    contactName: '赵女士',
    contactPhone: '13600136001',
    contactWechat: 'zhao136001',
    status: 'published'
  },
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
    status: 'pending'
  }
];

console.log('测试房源数据已准备好：');
testListings.forEach((listing, index) => {
  console.log(`${index + 1}. ${listing.title} - ${listing.city} - ¥${listing.price}/月`);
});

console.log('\n您可以通过以下方式添加这些房源：');
console.log('1. 确保后端服务正在运行 (http://localhost:8000)');
console.log('2. 使用管理员账号登录后台');
console.log('3. 逐个添加上述房源数据');
console.log('\n或者使用以下curl命令批量添加：');

testListings.forEach((listing, index) => {
  const curlCommand = `curl -X POST http://localhost:8000/api/listings \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(listing)}'`;
  
  console.log(`\n房源 ${index + 1}:`);
  console.log(curlCommand);
});