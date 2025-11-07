#!/bin/bash

# 易居租房平台部署脚本
set -e

echo "🚀 开始部署易居租房平台..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查Docker是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装，请先安装Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose未安装，请先安装Docker Compose"
        exit 1
    fi
    
    log_info "Docker环境检查通过"
}

# 构建应用
build_app() {
    log_info "开始构建应用..."
    
    # 安装依赖
    log_info "安装前端依赖..."
    cd frontend && npm ci && cd ..
    
    log_info "安装后端依赖..."
    cd backend && npm ci && cd ..
    
    # 构建前端
    log_info "构建前端应用..."
    cd frontend && npm run build && cd ..
    
    log_info "应用构建完成"
}

# 启动服务
start_services() {
    log_info "启动Docker服务..."
    
    # 停止现有服务
    docker-compose down
    
    # 启动服务
    docker-compose up -d
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 30
    
    # 检查服务状态
    if docker-compose ps | grep -q "Up"; then
        log_info "服务启动成功"
    else
        log_error "服务启动失败"
        exit 1
    fi
}

# 运行数据库迁移
run_migrations() {
    log_info "运行数据库迁移..."
    
    # 等待数据库就绪
    log_info "等待数据库就绪..."
    sleep 10
    
    # 运行迁移
    cd backend && npm run db:migrate && cd ..
    
    log_info "数据库迁移完成"
}

# 健康检查
health_check() {
    log_info "进行健康检查..."
    
    # 检查后端API
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        log_info "后端API服务正常"
    else
        log_error "后端API服务异常"
        exit 1
    fi
    
    # 检查前端应用
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        log_info "前端应用服务正常"
    else
        log_error "前端应用服务异常"
        exit 1
    fi
    
    log_info "健康检查通过"
}

# 显示部署信息
show_deploy_info() {
    log_info "🎉 部署完成！"
    echo ""
    echo "📊 服务访问地址："
    echo "   前端应用：http://localhost:3000"
    echo "   后端API：http://localhost:8000"
    echo "   健康检查：http://localhost:8000/health"
    echo ""
    echo "🔧 管理信息："
    echo "   查看服务状态：docker-compose ps"
    echo "   查看服务日志：docker-compose logs -f"
    echo "   停止服务：docker-compose down"
    echo ""
    echo "📝 默认管理员账号："
    echo "   用户名：admin"
    echo "   密码：password"
    echo ""
    log_warn "请及时修改默认密码！"
}

# 主函数
main() {
    log_info "开始部署易居租房平台..."
    
    # 检查Docker环境
    check_docker
    
    # 构建应用
    build_app
    
    # 启动服务
    start_services
    
    # 运行数据库迁移
    run_migrations
    
    # 健康检查
    health_check
    
    # 显示部署信息
    show_deploy_info
}

# 执行主函数
main "$@"