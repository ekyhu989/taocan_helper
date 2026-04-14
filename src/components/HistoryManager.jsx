import React, { useState, useEffect, useRef, useCallback } from 'react';
import HistoryDetail from './HistoryDetail';
import TagManager from './TagManager';
import SchemeCompare from './SchemeCompare';
import {
  loadHistory,
  deleteHistory,
  clearHistory,
  getHistoryCount,
  formatDate,
  formatMoney,
} from '../utils/historyStorage';
import { filterHistory } from '../utils/historyFilter';
import { saveOperationLog } from '../utils/operationLog';

/**
 * 历史方案管理面板
 * ─────────────────────────────────
 * 右侧滑入面板，包含历史列表和详情查看
 *
 * Props:
 *   - onClose: () => void           关闭面板
 *   - onReuse: (historyItem) => void 使用某条历史方案
 *   - currentInput?: object         当前输入数据（用于对比）
 */
function HistoryManager({ onClose, onReuse, currentInput }) {
  const [historyList, setHistoryList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null); // 查看详情
  const [version, setVersion] = useState(0); // 用于强制刷新列表

  // 筛选状态
  const [filters, setFilters] = useState({
    festival: '',
    year: '',
    budgetRange: null,
    platform832Range: null,
    complianceStatus: '',
  });

  // 标签管理
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [selectedSchemeForTags, setSelectedSchemeForTags] = useState(null);

  // 方案对比
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareData, setCompareData] = useState(null);

  // 节日和年份选项
  const festivalOptions = ['', '春节', '古尔邦节', '肉孜节', '中秋', '端午', '元旦', '清明', '劳动', '国庆'];
  const currentYear = new Date().getFullYear();
  const yearOptions = ['', currentYear - 2, currentYear - 1, currentYear].map(String);

  // 预算区间选项
  const budgetRangeOptions = [
    { label: '全部预算', value: null },
    { label: '0-5000元', value: [0, 5000] },
    { label: '5000-10000元', value: [5000, 10000] },
    { label: '10000-20000元', value: [10000, 20000] },
    { label: '20000元以上', value: [20000, Infinity] },
  ];

  // 832占比选项
  const platform832Options = [
    { label: '全部占比', value: null },
    { label: '<30%（不达标）', value: [0, 0.3] },
    { label: '30-50%', value: [0.3, 0.5] },
    { label: '50-80%', value: [0.5, 0.8] },
    { label: '>80%', value: [0.8, 1] },
  ];

  // 合规状态选项
  const complianceOptions = ['', '合规', '警告', '超标'];

  // 关闭面板的 Escape 快捷键
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        if (selectedItem) {
          setSelectedItem(null);
        } else if (tagModalOpen) {
          setTagModalOpen(false);
        } else if (compareModalOpen) {
          setCompareModalOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedItem, tagModalOpen, compareModalOpen, onClose]);

  // 每次打开面板或 version 变化时加载数据
  useEffect(() => {
    const history = loadHistory();
    setHistoryList(history);
    setFilteredList(history);
  }, [version]);

  // 筛选逻辑
  useEffect(() => {
    const filtered = filterHistory(historyList, filters);
    setFilteredList(filtered);
  }, [historyList, filters]);

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

  // 清空筛选
  const handleClearFilters = useCallback(() => {
    setFilters({
      festival: '',
      year: '',
      budgetRange: null,
      platform832Range: null,
      complianceStatus: '',
    });
  }, []);

  // 查看详情
  const handleViewDetail = useCallback((item) => {
    saveOperationLog({
      schemeId: item.id,
      operation: 'view',
    });
    setSelectedItem(item);
  }, []);

  // 使用某条方案
  const handleReuse = useCallback((item) => {
    setCompareData({
      history: item,
      current: currentInput,
    });
    setCompareModalOpen(true);
  }, [currentInput]);

  // 确认复用
  const handleConfirmReuse = useCallback((item) => {
    saveOperationLog({
      schemeId: item.id,
      operation: 'reuse',
      beforeData: currentInput,
      afterData: item,
    });
    onReuse(item);
    setCompareModalOpen(false);
    onClose();
  }, [onReuse, onClose, currentInput]);

  // 打开标签管理
  const handleOpenTagManager = useCallback((item, e) => {
    e.stopPropagation();
    setSelectedSchemeForTags(item);
    setTagModalOpen(true);
  }, []);

  // 保存标签
  const handleSaveTags = useCallback((tags) => {
    if (selectedSchemeForTags) {
      const updatedHistory = historyList.map((item) =>
        item.id === selectedSchemeForTags.id ? { ...item, tags } : item
      );
      localStorage.setItem('taocang_history', JSON.stringify(updatedHistory));
      setVersion((v) => v + 1);
    }
    setTagModalOpen(false);
    setSelectedSchemeForTags(null);
  }, [historyList, selectedSchemeForTags]);

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
  const isEmpty = filteredList.length === 0;

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

        {/* 筛选栏 */}
        <div className="px-6 py-3 border-b border-gray-100 bg-white space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={filters.festival}
              onChange={(e) => setFilters(prev => ({ ...prev, festival: e.target.value }))}
              className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {festivalOptions.map(opt => (
                <option key={opt} value={opt}>
                  {opt || '全部节日'}
                </option>
              ))}
            </select>

            <select
              value={filters.year}
              onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
              className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {yearOptions.map(opt => (
                <option key={opt} value={opt}>
                  {opt ? `${opt}年` : '全部年份'}
                </option>
              ))}
            </select>

            <select
              value={filters.budgetRange ? JSON.stringify(filters.budgetRange) : ''}
              onChange={(e) => {
                const val = e.target.value;
                setFilters(prev => ({
                  ...prev,
                  budgetRange: val ? JSON.parse(val) : null,
                }));
              }}
              className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {budgetRangeOptions.map(opt => (
                <option key={opt.label} value={opt.value ? JSON.stringify(opt.value) : ''}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={filters.platform832Range ? JSON.stringify(filters.platform832Range) : ''}
              onChange={(e) => {
                const val = e.target.value;
                setFilters(prev => ({
                  ...prev,
                  platform832Range: val ? JSON.parse(val) : null,
                }));
              }}
              className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {platform832Options.map(opt => (
                <option key={opt.label} value={opt.value ? JSON.stringify(opt.value) : ''}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={filters.complianceStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, complianceStatus: e.target.value }))}
              className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {complianceOptions.map(opt => (
                <option key={opt} value={opt}>
                  {opt || '全部状态'}
                </option>
              ))}
            </select>

            <button
              onClick={handleClearFilters}
              className="px-2 py-1 text-sm text-blue-600 hover:text-blue-800"
            >
              清空
            </button>
          </div>
        </div>

        {/* 记录统计 */}
        <div className="px-6 py-2 text-sm text-gray-500 border-b border-gray-100">
          共 <span className="font-semibold text-gray-700">{filteredList.length}</span> 条记录
          {filteredList.length !== historyList.length && (
            <span className="text-gray-400 ml-2">
              （已筛选，共 {historyList.length} 条）
            </span>
          )}
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
              {filteredList.map((item) => (
                <HistoryCard
                  key={item.id}
                  item={item}
                  onView={() => handleViewDetail(item)}
                  onReuse={() => handleReuse(item)}
                  onDelete={() => handleDelete(item.id)}
                  onOpenTagManager={(e) => handleOpenTagManager(item, e)}
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

      {/* 标签管理弹窗 */}
      {tagModalOpen && selectedSchemeForTags && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">管理标签</h3>
              <button
                onClick={() => setTagModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                ✕
              </button>
            </div>
            <TagManager
              selectedTags={selectedSchemeForTags.tags || []}
              onTagsChange={handleSaveTags}
              maxTags={5}
            />
          </div>
        </div>
      )}

      {/* 方案对比弹窗 */}
      {compareModalOpen && compareData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">确认使用方案</h3>
              <button
                onClick={() => setCompareModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <SchemeCompare
                originalScheme={compareData.history?.summary || {}}
                currentScheme={compareData.current || {}}
              />
            </div>
            <div className="flex gap-3 justify-end p-4 border-t border-gray-200">
              <button
                onClick={() => setCompareModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={() => handleConfirmReuse(compareData.history)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                确认使用
              </button>
            </div>
          </div>
        </div>
      )}

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

function HistoryCard({ item, onView, onReuse, onDelete, onOpenTagManager }) {
  const { summary, createdAt, tags = [] } = item;
  const displayDate = formatDate(createdAt);
  const displayAmount = formatMoney(summary.totalAmount);

  // 场景标签颜色
  const sceneColors = {
    holiday: 'bg-orange-100 text-orange-700',
    activity: 'bg-blue-100 text-blue-700',
    care: 'bg-pink-100 text-pink-700',
  };
  const sceneColorClass = sceneColors[summary.scene] || 'bg-gray-100 text-gray-700';

  // 合规状态
  const getComplianceStatus = () => {
    if (!summary.headCount || !summary.totalBudget) return null;
    const perCapita = summary.totalBudget / summary.headCount;
    if (perCapita > 2000) return { label: '超标', color: 'bg-red-100 text-red-700' };
    if (perCapita > 500) return { label: '警告', color: 'bg-yellow-100 text-yellow-700' };
    return { label: '合规', color: 'bg-green-100 text-green-700' };
  };

  const complianceStatus = getComplianceStatus();

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
        {complianceStatus && (
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${complianceStatus.color}`}>
            {complianceStatus.label}
          </span>
        )}
      </div>

      {/* 标签 */}
      {tags.length > 0 && (
        <div className="flex items-center gap-1 mt-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full"
            >
              {tag}
            </span>
          ))}
          <button
            onClick={onOpenTagManager}
            className="px-2 py-0.5 text-xs text-blue-600 hover:bg-blue-50 rounded-full"
          >
            +
          </button>
        </div>
      )}
      {tags.length === 0 && (
        <div className="mt-2">
          <button
            onClick={onOpenTagManager}
            className="text-xs text-gray-400 hover:text-blue-600"
          >
            + 添加标签
          </button>
        </div>
      )}

      {/* 金额 */}
      <div className="text-sm text-gray-600 mt-2">
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
