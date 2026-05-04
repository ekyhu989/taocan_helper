import React, { useState } from 'react';
import { useVibration } from '../../hooks/useVibration';

interface EmergencyFormProps {
  onSubmit: (data: { totalBudget: number; peopleCount: number; scene: string }) => void;
}

const EmergencyForm: React.FC<EmergencyFormProps> = ({ onSubmit }) => {
  const [totalBudget, setTotalBudget] = useState('');
  const [peopleCount, setPeopleCount] = useState('');
  const [scene, setScene] = useState('spring');
  const { vibrateSuccess, vibrateError } = useVibration();

  const scenes = [
    { id: 'spring', label: '春节慰问', icon: '🧧' },
    { id: 'midautumn', label: '中秋慰问', icon: '🥮' },
    { id: 'special', label: '专项活动', icon: '🎯' },
    { id: 'difficulty', label: '困难帮扶', icon: '❤️' }
  ];

  const handleSubmit = () => {
    const budget = Number(totalBudget);
    const count = Number(peopleCount);

    if (!budget || budget <= 0) {
      vibrateError();
      return;
    }

    if (!count || count <= 0) {
      vibrateError();
      return;
    }

    vibrateSuccess();
    onSubmit({ totalBudget: budget, peopleCount: count, scene });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="text-center mb-6">
        <span className="text-4xl mb-3 block">⚡</span>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">应急模式</h2>
        <p className="text-gray-600">10秒快速创建草稿方案</p>
      </div>

      <div className="space-y-4">
        {/* 总预算 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            总预算（元）
          </label>
          <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-500">
            <span className="px-4 text-gray-500 text-xl">¥</span>
            <input
              type="number"
              inputMode="numeric"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              placeholder="0"
              className="flex-1 py-4 text-2xl font-bold text-gray-900 focus:outline-none"
            />
          </div>
        </div>

        {/* 人数 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            人数（人）
          </label>
          <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-500">
            <input
              type="number"
              inputMode="numeric"
              value={peopleCount}
              onChange={(e) => setPeopleCount(e.target.value)}
              placeholder="0"
              className="flex-1 px-4 py-4 text-2xl font-bold text-gray-900 focus:outline-none"
            />
            <span className="px-4 text-gray-500 text-xl">人</span>
          </div>
        </div>

        {/* 采购场景 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            采购场景
          </label>
          <div className="grid grid-cols-2 gap-3">
            {scenes.map((s) => (
              <button
                key={s.id}
                onClick={() => setScene(s.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  scene === s.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <span className="text-2xl block mb-1">{s.icon}</span>
                <span className={`font-medium ${scene === s.id ? 'text-blue-700' : 'text-gray-700'}`}>
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 生成按钮 */}
        <button
          onClick={handleSubmit}
          disabled={!totalBudget || !peopleCount}
          className="w-full py-5 bg-blue-600 text-white font-bold text-lg rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          快速生成方案
        </button>
      </div>
    </div>
  );
};

export default EmergencyForm;
