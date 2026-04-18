# V2.0 Windows PowerShell部署脚本
# 支持腾讯云CloudBase和Vercel双平台部署

param(
    [string]$Env = "prod",
    [string]$Platform = "cloudbase",
    [switch]$CheckOnly = $false,
    [switch]$Rollback = $false,
    [switch]$Help = $false
)

# 颜色定义
$Red = "\033[0;31m"
$Green = "\033[0;32m"
$Yellow = "\033[1;33m"
$Blue = "\033[0;34m"
$NC = "\033[0m" # No Color

# 日志函数
function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "SUCCESS" { $Green }
        "WARNING" { $Yellow }
        "ERROR" { $Red }
        default { $Blue }
    }
    
    Write-Host "$color[$Level]$NC $timestamp - $Message"
}

# 显示帮助信息
function Show-Help {
    Write-Host "V2.0 PowerShell部署脚本使用说明"
    Write-Host ""
    Write-Host "用法: .\scripts\deploy.ps1 [参数]"
    Write-Host ""
    Write-Host "参数:"
    Write-Host "  -Env <环境>        部署环境 (prod|dev|staging), 默认: prod"
    Write-Host "  -Platform <平台>   部署平台 (cloudbase|vercel|both), 默认: cloudbase"
    Write-Host "  -CheckOnly         只进行检查，不实际部署"
    Write-Host "  -Rollback          执行回滚操作"
    Write-Host "  -Help              显示此帮助信息"
    Write-Host ""
    Write-Host "示例:"
    Write-Host "  .\scripts\deploy.ps1 -Env prod -Platform cloudbase"
    Write-Host "  .\scripts\deploy.ps1 -Env staging -Platform both"
    Write-Host "  .\scripts\deploy.ps1 -CheckOnly"
}

# 环境配置
function Get-EnvironmentConfig {
    param([string]$Env)
    
    switch ($Env) {
        "prod" {
            return @{
                EnvFile = ".env.production"
                DeployUrl = "https://taocang.com"
                CloudBaseEnv = "taocang-prod"
            }
        }
        "staging" {
            return @{
                EnvFile = ".env.staging"
                DeployUrl = "https://staging.taocang.com"
                CloudBaseEnv = "taocang-staging"
            }
        }
        "dev" {
            return @{
                EnvFile = ".env.development"
                DeployUrl = "https://dev.taocang.com"
                CloudBaseEnv = "taocang-dev"
            }
        }
        default {
            Write-Log "不支持的部署环境: $Env" -Level "ERROR"
            exit 1
        }
    }
}

# 部署前检查
function Invoke-PreDeployCheck {
    Write-Log "开始部署前检查..."
    
    # 检查Node.js版本
    try {
        $nodeVersion = node -v
        Write-Log "Node.js版本: $nodeVersion"
    } catch {
        Write-Log "Node.js未安装" -Level "ERROR"
        return $false
    }
    
    # 检查npm版本
    $npmVersion = npm -v
    Write-Log "npm版本: $npmVersion"
    
    # 检查依赖是否安装
    if (-not (Test-Path "node_modules")) {
        Write-Log "node_modules不存在，开始安装依赖..." -Level "WARNING"
        npm ci
        if ($LASTEXITCODE -ne 0) {
            Write-Log "依赖安装失败" -Level "ERROR"
            return $false
        }
    }
    
    # 检查环境变量文件
    if (-not (Test-Path $config.EnvFile)) {
        Write-Log "环境文件不存在: $($config.EnvFile)" -Level "ERROR"
        return $false
    }
    
    # 检查环境变量格式
    $envContent = Get-Content $config.EnvFile -Raw
    if (-not $envContent.Contains("VITE_APP_ENV")) {
        Write-Log "环境文件格式错误" -Level "ERROR"
        return $false
    }
    
    # 运行测试
    Write-Log "运行测试套件..."
    npm test -- --passWithNoTests
    if ($LASTEXITCODE -ne 0) {
        Write-Log "测试失败，请修复后再部署" -Level "ERROR"
        return $false
    }
    
    Write-Log "部署前检查通过" -Level "SUCCESS"
    return $true
}

# 构建项目
function Invoke-BuildProject {
    Write-Log "开始构建项目..."
    
    # 复制环境文件
    Copy-Item $config.EnvFile ".env" -Force
    
    # 执行构建
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Log "构建失败" -Level "ERROR"
        return $false
    }
    
    # 检查构建产物
    if (-not (Test-Path "dist")) {
        Write-Log "构建产物不存在" -Level "ERROR"
        return $false
    }
    
    # 生成构建信息
    $buildInfo = @"
构建时间: $(Get-Date)
环境: $Env
Git提交: $(try { git rev-parse HEAD } catch { 'unknown' })
"@
    $buildInfo | Out-File -FilePath "dist/build-info.txt" -Encoding UTF8
    
    Write-Log "项目构建成功" -Level "SUCCESS"
    return $true
}

# 腾讯云CloudBase部署
function Invoke-CloudBaseDeploy {
    Write-Log "开始部署到腾讯云CloudBase..."
    
    # 检查CloudBase CLI是否安装
    try {
        $cloudbaseVersion = cloudbase --version
        Write-Log "CloudBase CLI版本: $cloudbaseVersion"
    } catch {
        Write-Log "CloudBase CLI未安装，请先安装: npm install -g @cloudbase/cli" -Level "ERROR"
        return $false
    }
    
    # 部署到CloudBase
    cloudbase hosting deploy dist -e $config.CloudBaseEnv
    if ($LASTEXITCODE -ne 0) {
        Write-Log "CloudBase部署失败" -Level "ERROR"
        return $false
    }
    
    Write-Log "腾讯云CloudBase部署成功" -Level "SUCCESS"
    return $true
}

# Vercel部署
function Invoke-VercelDeploy {
    Write-Log "开始部署到Vercel..."
    
    # 检查Vercel CLI是否安装
    try {
        $vercelVersion = vercel --version
        Write-Log "Vercel CLI版本: $vercelVersion"
    } catch {
        Write-Log "Vercel CLI未安装，请先安装: npm install -g vercel" -Level "ERROR"
        return $false
    }
    
    # 使用Vercel部署
    vercel --prod --confirm
    if ($LASTEXITCODE -ne 0) {
        Write-Log "Vercel部署失败" -Level "ERROR"
        return $false
    }
    
    Write-Log "Vercel部署成功" -Level "SUCCESS"
    return $true
}

# 健康检查
function Invoke-HealthCheck {
    Write-Log "开始健康检查..."
    
    $maxAttempts = 30
    $attempt = 1
    
    while ($attempt -le $maxAttempts) {
        Write-Log "健康检查尝试 $attempt/$maxAttempts"
        
        try {
            $response = Invoke-WebRequest -Uri $config.DeployUrl -UseBasicParsing -TimeoutSec 10
            if ($response.StatusCode -eq 200) {
                Write-Log "应用健康检查通过" -Level "SUCCESS"
                return $true
            }
        } catch {
            # 忽略错误，继续重试
        }
        
        Start-Sleep -Seconds 5
        $attempt++
    }
    
    Write-Log "健康检查失败，应用可能部署失败" -Level "ERROR"
    return $false
}

# 回滚操作
function Invoke-Rollback {
    Write-Log "开始执行回滚操作..." -Level "WARNING"
    
    # 这里可以实现具体的回滚逻辑
    # 例如恢复到上一个稳定版本
    
    Write-Log "回滚功能待实现，请手动处理" -Level "WARNING"
    return $false
}

# 生成部署报告
function New-DeploymentReport {
    $report = @"
=== 部署报告 ===
时间: $(Get-Date)
环境: $Env
平台: $Platform
状态: 成功
URL: $($config.DeployUrl)
构建信息:
$(Get-Content "dist/build-info.txt" -ErrorAction SilentlyContinue)
"@
    
    $report | Out-File -FilePath "deploy-report.txt" -Encoding UTF8
    Write-Log "部署报告已生成: deploy-report.txt"
}

# 主部署流程
function Start-Deployment {
    Write-Log "=== V2.0 部署流程开始 ==="
    Write-Log "环境: $Env"
    Write-Log "平台: $Platform"
    Write-Log "模式: $(if ($CheckOnly) { '检查模式' } else { '部署模式' })"
    
    # 如果是回滚模式
    if ($Rollback) {
        if (-not (Invoke-Rollback)) {
            exit 1
        }
        exit 0
    }
    
    # 部署前检查
    if (-not (Invoke-PreDeployCheck)) {
        Write-Log "部署前检查失败，终止部署" -Level "ERROR"
        exit 1
    }
    
    # 如果是检查模式，到此结束
    if ($CheckOnly) {
        Write-Log "检查模式完成，所有检查通过" -Level "SUCCESS"
        exit 0
    }
    
    # 构建项目
    if (-not (Invoke-BuildProject)) {
        Write-Log "项目构建失败，终止部署" -Level "ERROR"
        exit 1
    }
    
    # 根据平台选择部署方式
    $deploySuccess = $false
    switch ($Platform) {
        "cloudbase" {
            $deploySuccess = Invoke-CloudBaseDeploy
        }
        "vercel" {
            $deploySuccess = Invoke-VercelDeploy
        }
        "both" {
            Write-Log "开始双平台部署..."
            $cloudbaseSuccess = Invoke-CloudBaseDeploy
            if (-not $cloudbaseSuccess) {
                Write-Log "CloudBase部署失败，跳过Vercel部署" -Level "ERROR"
                exit 1
            }
            $vercelSuccess = Invoke-VercelDeploy
            $deploySuccess = $cloudbaseSuccess -or $vercelSuccess
        }
        default {
            Write-Log "不支持的部署平台: $Platform" -Level "ERROR"
            exit 1
        }
    }
    
    if (-not $deploySuccess) {
        Write-Log "部署失败" -Level "ERROR"
        exit 1
    }
    
    # 健康检查
    if (-not (Invoke-HealthCheck)) {
        Write-Log "部署后健康检查失败" -Level "ERROR"
        exit 1
    }
    
    Write-Log "=== V2.0 部署流程完成 ===" -Level "SUCCESS"
    Write-Log "应用已成功部署到: $($config.DeployUrl)" -Level "SUCCESS"
    
    # 生成部署报告
    New-DeploymentReport
}

# 主程序入口
if ($Help) {
    Show-Help
    exit 0
}

# 获取环境配置
$config = Get-EnvironmentConfig -Env $Env

# 执行部署
Start-Deployment