import React, { useState, useMemo } from 'react';
import { policies, officialLinks, coreComplianceRequirements, searchPolicies, findClause } from '../../data/policies';
import { usePolicyVersion } from '../../hooks/usePolicyVersion';
import PolicyUpdateModal from './PolicyUpdateModal';

const PolicyLibrary = () => {
  const [activeTab, setActiveTab] = useState('official');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPolicyId, setSelectedPolicyId] = useState(policies[0]?.id || null);
  const [clauseSearch, setClauseSearch] = useState('');
  const [foundClause, setFoundClause] = useState(null);
  
  const { isVersionValid, showUpdateModal, confirmVersion, beforeAction } = usePolicyVersion();

  const categoryIcons = {
    '工会经费': '📄',
    '脱贫地区采购': '📋',
    '采购平台': '🛒'
  };

  // 获取选中的政策
  const selectedPolicy = useMemo(() => 
    policies.find(p => p.id === selectedPolicyId) || policies[0],
    [selectedPolicyId]
  );

  // 搜索政策
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchPolicies(searchQuery);
  }, [searchQuery]);

  // 搜索条款
  const handleClauseSearch = () => {
    if (!clauseSearch.trim()) {
      setFoundClause(null);
      return;
    }
    const result = findClause(clauseSearch);
    setFoundClause(result);
    if (result) {
      setSelectedPolicyId(result.policy.id);
      setActiveTab('clauses');
    }
  };

  // 处理政策链接点击（添加版本校验）
  const handleViewPolicy = (url) => {
    if (!beforeAction()) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // 核心合规条款置顶展示
  const renderCoreRequirements = () => (
    <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
      <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
        <span>📋</span>
        <span>核心合规要求速览</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {coreComplianceRequirements.map((req, index) => (
          <div 
            key={index} 
            className="bg-white border border-blue-100 rounded-lg p-3 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <span className="text-sm font-medium text-gray-800">{req}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 政策选择卡片
  const renderPolicySelector = () => (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-bold text-gray-800">政策文库</h2>
        <div className="text-sm text-gray-600">
          版本：{selectedPolicy.version} | 最后更新：{selectedPolicy.updateDate}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {policies.map(policy => (
          <button
            key={policy.id}
            onClick={() => setSelectedPolicyId(policy.id)}
            className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
              selectedPolicyId === policy.id 
                ? 'border-blue-500 bg-blue-50 shadow-md' 
                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">{categoryIcons[policy.category] || '📄'}</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">{policy.title}</h3>
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                    {policy.category}
                  </span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                    {policy.docNo}
                  </span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{policy.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // 搜索区域
  const renderSearchArea = () => (
    <div className="mb-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 关键词搜索 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            政策全文搜索
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="输入关键词搜索政策标题、内容、条款..."
              className="w-full pl-10 pr-4 py-3 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-sm"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {searchQuery && (
            <div className="mt-2 text-sm text-gray-600">
              找到 {searchResults.length} 个相关结果
            </div>
          )}
        </div>

        {/* 条款编号搜索 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            条款编号精准跳转
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={clauseSearch}
              onChange={(e) => setClauseSearch(e.target.value)}
              placeholder="输入条款编号，如：第5条"
              className="flex-grow px-4 py-3 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-sm"
            />
            <button
              onClick={handleClauseSearch}
              className="px-4 py-3 min-h-[44px] bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              跳转
            </button>
          </div>
          {foundClause && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
              已定位到 {foundClause.policy.title} 的 {foundClause.clause.number}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // 内容展示区域
  const renderContentArea = () => {
    const tabs = [
      { id: 'official', label: '官方原文', icon: '📜' },
      { id: 'interpretation', label: '政策解读', icon: '💡' },
      { id: 'clauses', label: '核心条款', icon: '📑' },
    ];

    const renderTabContent = () => {
      switch (activeTab) {
        case 'official':
          return (
            <div className="prose max-w-none">
              <div className="whitespace-pre-line text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
                {selectedPolicy.content}
              </div>
            </div>
          );
        case 'interpretation':
          return (
            <div className="prose max-w-none">
              <div className="whitespace-pre-line text-gray-700 bg-blue-50 p-4 rounded-lg border border-blue-200">
                {selectedPolicy.interpretation}
              </div>
            </div>
          );
        case 'clauses':
          return (
            <div className="space-y-4">
              {selectedPolicy.clauses.map((clause) => (
                <div key={clause.number} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <span className="text-indigo-700 font-bold">{clause.number}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">{clause.title}</h4>
                      <p className="text-gray-600 text-sm">{clause.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Tab导航 */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab内容 */}
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-800 mb-2">{selectedPolicy.title}</h3>
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <span>文号：{selectedPolicy.docNo}</span>
              <span>•</span>
              <span>发布单位：{selectedPolicy.issuer}</span>
              <span>•</span>
              <span>生效日期：{selectedPolicy.effectiveDate}</span>
            </div>
          </div>

          {renderTabContent()}

          {/* 官方链接按钮 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => handleViewPolicy(selectedPolicy.officialUrl)}
              className="flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
            >
              <span>🌐</span>
              <span>访问官方原文（{selectedPolicy.issuer}）</span>
            </button>
            <p className="mt-2 text-xs text-gray-500">
              点击将在新标签页打开官方源地址：{selectedPolicy.officialUrl}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // 官方链接入口
  const renderOfficialLinks = () => (
    <div className="mt-8">
      <h3 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
        <span>🔗</span>
        <span>官方入口快速访问</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {officialLinks.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 bg-white border border-blue-100 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200"
            onClick={(e) => {
              if (!beforeAction()) {
                e.preventDefault();
              }
            }}
          >
            <div className="font-semibold text-blue-800 mb-1">{link.name}</div>
            <div className="text-xs text-gray-600">{link.description}</div>
          </a>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {renderCoreRequirements()}
      {renderPolicySelector()}
      {renderSearchArea()}
      {renderContentArea()}
      {renderOfficialLinks()}

      {/* 政策版本更新弹窗 */}
      {showUpdateModal && (
        <PolicyUpdateModal
          isOpen={showUpdateModal}
          onConfirm={confirmVersion}
          onViewUpdates={() => window.open(officialLinks[0]?.url, '_blank', 'noopener,noreferrer')}
        />
      )}

      {/* 版本校验状态提示 */}
      {!isVersionValid && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium text-yellow-800">政策版本未确认</p>
              <p className="text-yellow-700 text-sm mt-1">
                请确认最新政策版本以解锁全部功能，包括公文生成和导出。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PolicyLibrary;
