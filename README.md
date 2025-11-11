# 房屋租赁管理系统

这是一个完整的房屋租赁管理系统，包含租客、房东和管理员功能。

## 功能特性

### 租客功能
- 浏览房源列表
- 查看房源详情
- 收藏喜欢的房源
- 联系房东（快速联系和详细咨询）
- 预约看房

### 房东功能
- 发布房源信息
- 管理房源状态
- 处理租客咨询
- 查看预约记录

### 管理员功能
- 用户管理
- 房源审核
- 系统配置
- 数据统计

## 技术栈

### 前端
- React.js
- Vite
- Ant Design
- Axios

### 后端
- Node.js
- Express.js
- MySQL
- JWT认证

## 快速开始

### 环境要求
- Node.js 16+
- MySQL 8.0+

### 安装依赖
```bash
# 前端
cd frontend
npm install

# 后端
cd backend
npm install
```

### 数据库配置
1. 创建MySQL数据库
2. 导入数据库脚本 `database/schema.sql`
3. 配置数据库连接信息

### 启动服务
```bash
# 启动后端服务
cd backend
npm start

# 启动前端服务
cd frontend
npm run dev
```

## 项目结构

```
house-master/
├── backend/           # 后端服务
├── frontend/          # 前端应用
├── database/          # 数据库脚本
├── docs/              # 项目文档
└── README.md          # 项目说明
```

## 部署

项目支持Docker部署，使用提供的`docker-compose.yml`文件即可快速部署。

---
*最后更新: 2025-11-11*