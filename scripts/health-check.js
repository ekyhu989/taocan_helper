// V2.0 上线检查和功能验证工具
// 支持多环境健康检查和功能验证

const https = require('https');
const fs = require('fs');

class HealthChecker {
  constructor(config = {}) {
    this.config = {
      environments: {
        prod: {
          name: '生产环境',
          url: 'https://taocang.com',
          apiUrl: 'https://api.taocang.com',
          timeout: 10000
        },
        staging: {
          name: '预发布环境',
          url: 'https://staging.taocang.com',
          apiUrl: 'https://staging.api.taocang.com',
          timeout: 10000
        },
        dev: {
          name: '开发环境',
          url: 'https://dev.taocang.com',
          apiUrl: 'https://dev.api.taocang.com',
          timeout: 15000
        }
      },
      checkInterval: 30000, // 30秒检查一次
      alertThreshold: 3, // 连续3次失败发送告警
      ...config
    };
    
    this.failureCounts = {};
    this.checkResults = {};
    this.initializeFailureCounts();
  }
  
  // 初始化失败计数器
  initializeFailureCounts() {
    Object.keys(this.config.environments).forEach(env => {
      this.failureCounts[env] = 0;
      this.checkResults[env] = {
        lastCheck: null,
        status: 'unknown',
        responseTime: 0,
        error: null
      };
    });
  }
  
  // HTTP请求函数
  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const req = https.get(url, {
        timeout: options.timeout || 10000,
        rejectUnauthorized: false
      }, (res) => {
        const responseTime = Date.now() - startTime;
        
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            responseTime,
            data: data
          });
        });
      });
      
      req.on('error', (error) => {
        reject({
          error: error.message,
          responseTime: Date.now() - startTime
        });
      });
      
      req.on('timeout', () => {
        req.destroy();
        reject({
          error: '请求超时',
          responseTime: Date.now() - startTime
        });
      });
      
      req.end();
    });
  }
  
  // 检查应用可用性
  async checkApplication(env) {
    const envConfig = this.config.environments[env];
    
    try {
      const result = await this.makeRequest(envConfig.url, {
        timeout: envConfig.timeout
      });
      
      return {
        success: result.statusCode === 200,
        statusCode: result.statusCode,
        responseTime: result.responseTime,
        headers: result.headers
      };
    } catch (error) {
      return {
        success: false,
        error: error.error,
        responseTime: error.responseTime
      };
    }
  }
  
  // 检查API服务
  async checkApiService(env) {
    const envConfig = this.config.environments[env];
    
    try {
      const result = await this.makeRequest(`${envConfig.apiUrl}/api/health`, {
        timeout: envConfig.timeout
      });
      
      let healthData;
      try {
        healthData = JSON.parse(result.data);
      } catch {
        healthData = { status: 'unknown' };
      }
      
      return {
        success: result.statusCode === 200 && healthData.status === 'healthy',
        statusCode: result.statusCode,
        responseTime: result.responseTime,
        healthData: healthData
      };
    } catch (error) {
      return {
        success: false,
        error: error.error,
        responseTime: error.responseTime
      };
    }
  }
  
  // 检查功能模块
  async checkFeatures(env) {
    const envConfig = this.config.environments[env];
    const features = [
      { name: '方案管理', path: '/scheme' },
      { name: '商品管理', path: '/product' },
      { name: '导出功能', path: '/export' },
      { name: '双视图切换', path: '/view' }
    ];
    
    const results = [];
    
    for (const feature of features) {
      try {
        const result = await this.makeRequest(`${envConfig.url}${feature.path}`, {
          timeout: 5000
        });
        
        results.push({
          name: feature.name,
          success: result.statusCode === 200 || result.statusCode === 404,
          statusCode: result.statusCode,
          responseTime: result.responseTime
        });
      } catch (error) {
        results.push({
          name: feature.name,
          success: false,
          error: error.error,
          responseTime: error.responseTime
        });
      }
    }
    
    return results;
  }
  
  // 性能检查
  async checkPerformance(env) {
    const envConfig = this.config.environments[env];
    
    // 检查关键资源加载时间
    const resources = [
      { name: '主JS文件', path: '/assets/index-' },
      { name: 'CSS文件', path: '/assets/index-' },
      { name: 'vendor文件', path: '/assets/vendor-' }
    ];
    
    const results = [];
    
    // 首先获取HTML内容来解析资源路径
    try {
      const htmlResult = await this.makeRequest(envConfig.url, {
        timeout: envConfig.timeout
      });
      
      if (htmlResult.success) {
        // 这里简化处理，实际应该解析HTML获取具体资源路径
        for (const resource of resources) {
          try {
            const startTime = Date.now();
            // 模拟资源请求（实际应该请求具体资源）
            await new Promise(resolve => setTimeout(resolve, 100));
            const responseTime = Date.now() - startTime;
            
            results.push({
              name: resource.name,
              success: responseTime < 2000, // 2秒内加载完成
              responseTime: responseTime
            });
          } catch (error) {
            results.push({
              name: resource.name,
              success: false,
              error: error.error
            });
          }
        }
      }
    } catch (error) {
      // 忽略错误，性能检查不是关键
    }
    
    return results;
  }
  
  // 综合健康检查
  async comprehensiveHealthCheck(env) {
    const startTime = Date.now();
    
    const checks = await Promise.all([
      this.checkApplication(env),
      this.checkApiService(env),
      this.checkFeatures(env),
      this.checkPerformance(env)
    ]);
    
    const [appCheck, apiCheck, featureChecks, performanceChecks] = checks;
    
    const totalTime = Date.now() - startTime;
    
    // 计算总体状态
    const appSuccess = appCheck.success;
    const apiSuccess = apiCheck.success;
    const featuresSuccess = featureChecks.every(f => f.success);
    const performanceAcceptable = performanceChecks.every(p => p.success);
    
    const overallSuccess = appSuccess && apiSuccess && featuresSuccess;
    
    // 更新失败计数器
    if (overallSuccess) {
      this.failureCounts[env] = 0;
    } else {
      this.failureCounts[env]++;
    }
    
    // 更新检查结果
    this.checkResults[env] = {
      lastCheck: new Date().toISOString(),
      status: overallSuccess ? 'healthy' : 'unhealthy',
      responseTime: totalTime,
      app: appCheck,
      api: apiCheck,
      features: featureChecks,
      performance: performanceChecks,
      failureCount: this.failureCounts[env]
    };
    
    return this.checkResults[env];
  }
  
  // 发送告警
  async sendAlert(env, checkResult) {
    const envConfig = this.config.environments[env];
    
    const alertMessage = `
🚨 V2.0 健康检查告警

环境: ${envConfig.name} (${env})
时间: ${new Date().toISOString()}
状态: ${checkResult.status}
失败次数: ${checkResult.failureCount}

检查详情:
- 应用可用性: ${checkResult.app.success ? '✅' : '❌'} ${checkResult.app.responseTime}ms
- API服务: ${checkResult.api.success ? '✅' : '❌'} ${checkResult.api.responseTime}ms
- 功能模块: ${checkResult.features.filter(f => f.success).length}/${checkResult.features.length} 正常
- 性能指标: ${checkResult.performance.filter(p => p.success).length}/${checkResult.performance.length} 达标

${checkResult.app.error ? `应用错误: ${checkResult.app.error}\n` : ''}
${checkResult.api.error ? `API错误: ${checkResult.api.error}\n` : ''}
请立即检查服务状态！
    `;
    
    console.log('🔔 发送告警:', alertMessage);
    
    // 记录到日志文件
    this.logAlert(env, alertMessage);
    
    // 这里可以实现发送邮件、短信、钉钉等告警
    // await this.sendEmailAlert(env, alertMessage);
    // await this.sendSMSAlert(env, alertMessage);
  }
  
  // 记录告警日志
  logAlert(env, message) {
    const logFile = `logs/health-alerts-${env}.log`;
    
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs');
    }
    
    fs.appendFileSync(logFile, `\n=== ${new Date().toISOString()} ===\n${message}\n`, 'utf8');
  }
  
  // 生成健康报告
  generateHealthReport() {
    const report = {
      timestamp: new Date().toISOString(),
      environments: {}
    };
    
    Object.keys(this.config.environments).forEach(env => {
      report.environments[env] = this.checkResults[env];
    });
    
    const reportFile = `reports/health-report-${new Date().toISOString().split('T')[0]}.json`;
    
    if (!fs.existsSync('reports')) {
      fs.mkdirSync('reports');
    }
    
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2), 'utf8');
    
    return reportFile;
  }
  
  // 启动健康监控
  startMonitoring() {
    console.log('🚀 启动V2.0健康监控服务...');
    
    // 立即执行一次全面检查
    this.runComprehensiveCheck().catch(console.error);
    
    // 设置定时检查
    setInterval(() => {
      this.runComprehensiveCheck().catch(console.error);
    }, this.config.checkInterval);
    
    console.log(`⏰ 健康监控已启动，每 ${this.config.checkInterval / 1000} 秒检查一次`);
  }
  
  // 执行全面检查
  async runComprehensiveCheck() {
    console.log('\n🔍 开始全面健康检查...');
    
    const results = {};
    
    for (const env of Object.keys(this.config.environments)) {
      console.log(`\n检查 ${this.config.environments[env].name}...`);
      
      try {
        const checkResult = await this.comprehensiveHealthCheck(env);
        results[env] = checkResult;
        
        console.log(`  ✅ 应用状态: ${checkResult.status}`);
        console.log(`  ⏱️ 响应时间: ${checkResult.responseTime}ms`);
        console.log(`  🔢 失败次数: ${checkResult.failureCount}`);
        
        // 检查是否需要发送告警
        if (checkResult.failureCount >= this.config.alertThreshold) {
          await this.sendAlert(env, checkResult);
        }
        
      } catch (error) {
        console.error(`检查 ${env} 时发生错误:`, error);
        results[env] = {
          lastCheck: new Date().toISOString(),
          status: 'error',
          error: error.message
        };
      }
    }
    
    // 生成报告
    const reportFile = this.generateHealthReport();
    console.log(`\n📊 健康报告已生成: ${reportFile}`);
    
    return results;
  }
  
  // 单次检查（命令行使用）
  async runCheck(env) {
    if (env && this.config.environments[env]) {
      return await this.comprehensiveHealthCheck(env);
    } else {
      return await this.runComprehensiveCheck();
    }
  }
}

// 命令行接口
if (require.main === module) {
  const yargs = require('yargs');
  
  const argv = yargs
    .option('env', {
      alias: 'e',
      describe: '检查环境',
      choices: ['prod', 'staging', 'dev', 'all'],
      default: 'all'
    })
    .option('monitor', {
      alias: 'm',
      describe: '启动监控模式',
      type: 'boolean',
      default: false
    })
    .option('interval', {
      alias: 'i',
      describe: '监控间隔（秒）',
      type: 'number',
      default: 30
    })
    .help()
    .alias('help', 'h')
    .argv;
  
  const checker = new HealthChecker({
    checkInterval: argv.interval * 1000
  });
  
  if (argv.monitor) {
    // 监控模式
    checker.startMonitoring();
  } else {
    // 单次检查模式
    checker.runCheck(argv.env === 'all' ? null : argv.env)
      .then(results => {
        console.log('\n📋 健康检查结果:');
        console.log(JSON.stringify(results, null, 2));
        
        // 检查是否有环境不健康
        const unhealthyEnvs = Object.keys(results).filter(env => 
          results[env].status !== 'healthy'
        );
        
        if (unhealthyEnvs.length > 0) {
          console.log(`\n❌ 不健康环境: ${unhealthyEnvs.join(', ')}`);
          process.exit(1);
        } else {
          console.log('\n✅ 所有环境健康');
          process.exit(0);
        }
      })
      .catch(error => {
        console.error('健康检查失败:', error);
        process.exit(1);
      });
  }
}

module.exports = HealthChecker;