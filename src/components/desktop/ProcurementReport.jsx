import React from 'react';
import mockData from '../../data/mockData.js';
import { getExportSeal } from '../../data/policies';

const ProcurementReport = ({ 
  report, 
  isExample = false, 
  onExportWord, 
  onExportPDF, 
  showExportButtons = false 
}) => {
  // 如果是示例模式，使用示例公文；否则使用真实报告
  const reportContent = isExample ? mockData.exampleReport : (report || mockData.purchaseReport);
  const reportLines = reportContent.split('\n');
  const title = isExample ? '标准公文示例' : '采购申请报告';
  
  // 为PDF导出生成唯一ID
  const reportId = isExample ? 'example-report-content' : 'generated-report-content';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 border-b-2 border-blue-200 pb-3 gap-3">
        <div className="flex items-center gap-2 md:gap-3">
          <h2 className="text-xl md:text-2xl font-bold text-blue-800">{title}</h2>
          {isExample && (
            <span className="px-2 md:px-3 py-0.5 md:py-1 bg-blue-100 text-blue-800 text-xs md:text-sm font-medium rounded-full">
              示例公文
            </span>
          )}
        </div>
      </div>
      
      <div id={reportId} className="bg-white border border-gray-200 rounded-lg p-4 md:p-8 font-sans">
        <div className="whitespace-pre-line text-gray-800 text-sm md:text-base leading-relaxed">
          {reportLines.map((line, index) => {
            // 红头文件格式处理 - 示例公文去掉红头，统一使用普通格式
            if (line.includes('〔2026〕')) {
              // 示例公文去掉红头，按普通文本处理
              return (
                <p key={index} className="mb-2 text-gray-800">
                  {line}
                </p>
              );
            }
            
            if (index === 0 && !line.includes('〔2026〕')) {
              return (
                <h1 key={index} className="text-xl font-bold text-center mb-8 text-gray-900">
                  {line}
                </h1>
              );
            }
            
            if (line.startsWith('致：') || line.startsWith('局领导：')) {
              return (
                <p key={index} className="mb-6 font-medium text-gray-900">
                  {line}
                </p>
              );
            }
            
            if (line.startsWith('一、') || line.startsWith('二、') || 
                line.startsWith('三、') || line.startsWith('四、') || line.startsWith('五、')) {
              return (
                <h2 key={index} className="text-lg font-semibold mt-6 mb-3 text-gray-900">
                  {line}
                </h2>
              );
            }
            
            if (line.includes('温馨提示：') || line.includes('消费帮扶提示：')) {
              return (
                <div key={index} className="my-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-yellow-800 font-medium">
                    {line.includes('温馨提示：') ? line : '温馨提示：为完成年度消费帮扶任务，建议在食品类采购中优先选用832平台产品，便于集中完成全年指标。'}
                  </p>
                </div>
              );
            }
            
            if (line.startsWith('妥否，请批示。')) {
              return (
                <div key={index} className="mt-8 mb-6">
                  <p className="text-gray-800 mb-2">{line}</p>
                  <div className="text-right space-y-1 mt-8">
                    {isExample && (
                      <>
                        <p className="text-gray-800">申请部门：行政部</p>
                        <p className="text-gray-800">申 请 人：王明</p>
                        <p className="text-gray-800">日　　期：2026年1月10日</p>
                      </>
                    )}
                  </div>
                </div>
              );
            }
            
            if (line.startsWith('申请部门：') || line.startsWith('申请人：') || line.startsWith('日期：')) {
              return (
                <p key={index} className="text-right mt-2 text-gray-800">
                  {line}
                </p>
              );
            }
            
            if (line.trim() === '') {
              return <br key={index} />;
            }
            
            // 数字列表项
            if (/^\d\./.test(line.trim())) {
              return (
                <p key={index} className="mb-2 text-gray-800 pl-4">
                  {line}
                </p>
              );
            }
            
            return (
              <p key={index} className="mb-2 text-gray-800">
                {line}
              </p>
            );
          })}
          
          {/* 政策版本校验签章 */}
          <div className="mt-8 pt-6 border-t border-gray-300">
            <div className="text-center text-gray-600 text-sm leading-relaxed font-mono">
              {getExportSeal().split('\n').map((line, index) => {
                const isSeparator = line.includes('──');
                const isTitle = line.includes('政策版本校验签章');
                const isStatus = line.includes('版本状态：');
                
                let className = "my-1";
                if (isSeparator) {
                  className = "my-1 text-gray-500";
                } else if (isTitle) {
                  className = "my-2 font-bold text-blue-700";
                } else if (isStatus) {
                  className = "my-1 text-green-600";
                } else {
                  className = "my-1 text-gray-700";
                }
                
                return (
                  <div key={index} className={className}>
                    {line}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* 单位公章签章区域 */}
          <div className="mt-8 pt-6 border-t border-gray-300">
            <div className="text-center text-gray-800 text-sm leading-relaxed">
              <div className="border border-dashed border-gray-400 rounded-md p-6 max-w-md mx-auto">
                <div className="text-gray-500 mb-4 text-lg">（单位公章）</div>
                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-600">申请部门：</span>
                    <span className="font-medium">{extractDepartment(reportContent) || '______________'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">申 请 人：</span>
                    <span className="font-medium">{extractApplicant(reportContent) || '______________'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">日　　期：</span>
                    <span className="font-medium">{getCurrentDate()}</span>
                  </div>
                </div>
                <div className="mt-6 text-xs text-gray-500 text-center">
                  注：请在此处加盖单位公章
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 导出按钮区域 */}
      {showExportButtons && !isExample && (
        <div className="mt-6 md:mt-8 p-4 md:p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">导出公文</h3>
              <p className="text-gray-600 text-sm">
                将公文导出为Word或PDF格式，便于打印、存档或提交
              </p>
            </div>
            <div className="flex flex-wrap sm:flex-nowrap gap-3 justify-center">
              <button
                onClick={onExportWord}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 min-h-[44px] bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md no-print"
              >
                <span>📄</span>
                <span>导出Word</span>
              </button>
              <button
                onClick={onExportPDF}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 min-h-[44px] bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-md no-print"
              >
                <span>📑</span>
                <span>导出PDF</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 min-h-[44px] bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors duration-200 shadow-md no-print"
              >
                <span>🖨️</span>
                <span>打印</span>
              </button>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-gray-500 text-xs">
              导出的文件名为：<code className="bg-gray-100 px-2 py-1 rounded text-gray-800">{'{单位名称}_{年份}{节日/场景}_采购申请报告.{docx/pdf}'}</code>
            </p>
          </div>
        </div>
      )}
      
      {/* 示例提示 */}
      {isExample && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-700 text-sm">
            提示：填写完整信息并点击"生成公文"后，此处将替换为您定制的正式采购申请报告。
          </p>
        </div>
      )}
    </div>
  );
};

export default ProcurementReport;
