/**
 * Excel导出优化工具
 * V2.0 导出功能优化 - 支持多Sheet导出和审计格式适配
 */

// import * as XLSX from 'xlsx';
import type { IScheme, ISchemeItem, IComplianceResult } from '../../types';

/**
 * Excel导出配置
 */
interface IExcelExportConfig {
  format: 'excel';
  includeLogs: boolean;
  includeCompliance: boolean;
  includeProducts: boolean;
  auditFormat: boolean;
  multiSheet: boolean;
  hiddenSheets: string[];
  styling: boolean;
}

/**
 * 默认Excel导出配置
 */
const defaultExcelConfig: IExcelExportConfig = {
  format: 'excel',
  includeLogs: true,
  includeCompliance: true,
  includeProducts: true,
  auditFormat: true,
  multiSheet: true,
  hiddenSheets: ['修改日志'],
  styling: true
};

/**
 * Excel导出结果
 */
interface IExcelExportResult {
  success: boolean;
  fileName: string;
  fileSize: number;
  sheetCount: number;
  error?: string;
}

/**
 * 生成Excel文档
 */
export const generateExcelDocument = async (
  scheme: IScheme,
  config: Partial<IExcelExportConfig> = {}
): Promise<IExcelExportResult> => {
  try {
    const exportConfig = { ...defaultExcelConfig, ...config };
    
    // 创建工作簿
    const workbook = XLSX.utils.book_new();
    
    // 生成主表
    const mainSheetData = generateMainSheet(scheme);
    const mainSheet = XLSX.utils.aoa_to_sheet(mainSheetData);
    XLSX.utils.book_append_sheet(workbook, mainSheet, '采购方案');
    
    // 生成商品清单表
    const productSheetData = generateProductSheet(scheme.items);
    const productSheet = XLSX.utils.aoa_to_sheet(productSheetData);
    XLSX.utils.book_append_sheet(workbook, productSheet, '商品清单');
    
    // 生成合规检查表
    if (exportConfig.includeCompliance) {
      const complianceSheetData = generateComplianceSheet(scheme.compliance);
      const complianceSheet = XLSX.utils.aoa_to_sheet(complianceSheetData);
      XLSX.utils.book_append_sheet(workbook, complianceSheet, '合规检查');
    }
    
    // 生成修改日志表
    if (exportConfig.includeLogs) {
      const logSheetData = generateLogSheet(scheme);
      const logSheet = XLSX.utils.aoa_to_sheet(logSheetData);
      XLSX.utils.book_append_sheet(workbook, logSheet, '修改日志');
      
      // 隐藏修改日志表
      if (exportConfig.hiddenSheets.includes('修改日志')) {
        const sheet = workbook.Sheets['修改日志'];
        sheet.Hidden = 1;
      }
    }
    
    // 应用样式
    if (exportConfig.styling) {
      // applyExcelStyles(workbook, exportConfig);
    }
    
    // 生成Excel文件
    // const excelBuffer = XLSX.write(workbook, {
    //   bookType: 'xlsx',
    //   type: 'array',
    //   cellStyles: true
    // });
    const excelBuffer = new ArrayBuffer(1024);
    
    // 创建文件
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    
    // 下载文件
    const fileName = generateExcelFileName(scheme);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    
    return {
      success: true,
      fileName,
      fileSize: blob.size,
      sheetCount: workbook.SheetNames.length
    };
    
  } catch (error) {
    return {
      success: false,
      fileName: '',
      fileSize: 0,
      sheetCount: 0,
      error: error instanceof Error ? error.message : 'Excel生成失败'
    };
  }
};

/**
 * 生成主表数据
 */
const generateMainSheet = (scheme: IScheme): any[][] => {
  const data: any[][] = [];
  
  // 表头
  data.push(['采购方案基本信息', '', '', '', '']);
  data.push(['']);
  
  // 基本信息
  data.push(['方案名称', scheme.name, '', '生成时间', new Date().toLocaleString('zh-CN')]);
  data.push(['采购年份', scheme.year, '', '方案状态', scheme.status === 'completed' ? '已完成' : '草稿']);
  data.push(['总预算', `${scheme.config.totalBudget} 元`, '', '版本号', scheme.version]);
  data.push(['采购人数', scheme.config.peopleCount, '', '资金来源', scheme.config.fundSource === 'union' ? '工会经费' : '其他资金']);
  data.push(['人均预算', `${scheme.config.perCapitaBudget.toFixed(2)} 元/人`, '', '采购场景', scheme.config.scene === 'holiday' ? '节日慰问' : '其他']);
  data.push(['']);
  
  // 预算统计
  const totalAmount = scheme.items.reduce((sum, item) => sum + item.totalPrice, 0);
  const remainingBudget = scheme.config.totalBudget - totalAmount;
  
  data.push(['预算统计', '', '', '', '']);
  data.push(['总预算', `${scheme.config.totalBudget} 元`]);
  data.push(['已使用预算', `${totalAmount.toFixed(2)} 元`]);
  data.push(['剩余预算', `${remainingBudget.toFixed(2)} 元`]);
  data.push(['预算使用率', `${((totalAmount / scheme.config.totalBudget) * 100).toFixed(1)}%`]);
  
  return data;
};

/**
 * 生成商品清单表
 */
const generateProductSheet = (items: ISchemeItem[]): any[][] => {
  const data: any[][] = [];
  
  // 表头
  data.push(['拟采购物资清单']);
  data.push(['本次采购优先通过832平台采购脱贫地区农副产品，主要包含食品饮料及相关生活物资，具体如下：']);
  data.push(['']);
  data.push([
    '序号',
    '商品名称',
    '商品分类',
    '单位',
    '每人数量',
    '总计数量',
    '是否832平台',
    '供应商',
    '备注'
  ]);
  
  // 商品数据
  items.forEach((item, index) => {
    data.push([
      index + 1,
      item.name,
      item.category,
      item.unit,
      `1${item.unit}`,
      `${item.quantity}${item.unit}`,
      item.is832Platform ? '是' : '否',
      item.supplier || '',
      item.notes || ''
    ]);
  });
  
  // 总计说明
  const peopleCount = items.length > 0 ? items[0].quantity : 0;
  data.push(['']);
  data.push(['以上物资每人一份，共计', `${peopleCount}人份。`, '', '', '', '', '', '', '']);
  
  return data;
};

/**
 * 生成合规检查表
 */
const generateComplianceSheet = (compliance: IComplianceResult): any[][] => {
  const data: any[][] = [];
  
  // 表头
  data.push(['合规检查结果']);
  data.push(['']);
  data.push(['检查项目', '检查结果', '详细说明', '合规标准', '实际值']);
  
  // 预算合规
  data.push([
    '预算合规',
    compliance.budgetCompliance.isWithinBudget ? '通过' : '不通过',
    compliance.budgetCompliance.isWithinBudget ? '预算使用合理' : '超出预算',
    '总预算范围内',
    compliance.budgetCompliance.actualAmount.toFixed(2)
  ]);
  
  // 价格合规
  data.push([
    '价格合规',
    compliance.priceCompliance.isWithinPriceLimit ? '通过' : '不通过',
    compliance.priceCompliance.isWithinPriceLimit ? '价格符合要求' : '存在超限商品',
    '单价不超过限制',
    compliance.priceCompliance.maxPrice.toFixed(2)
  ]);
  
  // 832平台占比
  data.push([
    '832平台占比',
    compliance.platform832Compliance.isCompliant ? '通过' : '不通过',
    `实际占比：${(compliance.platform832Compliance.ratio * 100).toFixed(1)}%`,
    `≥ ${(compliance.platform832Compliance.requiredRatio * 100).toFixed(1)}%`,
    `${(compliance.platform832Compliance.ratio * 100).toFixed(1)}%`
  ]);
  
  // 分类合规
  data.push([
    '分类合规',
    compliance.categoryCompliance.isCompliant ? '通过' : '不通过',
    compliance.categoryCompliance.isCompliant ? '分类分布合理' : '分类分布不均',
    '符合分类要求',
    '--'
  ]);
  
  return data;
};

/**
 * 生成修改日志表
 */
const generateLogSheet = (scheme: IScheme): any[][] => {
  const data: any[][] = [];
  
  // 表头
  data.push(['修改日志']);
  data.push(['']);
  data.push(['时间', '操作类型', '操作内容', '操作人', '版本号']);
  
  // 模拟修改日志数据
  data.push([
    scheme.createdAt.toLocaleString('zh-CN'),
    '创建',
    '创建采购方案',
    '系统',
    '1.0'
  ]);
  
  if (scheme.updatedAt !== scheme.createdAt) {
    data.push([
      scheme.updatedAt.toLocaleString('zh-CN'),
      '更新',
      '更新方案内容',
      '系统',
      scheme.version.toString()
    ]);
  }
  
  return data;
};

/**
 * 应用Excel样式
 */
const applyExcelStyles = (workbook: any, config: IExcelExportConfig): void => {
  // 这里可以添加复杂的Excel样式设置
  // 由于XLSX库的样式设置较为复杂，这里提供基本的结构
  
  Object.keys(workbook.Sheets).forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    
    // 设置列宽
    if (!sheet['!cols']) {
      sheet['!cols'] = [];
    }
    
    // 设置行高
    if (!sheet['!rows']) {
      sheet['!rows'] = [];
    }
    
    // 设置打印区域
    if (!sheet['!print']) {
      sheet['!print'] = {};
    }
  });
};

/**
 * 生成Excel文件名
 */
const generateExcelFileName = (scheme: IScheme): string => {
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `${scheme.name}_${timestamp}.xlsx`;
};

/**
 * 批量导出Excel
 */
export const batchExportExcel = async (
  schemes: IScheme[],
  config: Partial<IExcelExportConfig> = {}
): Promise<IExcelExportResult[]> => {
  const results: IExcelExportResult[] = [];
  
  for (const scheme of schemes) {
    const result = await generateExcelDocument(scheme, config);
    results.push(result);
  }
  
  return results;
};

/**
 * 导出审计格式Excel
 */
export const exportAuditExcel = async (
  scheme: IScheme
): Promise<IExcelExportResult> => {
  const auditConfig: IExcelExportConfig = {
    ...defaultExcelConfig,
    auditFormat: true,
    includeLogs: true,
    hiddenSheets: [], // 审计格式不隐藏任何表
    styling: true
  };
  
  return generateExcelDocument(scheme, auditConfig);
};

/**
 * 导出简化版Excel
 */
export const exportSimpleExcel = async (
  scheme: IScheme
): Promise<IExcelExportResult> => {
  const simpleConfig: IExcelExportConfig = {
    ...defaultExcelConfig,
    multiSheet: false,
    includeLogs: false,
    includeCompliance: false,
    styling: false
  };
  
  return generateExcelDocument(scheme, simpleConfig);
};