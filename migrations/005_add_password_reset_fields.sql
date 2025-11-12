-- 添加密码重置相关字段到users表
ALTER TABLE users 
ADD COLUMN reset_token VARCHAR(255) NULL,
ADD COLUMN reset_token_expires DATETIME NULL,
ADD COLUMN last_password_change DATETIME DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN failed_login_attempts INT DEFAULT 0,
ADD COLUMN account_locked_until DATETIME NULL;

-- 创建索引优化查询性能
CREATE INDEX idx_users_reset_token ON users(reset_token);
CREATE INDEX idx_users_reset_token_expires ON users(reset_token_expires);
CREATE INDEX idx_users_account_locked ON users(account_locked_until);

-- 添加角色字段的枚举约束（如果尚未存在）
ALTER TABLE users 
MODIFY COLUMN role ENUM('admin', 'landlord', 'agent', 'user') NOT NULL DEFAULT 'user';

-- 更新现有用户的角色（如果角色字段为空）
UPDATE users SET role = 'agent' WHERE role IS NULL OR role = '';

-- 添加用户状态字段
ALTER TABLE users 
ADD COLUMN status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active';

-- 添加用户创建时间和最后修改时间
ALTER TABLE users 
ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 创建用户审计表
CREATE TABLE IF NOT EXISTS user_audit_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  action VARCHAR(50) NOT NULL,
  description TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建索引优化审计查询
CREATE INDEX idx_user_audit_user_id ON user_audit_log(user_id);
CREATE INDEX idx_user_audit_action ON user_audit_log(action);
CREATE INDEX idx_user_audit_created_at ON user_audit_log(created_at);

-- 插入默认管理员账户（如果不存在）
INSERT INTO users (username, email, password_hash, role, status) 
SELECT 'admin', 'admin@easyrent.com', '$2a$12$LQv3c1yqBz7QbZ5Z5Z5Z5u', 'admin', 'active'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin' OR email = 'admin@easyrent.com');

-- 注释说明
-- 密码哈希值: $2a$12$LQv3c1yqBz7QbZ5Z5Z5Z5u 对应的明文密码是 "admin123"
-- 在实际生产环境中，应该使用更复杂的密码并确保及时修改