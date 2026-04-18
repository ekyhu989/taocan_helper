// V2.0 Vercel部署脚本
// 备用部署平台配置

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class VercelDeployer {
  constructor(options = {}) {
    this.options = {
      env: 'prod',
      skipBuild: false,
      skipTest: false,
      preview: false,
      ...options
    };
    
    this.environments = {
      prod: {
        alias: '生产环境',
        domain: 'taocang-helper-v2.vercel.app',
        buildEnv: 'production'
      },
      staging: {
        alias: '预发布环境', 
        domain: 'staging.taocang.com',
        buildEnv: 'staging'
      },
      dev: {
        alias: '开发环境',
        domain: 'dev.taocang.com',
        buildEnv: 'development'
      }
    };
    
    this.currentEnv = this.environments[this.options.env];
    
    if (!this.currentEnv) {
      throw new Error(`不支持的部署环境: ${this.options.env}`);
    }
    
    this.logFile = `logs/vercel-deploy-${this.options.env}-${new Date().toISOString().replace(/[:.]/g, '-')}.log`;
    this.ensureLogsDirectory();
  }
  
  // 确保日志目录存在
  ensureLogsDirectory() {
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs');
    }
  }
  
  // 日志记录
  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${level}] ${timestamp} - ${message}`;
    
    console.log(logMessage);
    
    // 写入日志文件
    fs.appendFileSync(this.logFile, logMessage + '\n', 'utf8');
  }
  
  // 执行命令
  executeCommand(command, options = {}) {
    this.log(`执行命令: ${command}`);
    
    try {
      const result = execSync(command, {
        cwd: process.cwd(),
        encoding: 'utf8',
        stdio: options.silent ? 'pipe' : 'inherit',
        ...options
      });
      
      return { success: true, output: result };
    } catch (error) {
      this.log(`命令执行失败: ${error.message}`, 'ERROR');
      return { success: false, error: error.message };
    }
  }
  
  // 检查Vercel CLI
  async checkVercelCLI() {
    this.log('检查Vercel CLI...');
    
    const result = this.executeCommand('vercel --version', { silent: true });
    
    if (!result.success) {
      throw new Error('Vercel CLI未安装，请先安装: npm install -g vercel');
    }
    
    this.log(`Vercel CLI版本: ${result.output.trim()}`);
    return true;
  }
  
  // 检查登录状态
  async checkLoginStatus() {
    this.log('检查登录状态...');
    
    const result = this.executeCommand('vercel whoami', { silent: true });
    
    if (!result.success) {
      throw new Error('请先登录Vercel: vercel login');
    }
    
    this.log(`Vercel登录用户: ${result.output.trim()}`);
    return true;
  }
  
  // 运行测试
  async runTests() {
    if (this.options.skipTest) {
      this.log('跳过测试');
      return true;
    }
    
    this.log('运行测试套件...');
    
    const result = this.executeCommand('npm test -- --passWithNoTests');
    
    if (!result.success) {
      throw new Error('测试失败，请修复后再部署');
    }
    
    this.log('测试通过');
    return true;
  }
  
  // 构建项目
  async buildProject() {
    if (this.options.skipBuild) {
      this.log('跳过构建');
      return true;
    }
    
    this.log('开始构建项目...');
    
    // 复制环境文件
    const envFile = `.env.${this.options.env}`;
    if (fs.existsSync(envFile)) {
      fs.copyFileSync(envFile, '.env');
      this.log(`已复制环境文件: ${envFile} -> .env`);
    }
    
    const result = this.executeCommand('npm run build');
    
    if (!result.success) {
      throw new Error('构建失败');
    }
    
    // 检查构建产物
    if (!fs.existsSync('dist')) {
      throw new Error('构建产物不存在');
    }
    
    this.log('项目构建成功');
    return true;
  }
  
  // 部署到Vercel
  async deployToVercel() {
    this.log(`开始部署到 ${this.currentEnv.alias}...`);
    
    let deployCommand = 'vercel';
    
    if (this.options.preview) {
      deployCommand += ' --preview';
    } else {
      deployCommand += ' --prod';
    }
    
    deployCommand += ' --confirm';
    
    const result = this.executeCommand(deployCommand);
    
    if (!result.success) {
      throw new Error('Vercel部署失败');
    }
    
    // 解析部署URL
    const urlMatch = result.output.match(/https:\/\/[^\s]+/);
    const deployUrl = urlMatch ? urlMatch[0] : this.currentEnv.domain;
    
    this.log(`部署到 ${this.currentEnv.alias} 成功`);
    this.log(`访问地址: ${deployUrl}`);
    
    return deployUrl;
  }
  
  // 配置域名
  async configureDomain() {
    if (this.options.preview) {
      this.log('预览部署跳过域名配置');
      return null;
    }
    
    this.log('配置域名...');
    
    // 检查域名是否已配置
    const checkResult = this.executeCommand(`vercel domains ls ${this.currentEnv.domain}`, { silent: true });
    
    if (!checkResult.success) {
      // 域名未配置，尝试添加
      this.log(`添加域名: ${this.currentEnv.domain}`);
      
      const addResult = this.executeCommand(`vercel domains add ${this.currentEnv.domain}`);
      
      if (!addResult.success) {
        this.log('域名添加失败，跳过域名配置', 'WARNING');
        return null;
      }
    }
    
    // 验证域名
    this.log(`验证域名: ${this.currentEnv.domain}`);
    const verifyResult = this.executeCommand(`vercel domains verify ${this.currentEnv.domain}`);
    
    if (!verifyResult.success) {
      this.log('域名验证失败，跳过域名配置', 'WARNING');
      return null;
    }
    
    this.log('域名配置成功');
    return this.currentEnv.domain;
  }
  
  // 健康检查
  async healthCheck(deployUrl) {
    this.log('开始健康检查...');
    
    const url = deployUrl || `https://${this.currentEnv.domain}`;
    const maxAttempts = 30;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      this.log(`健康检查尝试 ${attempt}/${maxAttempts}`);
      
      try {
        const https = require('https');
        
        const response = await new Promise((resolve, reject) => {
          const req = https.get(url, (res) => {
            resolve(res.statusCode);
          });
          
          req.on('error', reject);
          req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('请求超时'));
          });
        });
        
        if (response === 200) {
          this.log('健康检查通过');
          return true;
        }
      } catch (error) {
        // 忽略错误，继续重试
      }
      
      // 等待5秒后重试
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    throw new Error('健康检查失败，应用可能部署失败');
  }
  
  // 生成部署报告
  generateDeploymentReport(success, deployUrl, domain) {
    const report = {
      timestamp: new Date().toISOString(),
      environment: this.options.env,
      deployUrl: deployUrl,
      configuredDomain: domain,
      success: success,
      preview: this.options.preview,
      buildSkipped: this.options.skipBuild,
      testSkipped: this.options.skipTest,
      logFile: this.logFile
    };
    
    const reportFile = `deployments/vercel-deploy-report-${this.options.env}-${new Date().toISOString().split('T')[0]}.json`;
    
    // 确保部署目录存在
    if (!fs.existsSync('deployments')) {
      fs.mkdirSync('deployments');
    }
    
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2), 'utf8');
    this.log(`部署报告已生成: ${reportFile}`);
    
    return reportFile;
  }
  
  // 主部署流程
  async deploy() {
    this.log(`=== V2.0 Vercel部署流程开始 ===`);
    this.log(`环境: ${this.currentEnv.alias}`);
    this.log(`模式: ${this.options.preview ? '预览部署' : '生产部署'}`);
    
    try {
      // 1. 检查环境
      await this.checkVercelCLI();
      await this.checkLoginStatus();
      
      // 2. 运行测试
      await this.runTests();
      
      // 3. 构建项目
      await this.buildProject();
      
      // 4. 部署到Vercel
      const deployUrl = await this.deployToVercel();
      
      // 5. 配置域名（仅生产部署）
      let configuredDomain = null;
      if (!this.options.preview) {
        configuredDomain = await this.configureDomain();
      }
      
      // 6. 健康检查
      await this.healthCheck(deployUrl);
      
      // 7. 生成报告
      const reportFile = this.generateDeploymentReport(true, deployUrl, configuredDomain);
      
      this.log(`=== V2.0 Vercel部署流程完成 ===`);
      this.log(`应用已成功部署到: ${deployUrl}`);
      if (configuredDomain) {
        this.log(`配置域名: https://${configuredDomain}`);
      }
      this.log(`部署报告: ${reportFile}`);
      
      return {
        success: true,
        deployUrl: deployUrl,
        configuredDomain: configuredDomain,
        reportFile: reportFile,
        logFile: this.logFile
      };
      
    } catch (error) {
      this.log(`部署失败: ${error.message}`, 'ERROR');
      
      // 生成失败报告
      this.generateDeploymentReport(false);
      
      return {
        success: false,
        error: error.message,
        logFile: this.logFile
      };
    }
  }
}

// 命令行接口
if (require.main === module) {
  const yargs = require('yargs');
  
  const argv = yargs
    .option('env', {
      alias: 'e',
      describe: '部署环境',
      choices: ['prod', 'staging', 'dev'],
      default: 'prod'
    })
    .option('skip-build', {
      describe: '跳过构建步骤',
      type: 'boolean',
      default: false
    })
    .option('skip-test', {
      describe: '跳过测试步骤', 
      type: 'boolean',
      default: false
    })
    .option('preview', {
      alias: 'p',
      describe: '预览部署（非生产环境）',
      type: 'boolean',
      default: false
    })
    .help()
    .alias('help', 'h')
    .argv;
  
  const deployer = new VercelDeployer({
    env: argv.env,
    skipBuild: argv.skipBuild,
    skipTest: argv.skipTest,
    preview: argv.preview
  });
  
  deployer.deploy()
    .then(result => {
      if (result.success) {
        console.log('\n🎉 Vercel部署成功!');
        console.log(`🌐 访问地址: ${result.deployUrl}`);
        if (result.configuredDomain) {
          console.log(`🌍 配置域名: https://${result.configuredDomain}`);
        }
        console.log(`📊 部署报告: ${result.reportFile}`);
        console.log(`📝 详细日志: ${result.logFile}`);
        process.exit(0);
      } else {
        console.log('\n❌ Vercel部署失败!');
        console.log(`💡 错误信息: ${result.error}`);
        console.log(`📝 详细日志: ${result.logFile}`);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('部署过程中发生未知错误:', error);
      process.exit(1);
    });
}

module.exports = VercelDeployer;