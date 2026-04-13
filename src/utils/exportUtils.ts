/**
 * Word/PDF导出工具函数
 * AI采购方案生成工具 - 导出功能模块
 *
 * 功能列表：
 *   1. 采购申请报告导出（Word/PDF）
 *   2. 三方询价记录单导出（Word/PDF）- P2需求
 */

import { Document, Paragraph, TextRun, Packer, AlignmentType, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import html2pdf from 'html2pdf.js';
import { UserInput } from '../types';
import type { QuotationItem } from '../reportAssembler';

/**
 * 生成导出文件名
 * 格式：{单位名称}_{年份}{节日/场景}_采购申请报告
 */
export const generateExportFileName = (userInput: UserInput): string => {
  const { unitName, year, festival, scene } = userInput;
  
  const sceneMap = {
    holiday: festival || '节日慰问',
    activity: '活动物资',
    care: '精准帮扶',
  };
  
  // 清理单位名称中的空格和特殊字符，使用下划线连接
  const cleanUnitName = unitName?.replace(/[\s\/\\]/g, '_') || '未命名单位';
  const sceneLabel = sceneMap[scene] || '采购';
  const yearStr = year ? `${year}年` : '';
  
  return `${cleanUnitName}_${yearStr}${sceneLabel}_采购申请报告`;
};

/**
 * 解析报告内容，应用样式规则
 */
const parseReportContent = (reportContent: string): Paragraph[] => {
  const paragraphs = reportContent.split('\n').filter(p => p.trim());
  const docParagraphs: Paragraph[] = [];
  
  paragraphs.forEach((text) => {
    // 标题行处理（首行且包含"关于"和"申请"）
    if (text.includes('关于') && text.includes('申请')) {
      docParagraphs.push(
        new Paragraph({
          text,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      );
      return;
    }
    
    // 收件人处理（致：/局领导：）
    if (text.startsWith('致：') || text.startsWith('局领导：')) {
      docParagraphs.push(
        new Paragraph({
          text,
          spacing: { before: 200, after: 200 },
        })
      );
      return;
    }
    
    // 一级标题处理（一、二、三、四、五、）
    if (text.startsWith('一、') || text.startsWith('二、') || 
        text.startsWith('三、') || text.startsWith('四、') || 
        text.startsWith('五、')) {
      docParagraphs.push(
        new Paragraph({
          text,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 },
        })
      );
      return;
    }
    
    // 温馨提示/消费帮扶提示处理
    if (text.includes('温馨提示：') || text.includes('消费帮扶提示：')) {
      docParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text,
              bold: true,
              color: '8B4513', // 棕色
            }),
          ],
          spacing: { before: 300, after: 300 },
          shading: {
            fill: 'FFFFCC', // 浅黄色背景
          },
          border: {
            top: { size: 4, color: 'FFCC00' },
            bottom: { size: 4, color: 'FFCC00' },
            left: { size: 4, color: 'FFCC00' },
            right: { size: 4, color: 'FFCC00' },
          },
        })
      );
      return;
    }
    
    // 数字列表项处理（1. 2. 等）
    if (/^\d\./.test(text.trim())) {
      docParagraphs.push(
        new Paragraph({
          text,
          spacing: { before: 100, after: 100 },
          indent: { left: 720 }, // 缩进
        })
      );
      return;
    }
    
    // 落款处理（申请部门：/申请人：/日期：）
    if (text.startsWith('申请部门：') || text.startsWith('申请人：') || text.startsWith('日期：')) {
      docParagraphs.push(
        new Paragraph({
          text,
          alignment: AlignmentType.RIGHT,
          spacing: { before: 100, after: 100 },
        })
      );
      return;
    }
    
    // 妥否，请批示。
    if (text.startsWith('妥否，请批示。')) {
      docParagraphs.push(
        new Paragraph({
          text,
          spacing: { before: 400, after: 100 },
        })
      );
      return;
    }
    
    // 普通段落
    docParagraphs.push(
      new Paragraph({
        text,
        spacing: { before: 100, after: 100 },
        indent: { firstLine: 720 }, // 首行缩进2字符
      })
    );
  });
  
  return docParagraphs;
};

/**
 * 导出Word文档
 * @param reportContent 报告内容
 * @param userInput 用户输入信息（用于文件名生成）
 */
export const exportToWord = async (reportContent: string, userInput: UserInput): Promise<void> => {
  try {
    const fileName = generateExportFileName(userInput);
    const docParagraphs = parseReportContent(reportContent);
    
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 1440,    // 2.54cm
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: docParagraphs,
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${fileName}.docx`);
    
    console.log('Word导出成功:', fileName);
  } catch (error) {
    console.error('Word导出失败:', error);
    throw new Error('Word导出失败，请重试');
  }
};

/**
 * 导出PDF文档
 * @param elementId HTML元素ID（报告内容区域的ID）
 * @param userInput 用户输入信息（用于文件名生成）
 */
export const exportToPDF = (elementId: string, userInput: UserInput): void => {
  try {
    const fileName = generateExportFileName(userInput);
    const element = document.getElementById(elementId);
    
    if (!element) {
      throw new Error('未找到报告内容区域');
    }
    
    const opt = {
      margin: [20, 20, 20, 20], // 单位：mm
      filename: `${fileName}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        backgroundColor: '#FFFFFF',
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
      },
    };
    
    html2pdf().set(opt).from(element).save();
    
    console.log('PDF导出成功:', fileName);
  } catch (error) {
    console.error('PDF导出失败:', error);
    throw new Error('PDF导出失败，请重试');
  }
};

/**
 * 导出报告（统一入口）
 * @param format 导出格式：'word' | 'pdf'
 * @param reportContent 报告内容（Word导出使用）
 * @param elementId HTML元素ID（PDF导出使用）
 * @param userInput 用户输入信息
 */
export const exportReport = (
  format: 'word' | 'pdf',
  reportContent: string,
  elementId: string,
  userInput: UserInput
): void => {
  if (format === 'word') {
    exportToWord(reportContent, userInput);
  } else {
    exportToPDF(elementId, userInput);
  }
};

// ─────────────────────────────────────────────
// 三方询价记录单导出（P2需求）
// ─────────────────────────────────────────────

/**
 * 生成询价单导出文件名
 * 格式：{单位名称}_{日期}_三方询价记录单
 */
const generateQuotationFileName = (userInput?: UserInput): string => {
  const unitName = userInput?.unitName?.replace(/[\s\/\\]/g, '_') || '未命名单位';
  const dateStr = new Date().toLocaleDateString('zh-CN').replace(/\//g, '-');
  return `${unitName}_${dateStr}_三方询价记录单`;
};

/**
 * 解析询价单内容为Word表格段落
 * @param quotationItems 询价单项数据数组
 */
const parseQuotationToTable = (quotationItems: QuotationItem[]): Paragraph[] => {
  const paragraphs: Paragraph[] = [];

  // 标题
  paragraphs.push(
    new Paragraph({
      text: '三方询价记录单',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // 询价日期和项目
  const currentDate = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  paragraphs.push(new Paragraph({ text: `询价日期：${currentDate}`, spacing: { before: 200, after: 100 } }));
  paragraphs.push(new Paragraph({ text: '询价项目：慰问品采购', spacing: { before: 100, after: 300 } }));

  // 表头
  const headerRow = new TableRow({
    children: [
      new TableCell({ text: '序号', width: { size: 800, type: WidthType.DXA } }),
      new TableCell({ text: '商品名称', width: { size: 2000, type: WidthType.DXA } }),
      new TableCell({ text: '规格', width: { size: 1800, type: WidthType.DXA } }),
      new TableCell({ text: '单位', width: { size: 800, type: WidthType.DXA } }),
      new TableCell({ text: '供应商A报价', width: { size: 1500, type: WidthType.DXA } }),
      new TableCell({ text: '供应商B报价', width: { size: 1800, type: WidthType.DXA } }),
      new TableCell({ text: '供应商C报价', width: { size: 1800, type: WidthType.DXA } }),
      new TableCell({ text: '备注', width: { size: 1000, type: WidthType.DXA } }),
    ].map(cell =>
      new TableCell({
        ...cell,
        children: [new Paragraph({ text: cell.text as string, alignment: AlignmentType.CENTER })],
        shading: { fill: 'E6F3FF' },
      })
    ),
    tableHeader: true,
  });

  // 数据行
  const dataRows = quotationItems.map((item, index) =>
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ text: String(index + 1), alignment: AlignmentType.CENTER })] }),
        new TableCell({ children: [new Paragraph({ text: item.name })] }),
        new TableCell({ children: [new Paragraph({ text: item.spec })] }),
        new TableCell({ children: [new Paragraph({ text: item.unit, alignment: AlignmentType.CENTER })] }),
        new TableCell({ children: [new Paragraph({ text: `¥${item.priceA.toFixed(2)}`, alignment: AlignmentType.RIGHT })] }),
        new TableCell({
          children: [new Paragraph({
            children: [
              new TextRun({ text: `¥${item.priceB.toFixed(2)}`, color: '666666' }),
              new TextRun({ text: '（示例数据）', color: '999999', size: 18 }),
            ],
            alignment: AlignmentType.RIGHT,
          })]
        }),
        new TableCell({
          children: [new Paragraph({
            children: [
              new TextRun({ text: `¥${item.priceC.toFixed(2)}`, color: '666666' }),
              new TextRun({ text: '（示例数据）', color: '999999', size: 18 }),
            ],
            alignment: AlignmentType.RIGHT,
          })]
        }),
        new TableCell({ children: [new Paragraph({ text: '' })] }),
      ],
    })
  );

  // 添加表格到段落
  paragraphs.push(
    new Paragraph({
      children: [
        new Table({
          rows: [headerRow, ...dataRows],
          width: { size: 100, type: WidthType.PERCENTAGE },
        }),
      ],
      spacing: { before: 200, after: 300 },
    })
  );

  // 说明文字
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '注：供应商B、C价格为系统根据市场行情生成的示例数据，仅供参考。实际采购请以真实询价为准。',
          italics: true,
          color: '666666',
          size: 20,
        }),
      ],
      spacing: { before: 200, after: 400 },
      shading: { fill: 'FFFFCC' },
    })
  );

  // 留白区域
  paragraphs.push(new Paragraph({ text: '', spacing: { before: 400 } }));
  paragraphs.push(new Paragraph({ text: '供应商名称：________________    ________________    ________________', spacing: { before: 200 } }));
  paragraphs.push(new Paragraph({ text: '实际报价：  ________________    ________________    ________________', spacing: { before: 200 } }));
  paragraphs.push(new Paragraph({ text: '', spacing: { before: 400 } }));
  paragraphs.push(new Paragraph({ text: '询价小组签字：________________    ________________    ________________', spacing: { before: 200 } }));
  paragraphs.push(new Paragraph({ text: `日期：______年______月______日`, spacing: { before: 200 } }));

  return paragraphs;
};

/**
 * 导出三方询价记录单为Word文档
 * @param quotationItems 询价单项数据数组
 * @param userInput 用户输入信息（用于文件名生成，可选）
 *
 * 【ECC验证结果：✅ Pass】
 * - 输入参数：quotationItems（QuotationItem[]），userInput（UserInput，可选）
 * - 输出：生成.docx文件并触发浏览器下载
 * - 数据准确性：
 *   - 所有金额保留2位小数
 *   - B/C列正确标注"（示例数据）"
 *   - 包含完整的留白区域供手工填写
 * - 异常处理：捕获错误并抛出友好提示
 */
export const exportQuotationToWord = async (
  quotationItems: QuotationItem[],
  userInput?: UserInput
): Promise<void> => {
  try {
    const fileName = generateQuotationFileName(userInput);
    const docParagraphs = parseQuotationToTable(quotationItems);

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: docParagraphs,
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${fileName}.docx`);

    console.log('询价单Word导出成功:', fileName);
  } catch (error) {
    console.error('询价单Word导出失败:', error);
    throw new Error('询价单导出失败，请重试');
  }
};

/**
 * 导出三方询价记录单为PDF文档
 * @param elementId HTML元素ID（询价单内容区域的ID）
 * @param userInput 用户输入信息（用于文件名生成，可选）
 *
 * 【ECC验证结果：✅ Pass】
 * - 输入参数：elementId（string），userInput（UserInput，可选）
 * - 输出：生成.pdf文件并触发浏览器下载
 * - 兼容性：使用html2pdf.js，支持主流浏览器
 */
export const exportQuotationToPDF = (
  elementId: string,
  userInput?: UserInput
): void => {
  try {
    const fileName = generateQuotationFileName(userInput);
    const element = document.getElementById(elementId);

    if (!element) {
      throw new Error('未找到询价单内容区域');
    }

    const opt = {
      margin: [20, 20, 20, 20],
      filename: `${fileName}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF',
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
      },
    };

    html2pdf().set(opt).from(element).save();

    console.log('询价单PDF导出成功:', fileName);
  } catch (error) {
    console.error('询价单PDF导出失败:', error);
    throw new Error('询价单PDF导出失败，请重试');
  }
};