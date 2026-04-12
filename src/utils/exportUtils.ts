/**
 * Word/PDF导出工具函数
 * AI采购方案生成工具 - 导出功能模块
 */

import { Document, Paragraph, TextRun, Packer, AlignmentType, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import html2pdf from 'html2pdf.js';
import { UserInput } from '../types';

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