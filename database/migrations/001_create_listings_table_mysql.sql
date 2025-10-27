-- 创建房源表 (MySQL版本)
CREATE TABLE IF NOT EXISTS listings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    address TEXT,
    price INT NOT NULL CHECK (price > 0),
    house_type VARCHAR(50) NOT NULL,
    area INT CHECK (area > 0),
    description TEXT,
    main_image_url VARCHAR(500),
    contact_phone VARCHAR(20),
    contact_wechat VARCHAR(100),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    view_count INT DEFAULT 0,
    inquiry_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT, -- 创建者ID（关联用户表）
    
    -- 创建索引以提高查询性能
    INDEX idx_listings_city (city),
    INDEX idx_listings_district (district),
    INDEX idx_listings_price (price),
    INDEX idx_listings_status (status),
    INDEX idx_listings_created_at (created_at),
    INDEX idx_listings_city_district (city, district),
    FULLTEXT INDEX idx_listings_search (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;