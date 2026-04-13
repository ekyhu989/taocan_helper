import React from 'react';

const ProductManagerPage = ({ onNavigate }) => {
  const products = [
    {
      id: 1,
      name: '新疆核桃',
      category: '食品',
      price: 89,
      unit: 'kg',
    },
    {
      id: 2,
      name: '葡萄干礼盒',
      category: '食品',
      price: 128,
      unit: '盒',
    },
    {
      id: 3,
      name: '和田大枣',
      category: '食品',
      price: 68,
      unit: 'kg',
    },
    {
      id: 4,
      name: '纯棉毛巾套装',
      category: '日用品',
      price: 58,
      unit: '套',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('home')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ←
              </button>
              <h1 className="text-xl font-bold text-gray-800">商品库</h1>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              + 添加商品
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700">
                      {product.category}
                    </span>
                  </div>
                  <h3 className="text-gray-800 font-medium mb-2">{product.name}</h3>
                  <p className="text-blue-600 font-bold text-lg">
                    ¥{product.price} / {product.unit}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                    编辑
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg text-red-500">
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>共 {products.length} 件商品</p>
        </div>
      </div>
    </div>
  );
};

export default ProductManagerPage;
