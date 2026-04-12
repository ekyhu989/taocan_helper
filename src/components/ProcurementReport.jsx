import React from 'react';
import mockData from '../data/mockData';

const ProcurementReport = ({ report, isExample = false }) => {
  // 如果是示例模式，使用示例公文；否则使用真实报告
  const reportContent = isExample ? mockData.exampleReport : (report || mockData.purchaseReport);
  const reportLines = reportContent.split('\n');
  const title = isExample ? '标准公文示例' : '采购申请报告';

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6 border-b-2 border-blue-200 pb-3">
        <h2 className="text-2xl font-bold text-blue-800">{title}</h2>
        {isExample && (
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
            示例公文
          </span>
        )}
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg p-8 font-sans">
        <div className="whitespace-pre-line text-gray-800 leading-relaxed">
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
        </div>
      </div>
      
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
