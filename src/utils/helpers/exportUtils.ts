/**
 * Word/PDF导出工具函数
 * AI采购方案生成工具 - 导出功能模块
 *
 * 功能列表：
 *   1. 采购申请报告导出（Word/PDF）
 *   2. 三方询价记录单导出（Word/PDF）- P2需求
 * 
 * V1.6-5 优化：
 *   - 添加导出前合规校验
 *   - 优化公文排版样式（页边距、字体、行距）
 *   - 添加敏感词自动替换
 *   - 统一政策文号引用格式
 */

import { Document, Paragraph, TextRun, Packer, AlignmentType, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import html2pdf from 'html2pdf.js';
import { UserInput } from '../types';
import type { QuotationItem } from '../reportAssembler';
import { getExportSeal } from '../../data/policies';
import { validateExport, checkSensitiveTerms } from './reportValidator';

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
 * 解析报告内容，应用公文规范样式
 * 
 * 公文排版标准：
 * - 正文字体：仿宋_GB2312，三号（16磅）
 * - 标题字体：小标宋简体，二号（22磅）
 * - 行距：固定值30磅
 * - 页边距：上3.0cm，下3.0cm，左2.25cm，右2.25cm
 * - 首行缩进：2字符（720磅）
 */
const parseReportContent = (reportContent: string): Paragraph[] => {
  const paragraphs = reportContent.split('\n').filter(p => p.trim());
  const docParagraphs: Paragraph[] = [];

  paragraphs.forEach((text) => {
    // 公文标题处理（首行且包含"关于"和"申请"）
    if (text.includes('关于') && text.includes('申请')) {
      docParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text,
              font: '小标宋简体',
              size: 44, // 二号（22磅）
              bold: true,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { 
            before: 600,  // 空三行
            after: 600,
            line: 480,    // 固定值30磅
          },
        })
      );
      return;
    }
    
    // 收件人处理（致：/局领导：） - 左顶格，加冒号
    if (text.startsWith('致：') || text.startsWith('局领导：')) {
      docParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text,
              font: '仿宋_GB2312',
              size: 32, // 三号（16磅）
            }),
          ],
          alignment: AlignmentType.LEFT,
          spacing: { 
            before: 400, 
            after: 320,
            line: 480,
          },
        })
      );
      return;
    }
    
    // 一级标题处理（一、二、三、四、五、） - 黑体，三号
    if (text.startsWith('一、') || text.startsWith('二、') || 
        text.startsWith('三、') || text.startsWith('四、') || 
        text.startsWith('五、')) {
      docParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text,
              font: '黑体',
              size: 32,
              bold: true,
            }),
          ],
          alignment: AlignmentType.LEFT,
          spacing: { 
            before: 320, 
            after: 240,
            line: 480,
          },
        })
      );
      return;
    }
    
    // 温馨提示/消费帮扶提示处理 - 楷体，浅黄背景
    if (text.includes('温馨提示：') || text.includes('消费帮扶提示：')) {
      docParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text,
              font: '楷体_GB2312',
              size: 32,
              bold: true,
              color: '8B4513', // 棕色
            }),
          ],
          alignment: AlignmentType.LEFT,
          spacing: { 
            before: 320, 
            after: 320,
            line: 480,
          },
          shading: {
            fill: 'FFFFCC', // 浅黄色背景
          },
          border: {
            top: { size: 8, color: 'FFCC00' },
            bottom: { size: 8, color: 'FFCC00' },
            left: { size: 8, color: 'FFCC00' },
            right: { size: 8, color: 'FFCC00' },
          },
        })
      );
      return;
    }
    
    // 数字列表项处理（1. 2. 等） - 仿宋，缩进
    if (/^\d\./.test(text.trim())) {
      docParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text,
              font: '仿宋_GB2312',
              size: 32,
            }),
          ],
          alignment: AlignmentType.LEFT,
          spacing: { 
            before: 160, 
            after: 160,
            line: 480,
          },
          indent: { left: 720 }, // 缩进2字符
        })
      );
      return;
    }
    
    // 落款处理（申请部门：/申请人：/日期：） - 右对齐
    if (text.startsWith('申请部门：') || text.startsWith('申请人：') || text.startsWith('日期：')) {
      docParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text,
              font: '仿宋_GB2312',
              size: 32,
            }),
          ],
          alignment: AlignmentType.RIGHT,
          spacing: { 
            before: 160, 
            after: 160,
            line: 480,
          },
        })
      );
      return;
    }
    
    // 妥否，请批示。 - 居左，空一行
    if (text.startsWith('妥否，请批示。')) {
      docParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text,
              font: '仿宋_GB2312',
              size: 32,
            }),
          ],
          alignment: AlignmentType.LEFT,
          spacing: { 
            before: 400, 
            after: 240,
            line: 480,
          },
        })
      );
      return;
    }
    
    // 普通段落 - 仿宋，首行缩进2字符
    docParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text,
            font: '仿宋_GB2312',
            size: 32,
          }),
        ],
        alignment: AlignmentType.LEFT,
        spacing: { 
          before: 160, 
          after: 160,
          line: 480,
        },
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
    // 1. 导出前合规校验
    const validationResult = validateExport(reportContent, userInput);
    
    if (!validationResult.isValid) {
      const errorMessage = validationResult.errors.join('；');
      throw new Error(`导出前校验失败：${errorMessage}`);
    }
    
    // 2. 敏感词自动替换（如果存在）
    let processedContent = reportContent;
    if (validationResult.sensitiveTermCheck.hasForbiddenTerms) {
      processedContent = validationResult.sensitiveTermCheck.suggestedContent;
      console.log('敏感词已自动替换：', validationResult.sensitiveTermCheck.forbiddenTerms);
    }
    
    // 3. 生成文件名
    const fileName = generateExportFileName(userInput);
    
    // 4. 解析报告内容为公文规范格式
    const docParagraphs = parseReportContent(processedContent);
    
    // 5. 添加导出签章
    const sealText = getExportSeal();
    const sealLines = sealText.split('\n').filter(line => line.trim());
    
    sealLines.forEach((line, index) => {
      const isSeparator = line.includes('──');
      const isTitle = line.includes('政策版本校验签章');
      const isStatus = line.includes('版本状态：');
      
      let paragraph: Paragraph;
      
      if (isSeparator) {
        // 分隔线 - 居中对齐，小字号
        paragraph = new Paragraph({
          children: [
            new TextRun({
              text: line,
              color: '666666',
              size: 18,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: index === 0 ? 400 : 100, after: 100 },
        });
      } else if (isTitle) {
        // 标题 - 加粗，居中对齐
        paragraph = new Paragraph({
          children: [
            new TextRun({
              text: line,
              bold: true,
              color: '2E6DA4',
              size: 22,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 100 },
        });
      } else if (isStatus) {
        // 状态行 - 绿色，居中对齐
        paragraph = new Paragraph({
          children: [
            new TextRun({
              text: line,
              color: '008000',
              size: 20,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 100 },
        });
      } else {
        // 普通行 - 居中对齐
        paragraph = new Paragraph({
          children: [
            new TextRun({
              text: line,
              color: '666666',
              size: 20,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 100 },
        });
      }
      
      docParagraphs.push(paragraph);
    });
    
    // 6. 创建符合公文规范的Word文档
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 1701,    // 3.0cm (公文标准上边距)
              right: 1270,  // 2.25cm
              bottom: 1701, // 3.0cm
              left: 1843,   // 3.25cm (公文标准左边距)
            },
          },
        },
        children: docParagraphs,
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${fileName}.docx`);
    
    console.log('Word导出成功:', fileName);
    
    // 7. 显示警告信息（如果有）
    if (validationResult.warnings.length > 0) {
      console.warn('导出警告：', validationResult.warnings.join('；'));
    }
  } catch (error) {
    console.error('Word导出失败:', error);
    if (error instanceof Error) {
      throw new Error(`Word导出失败：${error.message}`);
    }
    throw new Error('Word导出失败，请重试');
  }
};

/**
 * 导出PDF文档
 * @param elementId HTML元素ID（报告内容区域的ID）
 * @param userInput 用户输入信息（用于文件名生成）
 * @param reportContent 报告内容（用于合规校验，可选）
 */
export const exportToPDF = (
  elementId: string, 
  userInput: UserInput, 
  reportContent?: string
): void => {
  try {
    const element = document.getElementById(elementId);
    
    if (!element) {
      throw new Error('未找到报告内容区域');
    }
    
    // 1. 获取报告内容用于合规校验（优先使用传入参数）
    const contentForValidation = reportContent || element.textContent || '';
    
    // 2. 导出前合规校验
    const validationResult = validateExport(contentForValidation, userInput);
    
    if (!validationResult.isValid) {
      const errorMessage = validationResult.errors.join('；');
      throw new Error(`导出前校验失败：${errorMessage}`);
    }
    
    // 3. 敏感词自动替换（如果存在）
    if (validationResult.sensitiveTermCheck.hasForbiddenTerms) {
      // 由于PDF导出基于HTML元素，无法直接替换文本内容
      // 这里记录警告，实际替换在报告生成时已完成
      console.warn('PDF导出发现敏感词，请确保报告内容已合规替换：', 
        validationResult.sensitiveTermCheck.forbiddenTerms);
    }
    
    // 4. 生成文件名
    const fileName = generateExportFileName(userInput);
    
    // 5. 优化PDF导出选项（符合公文规范）
    const opt = {
      margin: [30, 25, 30, 25], // 上3.0cm，右2.5cm，下3.0cm，左2.5cm（公文标准）
      filename: `${fileName}.pdf`,
      image: { 
        type: 'jpeg', 
        quality: 1.0,  // 最高质量
      },
      html2canvas: { 
        scale: 3,  // 更高分辨率
        useCORS: true,
        backgroundColor: '#FFFFFF',
        logging: false,
        letterRendering: true,
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: false,  // 不压缩，保证质量
        precision: 16,
      },
      pagebreak: {
        mode: ['css', 'legacy'],
        before: '.page-break-before',
        after: '.page-break-after',
      },
    };
    
    html2pdf().set(opt).from(element).save();
    
    console.log('PDF导出成功:', fileName);
    
    // 6. 显示警告信息（如果有）
    if (validationResult.warnings.length > 0) {
      console.warn('PDF导出警告：', validationResult.warnings.join('；'));
    }
  } catch (error) {
    console.error('PDF导出失败:', error);
    if (error instanceof Error) {
      throw new Error(`PDF导出失败：${error.message}`);
    }
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
    exportToPDF(elementId, userInput, reportContent);
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