#!/bin/bash

# V2.0 自动化部署脚本
# 支持腾讯云CloudBase和Vercel双平台部署

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# 显示帮助信息
show_help() {
    echo "V2.0 部署脚本使用说明"
    echo ""
    echo "用法: ./scripts/deploy.sh [选项]"
    echo ""
    echo "选项:"
    echo "  -e, --env <环境>      部署环境 (prod|dev|staging), 默认: prod"
    echo "  -p, --platform <平台> 部署平台 (cloudbase|vercel|both), 默认: cloudbase"
    echo "  -c, --check-only      只进行检查，不实际部署"
    echo "  -r, --rollback        执行回滚操作"
    echo "  -h, --help            显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  ./scripts/deploy.sh -e prod -p cloudbase"
    echo "  ./scripts/deploy.sh --env staging --platform both"
    echo "  ./scripts/deploy.sh --check-only"
}

# 参数解析
ENV="prod"
PLATFORM="cloudbase"
CHECK_ONLY=false
ROLLBACK=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--env)
            ENV="$2"
            shift 2
            ;;
        -p|--platform)
            PLATFORM="$2"
            shift 2
            ;;
        -c|--check-only)
            CHECK_ONLY=true
            shift
            ;;
        -r|--rollback)
            ROLLBACK=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            log_error "未知参数: $1"
            show_help
            exit 1
            ;;
    esac
done

# 环境配置
case $ENV in
    "prod")
        ENV_FILE=".env.production"
        DEPLOY_URL="https://taocang.com"
        CLOUDBASE_ENV="taocang-prod"
        ;;
    "staging")
        ENV_FILE=".env.staging"
        DEPLOY_URL="https://staging.taocang.com"
        CLOUDBASE_ENV="taocang-staging"
        ;;
    "dev")
        ENV_FILE=".env.development"
        DEPLOY_URL="https://dev.taocang.com"
        CLOUDBASE_ENV="taocang-dev"
        ;;
    *)
        log_error "不支持的部署环境: $ENV"
        exit 1
        ;;
esac

# 检查环境文件
if [[ ! -f "$ENV_FILE" ]]; then
    log_error "环境文件不存在: $ENV_FILE"
    exit 1
fi

# 部署前检查函数
pre_deploy_check() {
    log_info "开始部署前检查..."
    
    # 检查Node.js版本
    NODE_VERSION=$(node -v)
    if [[ $? -ne 0 ]]; then
        log_error "Node.js未安装"
        return 1
    fi
    log_info "Node.js版本: $NODE_VERSION"
    
    # 检查npm版本
    NPM_VERSION=$(npm -v)
    log_info "npm版本: $NPM_VERSION"
    
    # 检查依赖是否安装
    if [[ ! -d "node_modules" ]]; then
        log_warning "node_modules不存在，开始安装依赖..."
        npm ci
        if [[ $? -ne 0 ]]; then
            log_error "依赖安装失败"
            return 1
        fi
    fi
    
    # 检查环境变量
    if ! grep -q "VITE_APP_ENV" "$ENV_FILE"; then
        log_error "环境文件格式错误"
        return 1
    fi
    
    # 运行测试
    log_info "运行测试套件..."
    npm test -- --passWithNoTests
    if [[ $? -ne 0 ]]; then
        log_error "测试失败，请修复后再部署"
        return 1
    fi
    
    log_success "部署前检查通过"
    return 0
}

# 构建函数
build_project() {
    log_info "开始构建项目..."
    
    # 复制环境文件
    cp "$ENV_FILE" ".env"
    
    # 执行构建
    npm run build
    if [[ $? -ne 0 ]]; then
        log_error "构建失败"
        return 1
    fi
    
    # 检查构建产物
    if [[ ! -d "dist" ]]; then
        log_error "构建产物不存在"
        return 1
    fi
    
    # 生成构建信息
    echo "构建时间: $(date)" > dist/build-info.txt
    echo "环境: $ENV" >> dist/build-info.txt
    echo "Git提交: $(git rev-parse HEAD 2>/dev/null || echo 'unknown')" >> dist/build-info.txt
    
    log_success "项目构建成功"
    return 0
}

# 腾讯云CloudBase部署函数
deploy_cloudbase() {
    log_info "开始部署到腾讯云CloudBase..."
    
    # 检查CloudBase CLI是否安装
    if ! command -v cloudbase &> /dev/null; then
        log_error "CloudBase CLI未安装，请先安装: npm install -g @cloudbase/cli"
        return 1
    fi
    
    # 部署到CloudBase
    cloudbase hosting deploy dist -e "$CLOUDBASE_ENV"
    if [[ $? -ne 0 ]]; then
        log_error "CloudBase部署失败"
        return 1
    fi
    
    log_success "腾讯云CloudBase部署成功"
    return 0
}

# Vercel部署函数
deploy_vercel() {
    log_info "开始部署到Vercel..."
    
    # 检查Vercel CLI是否安装
    if ! command -v vercel &> /dev/null; then
        log_error "Vercel CLI未安装，请先安装: npm install -g vercel"
        return 1
    fi
    
    # 使用Vercel部署
    vercel --prod --confirm
    if [[ $? -ne 0 ]]; then
        log_error "Vercel部署失败"
        return 1
    fi
    
    log_success "Vercel部署成功"
    return 0
}

# 健康检查函数
health_check() {
    log_info "开始健康检查..."
    
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        log_info "健康检查尝试 $attempt/$max_attempts"
        
        # 检查应用是否可访问
        if curl -s -f "$DEPLOY_URL" > /dev/null; then
            log_success "应用健康检查通过"
            return 0
        fi
        
        sleep 5
        ((attempt++))
    done
    
    log_error "健康检查失败，应用可能部署失败"
    return 1
}

# 回滚函数
rollback_deployment() {
    log_info "开始执行回滚操作..."
    
    # 这里可以实现具体的回滚逻辑
    # 例如恢复到上一个稳定版本
    
    log_warning "回滚功能待实现，请手动处理"
    return 1
}

# 主部署流程
main() {
    log_info "=== V2.0 部署流程开始 ==="
    log_info "环境: $ENV"
    log_info "平台: $PLATFORM"
    log_info "模式: $([ "$CHECK_ONLY" = true ] && echo "检查模式" || echo "部署模式")"
    
    # 如果是回滚模式
    if [[ "$ROLLBACK" = true ]]; then
        rollback_deployment
        exit $?
    fi
    
    # 部署前检查
    if ! pre_deploy_check; then
        log_error "部署前检查失败，终止部署"
        exit 1
    fi
    
    # 如果是检查模式，到此结束
    if [[ "$CHECK_ONLY" = true ]]; then
        log_success "检查模式完成，所有检查通过"
        exit 0
    fi
    
    # 构建项目
    if ! build_project; then
        log_error "项目构建失败，终止部署"
        exit 1
    fi
    
    # 根据平台选择部署方式
    case $PLATFORM in
        "cloudbase")
            if ! deploy_cloudbase; then
                exit 1
            fi
            ;;
        "vercel")
            if ! deploy_vercel; then
                exit 1
            fi
            ;;
        "both")
            log_info "开始双平台部署..."
            if ! deploy_cloudbase; then
                log_error "CloudBase部署失败，跳过Vercel部署"
                exit 1
            fi
            if ! deploy_vercel; then
                log_warning "Vercel部署失败，但CloudBase部署成功"
            fi
            ;;
        *)
            log_error "不支持的部署平台: $PLATFORM"
            exit 1
            ;;
    esac
    
    # 健康检查
    if ! health_check; then
        log_error "部署后健康检查失败"
        exit 1
    fi
    
    log_success "=== V2.0 部署流程完成 ==="
    log_success "应用已成功部署到: $DEPLOY_URL"
    
    # 生成部署报告
    echo "=== 部署报告 ===" > deploy-report.txt
    echo "时间: $(date)" >> deploy-report.txt
    echo "环境: $ENV" >> deploy-report.txt
    echo "平台: $PLATFORM" >> deploy-report.txt
    echo "状态: 成功" >> deploy-report.txt
    echo "URL: $DEPLOY_URL" >> deploy-report.txt
    
    log_info "部署报告已生成: deploy-report.txt"
}

# 执行主函数
main "$@"