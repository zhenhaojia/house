# 易居：各地租房推荐平台 (EasyRent)

基于需求文档创建的MVP版本住房推荐网站。

## 项目结构

```
easyrent-housing-platform/
├── backend/          # 后端API服务 (Node.js + Express)
├── frontend/         # 前端界面 (React + Vite)
├── database/         # 数据库配置和迁移文件
├── docs/            # 项目文档
└── package.json     # 根项目配置
```

## 功能特性

### 租客前台模块
- 首页搜索和热门城市推荐
- 房源列表页（筛选、排序、分页）
- 房源详情页（图片画廊、详细信息、联系方式）

### 房源管理后台模块
- 管理员登录认证
- 房源CRUD操作
- 图片上传和管理

## 技术栈

**前端：**
- React 18 + TypeScript
- Vite 构建工具
- Tailwind CSS 样式框架
- React Router 路由管理

**后端：**
- Node.js + Express
- MySQL 数据库
- JWT 认证
- Multer 文件上传

## 快速开始

1. 安装依赖：
```bash
npm run install:all
```

2. 配置环境变量：
```bash
# 复制并配置后端环境变量
cp backend/.env.example backend/.env

# 复制并配置前端环境变量  
cp frontend/.env.example frontend/.env
```

3. 启动开发服务器：
```bash
npm run dev
```

4. 访问应用：
- 前台界面：http://localhost:3000
- 后台管理：http://localhost:3000/admin
- API服务：http://localhost:8000

## 数据库设置

项目使用MySQL数据库，请确保已安装并运行MySQL服务，然后执行：

```bash
# 创建数据库
mysql -u root -p -e "CREATE DATABASE easyrent;"

# 运行数据库迁移
cd backend && npm run db:migrate
```

## 开发指南

详细开发文档请参考 `docs/` 目录下的文件。