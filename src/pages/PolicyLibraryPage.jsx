import React from 'react';

const PolicyLibraryPage = ({ onNavigate }) => {
  const policies = [
    {
      id: 1,
      title: '新疆维吾尔自治区政府采购管理办法',
      date: '2025-12-01',
      category: '法规',
    },
    {
      id: 2,
      title: '关于规范工会慰问品采购的指导意见',
      date: '2025-10-15',
      category: '政策',
    },
    {
      id: 3,
      title: '832平台采购比例要求说明',
      date: '2025-09-20',
      category: '规范',
    },
    {
      id: 4,
      title: '政府采购预算管理暂行规定',
      date: '2025-08-10',
      category: '法规',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              ←
            </button>
            <h1 className="text-xl font-bold text-gray-800">政策文库</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {policies.map((policy) => (
            <div
              key={policy.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      policy.category === '法规'
                        ? 'bg-blue-100 text-blue-700'
                        : policy.category === '政策'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {policy.category}
                    </span>
                    <span className="text-xs text-gray-400">{policy.date}</span>
                  </div>
                  <h3 className="text-gray-800 font-medium">{policy.title}</h3>
                </div>
                <button className="ml-4 p-2 hover:bg-gray-100 rounded-lg text-blue-600">
                  查看 →
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>更多政策文件持续更新中...</p>
        </div>
      </div>
    </div>
  );
};

export default PolicyLibraryPage;
