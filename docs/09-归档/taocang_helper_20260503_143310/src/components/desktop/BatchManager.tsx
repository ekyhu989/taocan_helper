import React, { useState } from 'react';

interface Scheme {
  id: string;
  title: string;
  date: string;
  amount: number;
  peopleCount: number;
  status: 'draft' | 'completed' | 'archived';
}

const mockSchemes: Scheme[] = [
  { id: '1', title: '2026年春节慰问方案', date: '2026-01-15', amount: 50000, peopleCount: 100, status: 'completed' },
  { id: '2', title: '2025年中秋慰问方案', date: '2025-09-20', amount: 45000, peopleCount: 90, status: 'completed' },
  { id: '3', title: '2025年五一慰问方案', date: '2025-04-28', amount: 40000, peopleCount: 80, status: 'archived' },
  { id: '4', title: '2026年困难帮扶方案', date: '2026-01-10', amount: 20000, peopleCount: 40, status: 'draft' },
  { id: '5', title: '2025年国庆节慰问方案', date: '2025-09-25', amount: 48000, peopleCount: 95, status: 'completed' }
];

const BatchManager: React.FC = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [schemes] = useState<Scheme[]>(mockSchemes);

  const toggleSelectAll = () => {
    if (selectedIds.length === schemes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(schemes.map(s => s.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">已完成</span>;
      case 'draft':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">草稿</span>;
      case 'archived':
        return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">已归档</span>;
      default:
        return null;
    }
  };

  const handleBatchExport = () => {
    alert(`正在导出 ${selectedIds.length} 个方案...`);
  };

  const handleBatchDelete = () => {
    if (confirm(`确定要删除选中的 ${selectedIds.length} 个方案吗？`)) {
      alert('删除成功');
    }
  };

  const handleBatchArchive = () => {
    alert(`正在归档 ${selectedIds.length} 个方案...`);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* 批量操作栏 */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="font-bold text-gray-900">历史方案</h3>
          {selectedIds.length > 0 && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              已选择 {selectedIds.length} 个
            </span>
          )}
        </div>
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleBatchExport}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              批量导出
            </button>
            <button
              onClick={handleBatchArchive}
              className="px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              批量归档
            </button>
            <button
              onClick={handleBatchDelete}
              className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              批量删除
            </button>
          </div>
        )}
      </div>

      {/* 表格 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedIds.length === schemes.length && schemes.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">方案名称</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">日期</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">金额</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">人数</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">状态</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {schemes.map((scheme) => (
              <tr key={scheme.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(scheme.id)}
                    onChange={() => toggleSelect(scheme.id)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{scheme.title}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">{scheme.date}</td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  ¥{scheme.amount.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-center text-gray-600">
                  {scheme.peopleCount}人
                </td>
                <td className="px-4 py-3 text-center">
                  {getStatusBadge(scheme.status)}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm">
                      查看
                    </button>
                    <button className="px-3 py-1 text-gray-600 hover:bg-gray-50 rounded text-sm">
                      编辑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BatchManager;
