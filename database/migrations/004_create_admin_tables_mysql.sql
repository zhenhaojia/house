-- 创建管理员审核日志表
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    listing_id INT NOT NULL,
    action VARCHAR(20) NOT NULL COMMENT '审核动作: approve/reject',
    reason TEXT COMMENT '拒绝原因',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 为listings表添加管理员相关字段（简化版本）
ALTER TABLE listings ADD COLUMN IF NOT EXISTS contact_name VARCHAR(100) DEFAULT '';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20) DEFAULT '';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8) NULL;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8) NULL;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'published' COMMENT '房源状态: pending/published/rejected/deleted';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_city ON listings(city);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_listing_id ON admin_audit_logs(listing_id);

-- 插入测试的管理员用户
INSERT IGNORE INTO users (username, email, password, role, created_at) VALUES
('admin', 'admin@easyrent.com', '$2b$10$examplehash', 'admin', NOW()),
('moderator', 'moderator@easyrent.com', '$2b$10$examplehash', 'moderator', NOW());

-- 更新现有房源的状态和联系信息
UPDATE listings SET 
    status = 'published',
    contact_name = '房源管理员',
    contact_phone = '13800138000',
    updated_at = NOW()
WHERE status IS NULL;

-- 插入一些待审核的测试房源
INSERT IGNORE INTO listings (
    title, city, district, address, price, house_type, area, 
    description, images, contact_name, contact_phone, 
    status, created_at, updated_at
) VALUES 
(
    '待审核房源 - 朝阳区豪华公寓',
    '北京',
    '朝阳区',
    '朝阳门外大街',
    15000,
    '3室2厅',
    120,
    '豪华装修，设施齐全，交通便利，适合家庭居住',
    '["image1.jpg", "image2.jpg"]',
    '张经理',
    '13900139000',
    'pending',
    NOW(),
    NOW()
),
(
    '待审核房源 - 浦东新区商务楼',
    '上海',
    '浦东新区',
    '陆家嘴金融区',
    20000,
    '4室2厅',
    150,
    '高端商务楼，视野开阔，适合办公使用',
    '["image3.jpg", "image4.jpg"]',
    '李总监',
    '13700137000',
    'pending',
    NOW(),
    NOW()
);

-- 创建管理员功能视图
CREATE OR REPLACE VIEW admin_listing_stats AS
SELECT 
    status,
    COUNT(*) as count,
    AVG(price) as avg_price,
    MAX(price) as max_price,
    MIN(price) as min_price
FROM listings 
GROUP BY status;

-- 创建今日统计视图
CREATE OR REPLACE VIEW admin_today_stats AS
SELECT 
    COUNT(*) as today_listings,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_listings,
    COUNT(CASE WHEN status = 'published' THEN 1 END) as published_listings
FROM listings 
WHERE DATE(created_at) = CURDATE();