-- 添加联系人姓名字段到房源表
ALTER TABLE listings ADD COLUMN contact_name VARCHAR(100) AFTER contact_wechat;