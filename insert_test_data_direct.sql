-- 直接插入测试房源数据到数据库
USE housing_db;

-- 先检查当前数据
SELECT COUNT(*) as '当前房源数量' FROM listings;

-- 插入新的测试房源数据
INSERT INTO listings (
    title, city, district, address, price, house_type, area, 
    description, contact_name, contact_phone, contact_wechat, status, created_at
) VALUES 
('朝阳区国贸豪华公寓', '北京', '朝阳区', '国贸CBD核心区', 12000, '2室1厅1卫', 85, 
 '国贸CBD核心区豪华公寓，精装修，家具家电齐全，交通便利，周边配套设施完善。', 
 '张经理', '13800138001', 'zhang138001', 'published', NOW()),

('浦东新区陆家嘴江景房', '上海', '浦东新区', '陆家嘴金融中心', 15000, '3室2厅2卫', 95, 
 '陆家嘴金融中心江景房，视野开阔，精装修，高端社区，安保完善。', 
 '李女士', '13900139001', 'li139001', 'published', NOW()),

('长安区裕华路精装两房', '石家庄', '长安区', '裕华路与建设大街交叉口', 2800, '2室1厅1卫', 75, 
 '长安区核心地段，精装修两房，家具家电齐全，交通便利，生活配套设施完善。', 
 '王先生', '13700137001', 'wang137001', 'published', NOW()),

('桥西区新百广场附近公寓', '石家庄', '桥西区', '新百广场商圈', 2200, '1室1厅1卫', 60, 
 '新百广场商圈单身公寓，精装修，拎包入住，周边商业配套齐全。', 
 '赵女士', '13600136001', 'zhao136001', 'published', NOW()),

('南山区科技园精装三房', '深圳', '南山区', '科技园南区', 8500, '3室2厅2卫', 105, 
 '科技园核心区域，精装修三房，适合家庭居住，周边科技企业集中。', 
 '陈经理', '13500135001', 'chen135001', 'published', NOW()),

('天河区珠江新城豪华公寓', '广州', '天河区', '珠江新城核心区', 9800, '2室2厅1卫', 88, 
 '珠江新城CBD豪华公寓，高端装修，视野开阔，生活便利。', 
 '刘先生', '13400134001', 'liu134001', 'pending', NOW());

-- 检查插入后的数据
SELECT COUNT(*) as '插入后房源数量' FROM listings;

-- 查看石家庄的房源
SELECT id, title, city, district, price, house_type, status 
FROM listings 
WHERE city = '石家庄' 
ORDER BY id DESC;

-- 查看所有房源概览
SELECT id, title, city, price, status, created_at 
FROM listings 
ORDER BY id DESC 
LIMIT 10;