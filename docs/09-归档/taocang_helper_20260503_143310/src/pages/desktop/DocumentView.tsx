import React from 'react';
import DocumentTemplate from '../../components/desktop/DocumentTemplate';

interface DocumentViewProps {
  formData?: any;
  productListResult?: any;
  report?: string;
  onNavigate?: (page: string) => void;
}

const DocumentView: React.FC<DocumentViewProps> = ({
  formData = {},
  productListResult = null,
  report = '',
  onNavigate
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    alert('导出功能待实现');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-200">
      {/* 顶部栏 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">公文排版视图</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            🖨️ 打印
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            📥 导出
          </button>
        </div>
      </div>

      {/* 文档内容 */}
      <div className="flex-1 overflow-y-auto p-8">
        <DocumentTemplate 
          formData={formData}
          productListResult={productListResult}
          report={report}
        />
      </div>
    </div>
  );
};

export default DocumentView;
