// V2.0 HTTPS证书管理工具
// 支持自动续期、监控和告警功能

const fs = require('fs');
const https = require('https');
const { exec } = require('child_process');

class CertificateManager {
  constructor(config) {
    this.config = {
      domains: [
        'taocang.com',
        'www.taocang.com', 
        'staging.taocang.com',
        'dev.taocang.com'
      ],
      checkInterval: 24 * 60 * 60 * 1000, // 每天检查一次
      renewalThreshold: 30, // 30天前开始续期
      alertThreshold: 7, // 7天前发送告警
      ...config
    };
    
    this.certificates = new Map();
  }

  // 检查证书信息
  async checkCertificate(domain) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: domain,
        port: 443,
        method: 'GET',
        rejectUnauthorized: false,
        agent: false
      };

      const req = https.request(options, (res) => {
        const cert = res.socket.getPeerCertificate();
        
        if (cert && Object.keys(cert).length > 0) {
          const certInfo = {
            domain,
            validFrom: new Date(cert.valid_from),
            validTo: new Date(cert.valid_to),
            issuer: cert.issuer,
            subject: cert.subject,
            daysUntilExpiry: this.calculateDaysUntilExpiry(cert.valid_to)
          };
          
          this.certificates.set(domain, certInfo);
          resolve(certInfo);
        } else {
          reject(new Error(`无法获取 ${domain} 的证书信息`));
        }
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error(`检查 ${domain} 证书超时`));
      });

      req.end();
    });
  }

  // 计算证书剩余天数
  calculateDaysUntilExpiry(validTo) {
    const expiryDate = new Date(validTo);
    const currentDate = new Date();
    const diffTime = expiryDate.getTime() - currentDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // 检查所有域名证书
  async checkAllCertificates() {
    console.log('开始检查所有域名证书...');
    
    const results = [];
    const errors = [];

    for (const domain of this.config.domains) {
      try {
        const certInfo = await this.checkCertificate(domain);
        results.push(certInfo);
        console.log(`✅ ${domain}: 剩余 ${certInfo.daysUntilExpiry} 天`);
      } catch (error) {
        errors.push({ domain, error: error.message });
        console.log(`❌ ${domain}: ${error.message}`);
      }
    }

    return { results, errors };
  }

  // 发送证书告警
  async sendAlert(certInfo, alertType) {
    const message = this.generateAlertMessage(certInfo, alertType);
    
    // 这里可以实现发送邮件、短信、钉钉等告警
    console.log('🔔 证书告警:', message);
    
    // 示例：发送到日志文件
    const alertLog = {
      timestamp: new Date().toISOString(),
      type: alertType,
      domain: certInfo.domain,
      daysUntilExpiry: certInfo.daysUntilExpiry,
      message: message
    };
    
    this.writeToFile('certificate-alerts.log', JSON.stringify(alertLog) + '\n');
  }

  // 生成告警消息
  generateAlertMessage(certInfo, alertType) {
    switch (alertType) {
      case 'expiry_warning':
        return `证书即将过期: ${certInfo.domain} 还有 ${certInfo.daysUntilExpiry} 天到期`;
      case 'expiry_critical':
        return `证书严重警告: ${certInfo.domain} 仅剩 ${certInfo.daysUntilExpiry} 天，请立即处理`;
      case 'renewal_success':
        return `证书续期成功: ${certInfo.domain}`;
      case 'renewal_failed':
        return `证书续期失败: ${certInfo.domain}`;
      default:
        return `证书状态变更: ${certInfo.domain}`;
    }
  }

  // 自动续期证书
  async renewCertificate(domain) {
    console.log(`开始续期 ${domain} 的证书...`);
    
    return new Promise((resolve, reject) => {
      // 腾讯云CloudBase证书续期
      const command = `cloudbase hosting domain renew ${domain}`;
      
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`续期 ${domain} 失败:`, error);
          reject(error);
          return;
        }
        
        console.log(`✅ ${domain} 证书续期成功`);
        console.log(stdout);
        resolve(stdout);
      });
    });
  }

  // 监控证书状态
  async monitorCertificates() {
    const { results, errors } = await this.checkAllCertificates();
    
    for (const certInfo of results) {
      if (certInfo.daysUntilExpiry <= this.config.alertThreshold) {
        // 发送严重告警
        await this.sendAlert(certInfo, 'expiry_critical');
        
        // 自动续期
        if (certInfo.daysUntilExpiry <= this.config.renewalThreshold) {
          try {
            await this.renewCertificate(certInfo.domain);
            await this.sendAlert(certInfo, 'renewal_success');
          } catch (error) {
            await this.sendAlert(certInfo, 'renewal_failed');
          }
        }
      } else if (certInfo.daysUntilExpiry <= this.config.renewalThreshold) {
        // 发送警告
        await this.sendAlert(certInfo, 'expiry_warning');
      }
    }

    // 记录错误
    if (errors.length > 0) {
      this.writeToFile('certificate-errors.log', 
        `${new Date().toISOString()} - 证书检查错误: ${JSON.stringify(errors)}\n`);
    }

    // 生成报告
    await this.generateReport(results, errors);
  }

  // 生成监控报告
  async generateReport(results, errors) {
    const report = {
      timestamp: new Date().toISOString(),
      totalDomains: this.config.domains.length,
      successfulChecks: results.length,
      failedChecks: errors.length,
      certificates: results,
      errors: errors
    };

    const reportFile = `certificate-report-${new Date().toISOString().split('T')[0]}.json`;
    this.writeToFile(reportFile, JSON.stringify(report, null, 2));
    
    console.log(`📊 证书监控报告已生成: ${reportFile}`);
  }

  // 写入文件
  writeToFile(filename, content) {
    const filePath = `logs/${filename}`;
    
    // 确保logs目录存在
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs');
    }
    
    fs.appendFileSync(filePath, content, 'utf8');
  }

  // 启动监控服务
  startMonitoring() {
    console.log('🚀 启动证书监控服务...');
    
    // 立即执行一次检查
    this.monitorCertificates().catch(console.error);
    
    // 设置定时检查
    setInterval(() => {
      this.monitorCertificates().catch(console.error);
    }, this.config.checkInterval);
    
    console.log(`⏰ 证书监控已启动，每 ${this.config.checkInterval / (1000 * 60 * 60)} 小时检查一次`);
  }
}

// 使用示例
if (require.main === module) {
  const manager = new CertificateManager();
  
  // 命令行参数处理
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'check':
      manager.checkAllCertificates()
        .then(({ results, errors }) => {
          console.log('\n📋 证书检查完成:');
          console.log(`✅ 成功: ${results.length}`);
          console.log(`❌ 失败: ${errors.length}`);
          
          if (results.length > 0) {
            console.log('\n📊 证书详情:');
            results.forEach(cert => {
              console.log(`  ${cert.domain}: 剩余 ${cert.daysUntilExpiry} 天`);
            });
          }
          
          process.exit(errors.length > 0 ? 1 : 0);
        })
        .catch(error => {
          console.error('检查证书时发生错误:', error);
          process.exit(1);
        });
      break;
      
    case 'monitor':
      manager.startMonitoring();
      break;
      
    case 'renew':
      const domain = args[1];
      if (!domain) {
        console.error('请指定要续期的域名，例如: node certificate-manager.js renew taocang.com');
        process.exit(1);
      }
      
      manager.renewCertificate(domain)
        .then(() => {
          console.log(`✅ ${domain} 证书续期成功`);
          process.exit(0);
        })
        .catch(error => {
          console.error(`❌ ${domain} 证书续期失败:`, error);
          process.exit(1);
        });
      break;
      
    default:
      console.log(`
V2.0 HTTPS证书管理工具

用法:
  node certificate-manager.js <命令> [参数]

命令:
  check     检查所有域名证书状态
  monitor   启动证书监控服务
  renew <域名>  续期指定域名的证书

示例:
  node certificate-manager.js check
  node certificate-manager.js monitor
  node certificate-manager.js renew taocang.com
      `);
      process.exit(0);
  }
}

module.exports = CertificateManager;