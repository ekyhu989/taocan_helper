import React, { useState, useEffect } from 'react';
import { getOfflineCache, exportToFile, importFromFile } from '../../utils/offlineCache';

interface DraftManagerProps {
  onSelectDraft?: (draft: any) => void;
  onBack?: () => void;
}

const DraftManager: React.FC<DraftManagerProps> = ({ onSelectDraft, onBack }) => {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    const cache = getOfflineCache();
    setDrafts(cache.emergencySchemes);
  }, []);

  const handleExport = (draft: any) => {
    const filename = `${draft.title}_${Date.now()}.json`;
    exportToFile(draft, filename);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const data = await importFromFile(file);
      console.log('Imported draft:', data);
      alert('导入成功！');
    } catch (error) {
      alert('导入失败，请检查文件格式');
    } finally {
      setImporting(false);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleString('zh-CN');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部 */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ←
              </button>
            )}
            <h1 className="text-xl font-bold text-gray-900">草稿管理</h1>
          </div>

          <label className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
            {importing ? '导入中...' : '导入'}
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              disabled={importing}
            />
          </label>
        </div>
      </div>

      <div className="px-4 py-6">
        {drafts.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <span className="text-5xl mb-4 block">📝</span>
            <h3 className="text-lg font-bold text-gray-900 mb-2">暂无草稿</h3>
            <p className="text-gray-600">使用应急模式快速创建草稿方案</p>
          </div>
        ) : (
          <div className="space-y-3">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="bg-white border border-gray-200 rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">{draft.title}</h3>
                      {draft.status === 'emergency' && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                          应急草稿
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {formatDate(draft.createdAt)}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">预算</span>
                        <p className="font-medium text-gray-900">
                          ¥{draft.config.totalBudget.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">人数</span>
                        <p className="font-medium text-gray-900">
                          {draft.config.peopleCount}人
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">商品</span>
                        <p className="font-medium text-gray-900">
                          {draft.products.length}件
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {onSelectDraft && (
                    <button
                      onClick={() => onSelectDraft(draft)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      打开
                    </button>
                  )}
                  <button
                    onClick={() => handleExport(draft)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    导出
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DraftManager;
