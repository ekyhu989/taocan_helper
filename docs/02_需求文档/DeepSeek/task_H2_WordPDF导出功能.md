# 任务指令 H2: Word/PDF导出功能

**任务类型**: 核心功能开发  
**优先级**: 🔴 高  
**分配给**: 集成-DeepSeek  
**预计工时**: 6-8小时  
**状态**: 待开发

---

## 任务概述

为公文生成页增加导出功能，支持将生成的采购申请报告导出为Word(.docx)和PDF(.pdf)格式，保留公文格式和排版，便于用户打印或存档。

---

## 验收标准（必须全部完成）

### 导出功能
- [ ] 公文预览区域增加"导出Word"按钮
- [ ] 公文预览区域增加"导出PDF"按钮
- [ ] 点击按钮后触发对应格式的文件下载
- [ ] 导出文件名格式：`{单位名称}_{年份}{节日/场景}_采购申请报告.{docx/pdf}`
- [ ] 文件名中去除空格和特殊字符，使用下划线连接

### Word导出要求
- [ ] 使用 `docx` 库生成真正的Word文档（不是HTML转存）
- [ ] 文档包含正确的标题样式（标题居中、加粗）
- [ ] 正文段落格式正确（首行缩进、行间距）
- [ ] 数字列表项格式正确
- [ ] 落款部分右对齐
- [ ] 温馨提示部分使用特殊背景色或边框标识
- [ ] 页眉可添加单位名称（可选）

### PDF导出要求
- [ ] 使用 `html2pdf.js` 基于现有预览HTML生成PDF
- [ ] PDF保留现有CSS样式（颜色、字体、布局）
- [ ] 页边距合理（建议2cm）
- [ ] 内容不溢出页面边界
- [ ] 支持分页（长文档自动分页）

### 兼容性要求
- [ ] 导出的Word文档可用Microsoft Word和WPS正常打开
- [ ] 导出的PDF可用Adobe Reader和浏览器正常打开
- [ ] 移动端导出功能正常（文件下载到设备）

---

## 技术实现细节

### 依赖安装

```bash
npm install docx file-saver html2pdf.js
```

### 需新增文件

1. **src/utils/exportUtils.ts**
   - `exportToWord(reportContent, fileName)` - Word导出函数
   - `exportToPDF(reportContent, fileName)` - PDF导出函数

### 需修改文件

1. **src/components/ProcurementReport.jsx**
   - 添加导出按钮组
   - 调用导出工具函数

### Word导出实现示例

```typescript
import { Document, Paragraph, TextRun, Packer, AlignmentType, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

export const exportToWord = async (reportContent: string, fileName: string) => {
  // 解析报告内容，按段落分割
  const paragraphs = reportContent.split('\n').filter(p => p.trim());
  
  const doc = new Document({
    sections: [{
      properties: {},
      children: paragraphs.map(text => {
        // 判断段落类型，应用不同样式
        if (text.startsWith('关于') && text.includes('申请')) {
          // 标题
          return new Paragraph({
            text,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          });
        }
        // ... 其他段落类型处理
        return new Paragraph({
          text,
          spacing: { after: 200 },
        });
      }),
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${fileName}.docx`);
};
```

### PDF导出实现示例

```typescript
import html2pdf from 'html2pdf.js';

export const exportToPDF = (elementId: string, fileName: string) => {
  const element = document.getElementById('report-content');
  const opt = {
    margin: [20, 20, 20, 20], // 单位：mm
    filename: `${fileName}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  };
  
  html2pdf().set(opt).from(element).save();
};
```

---

## UI设计要求

### 导出按钮布局
```
┌─────────────────────────────────────────────────────────┐
│  采购申请报告                              [示例公文]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [报告内容区域]                                         │
│                                                         │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [📄 导出Word]  [📑 导出PDF]                           │
└─────────────────────────────────────────────────────────┘
```

### 按钮样式
- 使用Tailwind CSS样式
- 主色调：蓝色系（bg-blue-600）
- 按钮间距：gap-4
- 图标：可使用Emoji或SVG

---

## 文件命名规则

```typescript
const generateFileName = (userInput: UserInput) => {
  const { unitName, year, festival, scene } = userInput;
  const sceneMap = {
    holiday: festival || '节日慰问',
    activity: '活动物资',
    care: '精准帮扶',
  };
  
  const cleanUnitName = unitName?.replace(/[\s\/\\]/g, '_') || '未命名单位';
  const sceneLabel = sceneMap[scene] || '采购';
  
  return `${cleanUnitName}_${year}年${sceneLabel}_采购申请报告`;
};
```

---

## 合规性要求

⚠️ **必须遵守**:
1. 导出文件中的术语必须合规（采购/方案/预算/物资）
2. 不包含任何电商或交易相关描述
3. 保持公文正式格式，符合政府采购规范

---

## 测试用例

1. Word导出文件可正常打开且格式正确
2. PDF导出文件可正常打开且样式保留
3. 文件名格式正确，无非法字符
4. 长文档导出时分页正常
5. 移动端导出功能正常
6. 重复导出不会产生命名冲突

---

## 依赖任务

- 无前置依赖
- 建议在任务L1（打印样式优化）之前完成

---

## 提交要求

1. 完成功能后，在Git提交信息中标注：`feat: 实现Word/PDF导出功能`
2. 确保 package.json 中的新依赖已正确添加
3. 测试导出文件在各平台的兼容性

---

## 参考文档

- docx库文档: https://docx.js.org/
- html2pdf.js文档: https://ekoopmans.github.io/html2pdf.js/
- file-saver文档: https://github.com/eligrey/FileSaver.js

---

**任务创建时间**: 2026-04-12  
**任务分配人**: 高级项目经理
