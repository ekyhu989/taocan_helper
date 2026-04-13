import React, { useState, useEffect, useRef, useCallback } from 'react';
import HistoryDetail from './HistoryDetail';
import {
  loadHistory,
  deleteHistory,
  clearHistory,
  getHistoryCount,
  formatDate,
  formatMoney,
} from '../utils/historyStorage';

/**
 * 历史方案管理面板
 * ─────────────────────────────────
 * 右侧滑入面板，包含历史列表和详情查看
 *
 * Props:
 *   - onClose: () => void           关闭面板
 *   - onReuse: (historyItem) => void 使用某条历史方案
 */
function HistoryManager({ onClose, onReuse }) {
  const [historyList, setHistoryList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null); // 查看详情
  const [version, setVersion] = useState(0); // 用于强制刷新列表

  // 关闭面板的 Escape 快捷键
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        if (selectedItem) {
          setSelectedItem(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedItem, onClose]);

  // 每次打开面板或 version 变化时加载数据
  useEffect(() => {
    setHistoryList(loadHistory());
  }, [version]);

  // 从详情返回列表
  const handleBackToList = useCallback(() => {
    setSelectedItem(null);
  }, []);

  // 删除单条记录
  const handleDelete = useCallback((id) => {
    if (window.confirm('确定要删除这条历史方案吗？删除后不可恢复。')) {
      deleteHistory(id);
      setVersion((v) => v + 1);
    }
  }, []);

  // 清空所有历史
  const handleClearAll = useCallback(() => {
    const count = getHistoryCount();
    if (count === 0) return;
    if (window.confirm(`确定要清空全部 ${count} 条历史方案吗？此操作不可撤销！`)) {
      clearHistory();
      setVersion((v) => v + 1);
    }
  }, []);

  // 使用某条方案
  const handleReuse = useCallback((item) => {
    onReuse(item);
    onClose();
  }, [onReuse, onClose]);

  // ─── 详情视图 ───
  if (selectedItem) {
    return (
      <HistoryDetail
        item={selectedItem}
        onBack={handleBackToList}
        onReuse={() => handleReuse(selectedItem)}
      />
    );
  }

  // ─── 列表视图 ───
  const isEmpty = historyList.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* 遮罩层 */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 面板主体 */}
      <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col animate-slide-in">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">历史方案</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 记录统计 */}
        <div className="px-6 py-2 text-sm text-gray-500 border-b border-gray-100">
          共 <span className="font-semibold text-gray-700">{historyList.length}</span> 条记录
        </div>

        {/* 列表内容（可滚动） */}
        <div className="flex-1 overflow-y-auto">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20">
              <div className="text-4xl mb-4">📋</div>
              <p>暂无历史方案</p>
              <p className="text-sm mt-1">生成公文后自动保存</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {historyList.map((item) => (
                <HistoryCard
                  key={item.id}
                  item={item}
                  onView={() => setSelectedItem(item)}
                  onReuse={() => handleReuse(item)}
                  onDelete={() => handleDelete(item.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* 底部操作 */}
        {!isEmpty && (
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleClearAll}
              className="w-full py-2 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors font-medium"
            >
              清空所有历史记录
            </button>
          </div>
        )}
      </div>

      {/* 滑入动画 */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}

// ─── 单条历史卡片 ───

function HistoryCard({ item, onView, onReuse, onDelete }) {
  const { summary, createdAt } = item;
  const displayDate = formatDate(createdAt);
  const displayAmount = formatMoney(summary.totalAmount);

  // 场景标签颜色
  const sceneColors = {
    holiday: 'bg-orange-100 text-orange-700',
    activity: 'bg-blue-100 text-blue-700',
    care: 'bg-pink-100 text-pink-700',
  };
  const sceneColorClass = sceneColors[summary.scene] || 'bg-gray-100 text-gray-700';

  return (
    <div className="px-6 py-4 hover:bg-gray-50 transition-colors group">
      {/* 日期 */}
      <div className="text-sm text-gray-500 mb-1">{displayDate}</div>

      {/* 主信息 */}
      <div className="flex items-center gap-2 mb-1">
        <span className="font-medium text-gray-800 truncate max-w-[200px]">
          {summary.unitName || '（未填写单位）'}
        </span>
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${sceneColorClass}`}>
          {summary.sceneLabel}
        </span>
      </div>

      {/* 金额 */}
      <div className="text-sm text-gray-600">
        总金额：<span className="font-semibold text-gray-800">¥{displayAmount}</span>
        <span className="text-gray-400 ml-2">{summary.headCount}人</span>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onView(); }}
          className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
        >
          查看
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onReuse(); }}
          className="px-3 py-1 text-xs font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
        >
          使用
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="px-3 py-1 text-xs font-medium text-red-500 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
        >
          删除
        </button>
      </div>
    </div>
  );
}

export default HistoryManager;
