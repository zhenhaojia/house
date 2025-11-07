-- 直接通过SQL插入三个房东账号
-- 使用bcryptjs生成密码哈希（密码：123456）

-- 检查用户表是否存在
SELECT '开始注册房东账号...' as status;

-- 检查是否已存在这些用户
SELECT username, email FROM users WHERE username IN ('landlord1', 'landlord2', 'landlord3') OR email IN ('landlord1@example.com', 'landlord2@example.com', 'landlord3@example.com');

-- 插入第一个房东账号（密码：123456）
INSERT INTO users (username, email, password_hash, phone, role, created_at) 
VALUES ('landlord1', 'landlord1@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '13800138001', 'landlord', NOW());

-- 插入第二个房东账号（密码：123456）
INSERT INTO users (username, email, password_hash, phone, role, created_at) 
VALUES ('landlord2', 'landlord2@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '13800138002', 'landlord', NOW());

-- 插入第三个房东账号（密码：123456）
INSERT INTO users (username, email, password_hash, phone, role, created_at) 
VALUES ('landlord3', 'landlord3@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '13800138003', 'landlord', NOW());

-- 验证插入结果
SELECT '房东账号注册完成！' as status;
SELECT id, username, email, phone, role, created_at FROM users WHERE role = 'landlord' ORDER BY id DESC;