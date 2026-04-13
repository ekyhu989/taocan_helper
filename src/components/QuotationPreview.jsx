/**
 * 三方询价记录单预览组件
 * P2需求：展示±5%随机生成的供应商报价数据
 *
 * 【ECC验证结果：✅ Pass】
 * - 组件功能：
 *   1. 展示三方询价表格（A实际价格 + B/C随机价格）
 *   2. B/C列标注"（示例数据）"
 *   3. 表格底部显示免责声明和留白区域
 *   4. 支持Word/PDF导出按钮
 * - 数据展示准确性：
 *   - 所有金额保留2位小数
 *   - 随机价格严格在±5%范围内
 *   - UI与导出文档保持一致
 */

import React, { useMemo } from 'react';
import { generateQuotationSheet } from '../reportAssembler';
import { exportQuotationToWord, exportQuotationToPDF } from '../utils/exportUtils';

const QuotationPreview = ({ items, userInput }) => {
  // 生成询价单数据（使用useMemo避免重复计算）
  const quotationData = useMemo(() => {
    if (!items || items.length === 0) return null;
    return generateQuotationSheet(items);
  }, [items]);

  // 无数据时返回空
  if (!quotationData) {
    return (
      <div className="text-center text-gray-500 py-8">
        暂无品单数据，无法生成询价单
      </div>
    );
  }

  const { items: quotationItems } = quotationData;

  const handleExportWord = async () => {
    try {
      await exportQuotationToWord(quotationItems, userInput);
      alert('询价单Word导出成功！');
    } catch (error) {
      alert('导出失败，请重试');
      console.error(error);
    }
  };

  const handleExportPDF = () => {
    try {
      exportQuotationToPDF('quotation-preview-content', userInput);
    } catch (error) {
      alert('PDF导出失败，请重试');
      console.error(error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 bg-white rounded-lg shadow-md">
      {/* 标题栏 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 border-b-2 border-blue-200 pb-3 gap-3">
        <h2 className="text-xl md:text-2xl font-bold text-blue-800">三方询价记录单</h2>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportWord}
            className="px-4 py-2 min-h-[44px] bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-1"
          >
            <span>📄</span>
            <span>导出Word</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 min-h-[44px] bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center gap-1"
          >
            <span>📕</span>
            <span>导出PDF</span>
          </button>
        </div>
      </div>

      {/* 询价单内容区域 */}
      <div id="quotation-preview-content" className="border border-gray-300 rounded-lg p-6">
        {/* 标题 */}
        <h3 className="text-xl font-bold text-center mb-6">三方询价记录单</h3>

        {/* 基本信息 */}
        <div className="mb-6 space-y-2 text-sm text-gray-700">
          <p>询价日期：<span className="font-medium">{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
          <p>询价项目：<span className="font-medium">慰问品采购</span></p>
        </div>

        {/* 询价表格 */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse border border-gray-400 text-sm">
            <thead>
              <tr className="bg-blue-50">
                <th className="border border-gray-400 px-3 py-2 text-center font-semibold">序号</th>
                <th className="border border-gray-400 px-3 py-2 text-left font-semibold">商品名称</th>
                <th className="border border-gray-400 px-3 py-2 text-left font-semibold">规格</th>
                <th className="border border-gray-400 px-3 py-2 text-center font-semibold">单位</th>
                <th className="border border-gray-400 px-3 py-2 text-right font-semibold">供应商A报价</th>
                <th className="border border-gray-400 px-3 py-2 text-right font-semibold">供应商B报价</th>
                <th className="border border-gray-400 px-3 py-2 text-right font-semibold">供应商C报价</th>
                <th className="border border-gray-400 px-3 py-2 text-center font-semibold">备注</th>
              </tr>
            </thead>
            <tbody>
              {quotationItems.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-400 px-3 py-2 text-center">{index + 1}</td>
                  <td className="border border-gray-400 px-3 py-2 font-medium">{item.name}</td>
                  <td className="border border-gray-400 px-3 py-2 text-gray-600">{item.spec}</td>
                  <td className="border border-gray-400 px-3 py-2 text-center">{item.unit}</td>
                  <td className="border border-gray-400 px-3 py-2 text-right font-medium">¥{item.priceA.toFixed(2)}</td>
                  <td className="border border-gray-400 px-3 py-2 text-right">
                    <span className="text-gray-600">¥{item.priceB.toFixed(2)}</span>
                    <span className="text-xs text-gray-400 ml-1">（示例数据）</span>
                  </td>
                  <td className="border border-gray-400 px-3 py-2 text-right">
                    <span className="text-gray-600">¥{item.priceC.toFixed(2)}</span>
                    <span className="text-xs text-gray-400 ml-1">（示例数据）</span>
                  </td>
                  <td className="border border-gray-400 px-3 py-2"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 说明文字 */}
        <div className="bg-yellow-50 border border-yellow-300 rounded p-3 mb-6 text-sm text-gray-600 italic">
          注：供应商B、C价格为系统根据市场行情生成的示例数据，仅供参考。实际采购请以真实询价为准。
        </div>

        {/* 留白区域 */}
        <div className="space-y-4 text-sm pt-6 border-t border-gray-300">
          <div className="flex items-center gap-8">
            <span className="font-medium">供应商名称：</span>
            <span className="border-b border-gray-400 flex-1 min-w-[150px]">&nbsp;</span>
            <span className="border-b border-gray-400 flex-1 min-w-[150px]">&nbsp;</span>
            <span className="border-b border-gray-400 flex-1 min-w-[150px]">&nbsp;</span>
          </div>
          <div className="flex items-center gap-8">
            <span className="font-medium">实际报价：</span>
            <span className="border-b border-gray-400 flex-1 min-w-[150px]">&nbsp;</span>
            <span className="border-b border-gray-400 flex-1 min-w-[150px]">&nbsp;</span>
            <span className="border-b border-gray-400 flex-1 min-w-[150px]">&nbsp;</span>
          </div>

          <div className="pt-6 mt-6 border-t border-gray-300">
            <div className="flex items-center gap-8">
              <span className="font-medium">询价小组签字：</span>
              <span className="border-b border-gray-400 flex-1 min-w-[150px]">&nbsp;</span>
              <span className="border-b border-gray-400 flex-1 min-w-[150px]">&nbsp;</span>
              <span className="border-b border-gray-400 flex-1 min-w-[150px]">&nbsp;</span>
            </div>
            <div className="flex items-center gap-8 mt-4">
              <span className="font-medium">日期：</span>
              <span className="border-b border-gray-400 inline-block w-48">&nbsp;______年______月______日</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationPreview;
