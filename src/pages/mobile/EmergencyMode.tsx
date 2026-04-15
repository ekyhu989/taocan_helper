import React, { useState } from 'react';
import EmergencyForm from '../../components/mobile/EmergencyForm';
import { generateEmergencyScheme } from '../../utils/emergencyGenerator';
import { addEmergencySchemeToCache } from '../../utils/offlineCache';
import { useVibration } from '../../hooks/useVibration';

interface EmergencyModeProps {
  onNavigate: (page: string) => void;
}

const EmergencyMode: React.FC<EmergencyModeProps> = ({ onNavigate }) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [scheme, setScheme] = useState<any>(null);
  const { vibrateSuccess } = useVibration();

  const handleSubmit = (data: { totalBudget: number; peopleCount: number; scene: string }) => {
    const generatedScheme = generateEmergencyScheme(data);
    setScheme(generatedScheme);
    addEmergencySchemeToCache(generatedScheme);
    vibrateSuccess();
    setStep('success');
  };

  const handleContinue = () => {
    onNavigate('solution');
  };

  const handleViewDrafts = () => {
    onNavigate('history');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部 */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            ←
          </button>
          <h1 className="text-xl font-bold text-gray-900">应急模式</h1>
        </div>
      </div>

      <div className="px-4 py-6">
        {step === 'form' && (
          <EmergencyForm onSubmit={handleSubmit} />
        )}

        {step === 'success' && scheme && (
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">✅</span>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              方案已创建！
            </h2>
            <p className="text-gray-600 mb-6">
              应急方案已保存到草稿
            </p>

            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-bold text-gray-900 mb-3">方案概览</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">方案名称</span>
                  <span className="font-medium text-gray-900">{scheme.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">总预算</span>
                  <span className="font-medium text-gray-900">¥{scheme.config.totalBudget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">人数</span>
                  <span className="font-medium text-gray-900">{scheme.config.peopleCount}人</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">商品数量</span>
                  <span className="font-medium text-gray-900">{scheme.products.length}件</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">实际金额</span>
                  <span className="font-medium text-green-600">¥{scheme.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleContinue}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
              >
                继续编辑方案
              </button>
              <button
                onClick={handleViewDrafts}
                className="w-full py-4 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                查看所有草稿
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyMode;
