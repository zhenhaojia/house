-- 创建管理员审核日志表
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    listing_id INT NOT NULL,
    action VARCHAR(20) NOT NULL COMMENT '审核动作: approve/reject',
    reason TEXT COMMENT '拒绝原因',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 为listings表添加管理员相关字段
ALTER TABLE listings ADD COLUMN IF NOT EXISTS contact_name VARCHAR(100) DEFAULT '';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20) DEFAULT '';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8) NULL;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8) NULL;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'published' COMMENT '房源状态: pending/published/rejected/deleted';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS approved_by INT NULL;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP NULL;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_city ON listings(city);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_listing_id ON admin_audit_logs(listing_id);

-- 插入测试的管理员用户（如果users表存在且包含相应字段）
-- INSERT IGNORE INTO users (username, email, password, role, created_at) VALUES
-- ('admin', 'admin@easyrent.com', '$2b$10$examplehash', 'admin', NOW()),
-- ('moderator', 'moderator@easyrent.com', '$2b$10$examplehash', 'moderator', NOW());