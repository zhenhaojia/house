-- 创建用户相关表 (MySQL版本)

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar VARCHAR(255),
  status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
  last_active DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_status (status)
);

-- 用户收藏表
CREATE TABLE IF NOT EXISTS user_favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  listing_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_listing (user_id, listing_id),
  INDEX idx_user_id (user_id),
  INDEX idx_listing_id (listing_id)
);

-- 用户浏览历史表
CREATE TABLE IF NOT EXISTS user_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  listing_id INT NOT NULL,
  viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_viewed_at (viewed_at)
);

-- 用户反馈表
CREATE TABLE IF NOT EXISTS user_feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('bug', 'suggestion', 'complaint', 'other') NOT NULL,
  content TEXT NOT NULL,
  contact VARCHAR(100),
  status ENUM('pending', 'reviewed', 'resolved') DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  INDEX idx_status (status)
);

-- 搜索历史表
CREATE TABLE IF NOT EXISTS search_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  keyword VARCHAR(255) NOT NULL,
  filters JSON,
  result_count INT,
  searched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_keyword (keyword),
  INDEX idx_searched_at (searched_at)
);

-- 插入默认管理员用户
INSERT INTO users (username, email, password_hash) VALUES 
('admin', 'admin@easyrent.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- 插入测试用户
INSERT INTO users (username, email, password_hash, phone) VALUES 
('testuser', 'test@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '13800138000'),
('张三', 'zhangsan@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '13900139000');

-- 插入测试收藏数据（使用实际存在的用户ID）
INSERT INTO user_favorites (user_id, listing_id) VALUES 
(1, 1), (1, 2), (1, 3);

-- 插入测试浏览历史
INSERT INTO user_history (user_id, listing_id, viewed_at) VALUES 
(1, 1, NOW()), (1, 2, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(1, 3, DATE_SUB(NOW(), INTERVAL 2 HOUR));

-- 插入测试搜索历史
INSERT INTO search_history (user_id, keyword, result_count) VALUES 
(1, '南山', 2), (1, '两房', 1), (1, '精装修', 3);