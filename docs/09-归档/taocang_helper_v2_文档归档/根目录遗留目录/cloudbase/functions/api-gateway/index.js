// CloudBase API网关函数
// V2.0 后端API服务

const tcb = require('@cloudbase/node-sdk');

// 初始化CloudBase
const app = tcb.init({
  env: process.env.TCB_ENV || 'taocang-prod'
});

const db = app.database();

// 主处理函数
exports.main = async (event, context) => {
  const { path, httpMethod, headers, queryString, body } = event;
  
  try {
    // 设置CORS头
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400'
    };

    // 处理预检请求
    if (httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: ''
      };
    }

    // 路由处理
    const route = path.replace('/api', '');
    
    let result;
    switch (route) {
      case '/schemes':
        result = await handleSchemes(httpMethod, body, queryString);
        break;
      case '/products':
        result = await handleProducts(httpMethod, body, queryString);
        break;
      case '/export':
        result = await handleExport(httpMethod, body, queryString);
        break;
      case '/health':
        result = await handleHealthCheck();
        break;
      default:
        result = {
          statusCode: 404,
          body: JSON.stringify({ error: '接口不存在' })
        };
    }

    return {
      ...result,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json; charset=utf-8'
      }
    };

  } catch (error) {
    console.error('API处理错误:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({ 
        error: '服务器内部错误',
        message: error.message 
      })
    };
  }
};

// 方案管理接口
async function handleSchemes(method, body, query) {
  const collection = db.collection('schemes');
  
  switch (method) {
    case 'GET':
      // 获取方案列表
      const { year, page = 1, limit = 10 } = query;
      let queryCondition = {};
      
      if (year) {
        queryCondition.year = parseInt(year);
      }
      
      const schemes = await collection
        .where(queryCondition)
        .orderBy('createdAt', 'desc')
        .skip((page - 1) * limit)
        .limit(limit)
        .get();
      
      const total = await collection.where(queryCondition).count();
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          data: schemes.data,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: total.total
          }
        })
      };

    case 'POST':
      // 创建新方案
      const schemeData = JSON.parse(body || '{}');
      const newScheme = {
        ...schemeData,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'draft'
      };
      
      const result = await collection.add(newScheme);
      
      return {
        statusCode: 201,
        body: JSON.stringify({
          id: result.id,
          message: '方案创建成功'
        })
      };

    case 'PUT':
      // 更新方案
      const updateData = JSON.parse(body || '{}');
      const { id, ...updateFields } = updateData;
      
      if (!id) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: '缺少方案ID' })
        };
      }
      
      await collection.doc(id).update({
        ...updateFields,
        updatedAt: new Date()
      });
      
      return {
        statusCode: 200,
        body: JSON.stringify({ message: '方案更新成功' })
      };

    default:
      return {
        statusCode: 405,
        body: JSON.stringify({ error: '方法不允许' })
      };
  }
}

// 商品管理接口
async function handleProducts(method, body, query) {
  const collection = db.collection('products');
  
  switch (method) {
    case 'GET':
      // 获取商品列表
      const { category, keyword, page = 1, limit = 20 } = query;
      let queryCondition = {};
      
      if (category) {
        queryCondition.category = category;
      }
      
      if (keyword) {
        queryCondition.name = db.RegExp({
          regexp: keyword,
          options: 'i'
        });
      }
      
      const products = await collection
        .where(queryCondition)
        .orderBy('createdAt', 'desc')
        .skip((page - 1) * limit)
        .limit(limit)
        .get();
      
      const total = await collection.where(queryCondition).count();
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          data: products.data,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: total.total
          }
        })
      };

    default:
      return {
        statusCode: 405,
        body: JSON.stringify({ error: '方法不允许' })
      };
  }
}

// 导出接口
async function handleExport(method, body, query) {
  if (method !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: '只支持POST方法' })
    };
  }
  
  const exportData = JSON.parse(body || '{}');
  const { type, schemeId, format = 'pdf' } = exportData;
  
  if (!schemeId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: '缺少方案ID' })
    };
  }
  
  try {
    // 获取方案数据
    const scheme = await db.collection('schemes').doc(schemeId).get();
    
    if (!scheme.data) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: '方案不存在' })
      };
    }
    
    // 生成导出文件（这里简化处理，实际需要调用相应的导出服务）
    const exportResult = await generateExportFile(scheme.data, format);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: '导出任务已提交',
        taskId: exportResult.taskId,
        estimatedTime: '30秒'
      })
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: '导出失败',
        message: error.message 
      })
    };
  }
}

// 健康检查接口
async function handleHealthCheck() {
  try {
    // 检查数据库连接
    await db.collection('schemes').count();
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        environment: process.env.TCB_ENV || 'unknown'
      })
    };
  } catch (error) {
    return {
      statusCode: 503,
      body: JSON.stringify({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
}

// 生成导出文件（简化版）
async function generateExportFile(schemeData, format) {
  // 实际实现中这里会调用相应的导出服务
  // 现在返回模拟数据
  return {
    taskId: `export-${Date.now()}`,
    format: format,
    status: 'processing'
  };
}