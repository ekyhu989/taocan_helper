import React from 'react';

interface Scheme {
  id: string;
  title: string;
  date: string;
  amount: number;
  peopleCount: number;
  status: 'normal' | 'warning';
}

interface RecentSchemesProps {
  onSelectScheme: (scheme: Scheme) => void;
}

const RecentSchemes: React.FC<RecentSchemesProps> = ({ onSelectScheme }) => {
  const schemes: Scheme[] = [
    {
      id: '1',
      title: '2026年春节慰问方案',
      date: '2026-01-15',
      amount: 50000,
      peopleCount: 100,
      status: 'normal'
    },
    {
      id: '2',
      title: '2025年中秋慰问方案',
      date: '2025-09-20',
      amount: 45000,
      peopleCount: 90,
      status: 'warning'
    }
  ];

  return (
    <div className="px-4 py-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">最近方案</h2>
      <div className="space-y-3">
        {schemes.map((scheme) => (
          <button
            key={scheme.id}
            onClick={() => onSelectScheme(scheme)}
            className="w-full bg-white border border-gray-200 rounded-xl p-4 text-left hover:shadow-md transition-all active:scale-[0.98]"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">{scheme.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{scheme.date}</p>
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-xs text-gray-500">总金额</span>
                    <p className="font-bold text-gray-900">¥{scheme.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">人数</span>
                    <p className="font-bold text-gray-900">{scheme.peopleCount}人</p>
                  </div>
                </div>
              </div>
              {scheme.status === 'warning' && (
                <div className="ml-3 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                  需注意
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecentSchemes;
