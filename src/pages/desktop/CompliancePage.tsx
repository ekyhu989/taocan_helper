import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3 } from 'lucide-react';

const CompliancePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">首页</span>
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--color-primary)]">
              合规测算
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border border-[var(--color-border)] p-8 text-center">
          <BarChart3 className="w-12 h-12 text-[var(--color-secondary)] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
            合规性检查
          </h2>
          <p className="text-[var(--color-text-secondary)] mb-4">
            此模块正在开发中，将提供采购合规性检查与测算功能
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-[var(--color-primary)] text-white font-medium rounded-md hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompliancePage;
