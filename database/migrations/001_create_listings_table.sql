-- 创建房源表
CREATE TABLE IF NOT EXISTS listings (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    address TEXT,
    price INTEGER NOT NULL CHECK (price > 0),
    house_type VARCHAR(50) NOT NULL,
    area INTEGER CHECK (area > 0),
    description TEXT,
    main_image_url VARCHAR(500),
    image_urls TEXT[], -- 存储多个图片URL的数组
    contact_phone VARCHAR(20),
    contact_wechat VARCHAR(100),
    features TEXT[], -- 房源特色标签
    amenities TEXT[], -- 配套设施
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    view_count INTEGER DEFAULT 0,
    inquiry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER, -- 创建者ID（关联用户表）
    
    -- 创建索引以提高查询性能
    CONSTRAINT listings_price_check CHECK (price > 0),
    CONSTRAINT listings_area_check CHECK (area > 0)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_listings_city ON listings(city);
CREATE INDEX IF NOT EXISTS idx_listings_district ON listings(district);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at);
CREATE INDEX IF NOT EXISTS idx_listings_city_district ON listings(city, district);

-- 创建全文搜索索引（用于标题和描述的搜索）
CREATE INDEX IF NOT EXISTS idx_listings_search ON listings USING gin(
    to_tsvector('simple', title || ' ' || description)
);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();