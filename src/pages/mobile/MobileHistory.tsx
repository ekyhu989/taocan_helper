import React, { useState, useEffect } from 'react';
import { loadHistory, formatDate, formatMoney } from '../../utils/helpers/historyStorage';
import type { HistoryItem } from '../../utils/helpers/historyStorage';

interface MobileHistoryProps {
  onNavigate: (page: string) => void;
}

const SCENE_LABELS: Record<string, string> = {
  spring: '春节慰问',
  midautumn: '中秋慰问',
  holiday: '节日慰问',
  activity: '专项活动',
  care: '困难帮扶',
  special: '专项活动',
  difficulty: '困难帮扶',
};

const MobileHistory: React.FC<MobileHistoryProps> = ({ onNavigate }) => {
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const history = loadHistory();
    setHistoryList(history);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-3 text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  if (selectedItem) {
    const s = selectedItem.summary;
    const sd = selectedItem.solutionData;
    const items = sd?.productList?.items || [];

    return (
      <div className="min-h-screen bg-gray-50 pb-8">
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedItem(null)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              ←
            </button>
            <h1 className="text-xl font-bold text-gray-900">方案详情</h1>
          </div>
        </div>

        <div className="px-4 py-4 space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-bold text-gray-900 mb-3">
              {s.unitName || '本单位'}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">采购场景</span>
                <span>{SCENE_LABELS[s.scene] || s.sceneLabel || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">人数</span>
                <span>{s.headCount}人</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">预算金额</span>
                <span>¥{formatMoney(s.totalBudget)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">实际金额</span>
                <span className="font-bold text-blue-600">¥{formatMoney(s.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">创建时间</span>
                <span>{formatDate(selectedItem.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-bold text-gray-900 mb-3">商品清单</h3>
            {items.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">暂无商品数据</p>
            ) : (
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={item.product?.id || idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">{item.product?.name || '未知商品'}</div>
                      <div className="text-xs text-gray-500">
                        单价 ¥{item.product?.price?.toFixed(2) || '0.00'} × {item.quantity}
                        {item.product?.is832 ? ' · 832平台' : ''}
                      </div>
                    </div>
                    <div className="text-right ml-3">
                      <span className="font-medium text-gray-900">¥{item.subtotal?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {sd?.productList && (
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-bold text-gray-900 mb-3">合规信息</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">832平台占比</span>
                  <span className={sd.productList.platform832Rate >= 0.3 ? 'text-green-600' : 'text-red-500'}>
                    {(sd.productList.platform832Rate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">预算使用率</span>
                  <span>{(sd.productList.budgetUsageRate * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )}

          <div className="text-center text-xs text-gray-400 pt-4">
            此页面为只读模式，不可编辑
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-xl font-bold text-gray-900">历史方案</h1>
      </div>

      <div className="px-4 py-4 space-y-3">
        {historyList.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-gray-500 mb-2">暂无历史方案</p>
            <p className="text-gray-400 text-sm mb-6">完成采购方案后会自动保存到这里</p>
            <button
              onClick={() => onNavigate('scheme')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium"
            >
              新建方案
            </button>
          </div>
        ) : (
          historyList.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="bg-white rounded-xl shadow-sm p-4 active:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {item.summary.unitName || '本单位'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(item.createdAt)} · {item.summary.headCount}人
                    {item.summary.sceneLabel ? ` · ${item.summary.sceneLabel}` : ''}
                  </p>
                </div>
                <div className="text-right ml-3">
                  <p className="font-bold text-blue-600">
                    ¥{formatMoney(item.summary.totalAmount)}
                  </p>
                  <span className="text-xs text-gray-400">点击查看</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MobileHistory;
