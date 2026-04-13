import React from 'react';
import { policyDocuments, officialLinks } from '../data/policyData';

const PolicyLibrary = () => {
  const categoryIcons = {
    '工会经费': '📄',
    '脱贫地区采购': '📋',
    '采购平台': '🛒'
  };

  const handleViewPolicy = (link) => {
    window.open(link, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">政策文库</h2>
        <p className="text-gray-600">
          以下是与新疆工会采购、脱贫地区农副产品采购、832平台相关的2025版核心政策文件，供您参考查阅。
        </p>
      </div>

      {/* 核心政策文档 */}
      <div className="space-y-4">
        {policyDocuments.map((policy) => (
          <div 
            key={policy.id} 
            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              {/* 图标区域 */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">{categoryIcons[policy.category] || '📄'}</span>
                </div>
              </div>

              {/* 内容区域 */}
              <div className="flex-grow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">{policy.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                      {policy.category}
                    </span>
                    <span className="text-gray-500 text-sm">{policy.effectiveDate}</span>
                  </div>
                </div>
                
                {/* 文号信息 */}
                <p className="text-sm text-blue-600 font-medium mb-2">文号：{policy.docNo}</p>
                <p className="text-gray-600 mb-3">{policy.description}</p>
                
                {/* 发布单位 */}
                <p className="text-xs text-gray-500 mb-4">发布单位：{policy.issuer}</p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleViewPolicy(policy.url)}
                    className="px-5 py-2 min-h-[44px] bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <span>🌐</span>
                    <span>访问官方入口</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 官方链接入口 */}
      <div className="mt-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
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
            >
              <div className="font-semibold text-blue-800 mb-1">{link.name}</div>
              <div className="text-xs text-gray-600">{link.description}</div>
            </a>
          ))}
        </div>
      </div>

      {/* 使用说明 */}
      <div className="mt-8 p-5 bg-amber-50 border border-amber-200 rounded-xl">
        <h3 className="font-semibold text-amber-800 mb-2">💡 政策文库使用说明（2025版）</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• <span className="font-medium">核心政策文件</span>：本页面展示的是2025版新疆工会采购政策汇编中的三份核心文件，涵盖工会经费管理、脱贫地区采购、832平台操作三大领域。</li>
          <li>• <span className="font-medium">官方入口</span>：点击"访问官方入口"将在新标签页打开对应官方网站，可获取最新政策原文和通知公告。</li>
          <li>• <span className="font-medium">合规参考</span>：公文模板已自动引用上述政策文号，确保生成的申请报告符合2025年最新政策要求。</li>
          <li>• <span className="font-medium">更新提示</span>：政策文件可能随时间更新，建议定期访问官方入口获取最新版本。</li>
        </ul>
      </div>

      {/* 温馨提示 */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-green-600 text-xl">💎</span>
          <div>
            <p className="font-medium text-green-800 mb-1">温馨提示：关于832平台采购与政策合规</p>
            <p className="text-green-700 text-sm">
              为完成年度消费帮扶任务并确保政策合规，建议在食品类采购中优先选用832平台产品：
            </p>
            <ul className="mt-2 ml-4 space-y-1 text-green-700 text-sm list-disc">
              <li><strong>无食堂单位</strong>：年度832采购占比应≥20%</li>
              <li><strong>有食堂单位</strong>：食堂食材通过832采购占比应≥10%</li>
              <li><strong>工会慰问品</strong>：脱贫地区农副产品占比应≥30%（依据新财购〔2025〕2号）</li>
              <li><strong>人均上限</strong>：全年慰问品总额≤2000元/人（依据新工办〔2019〕3号2025年补充通知）</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 政策依据说明 */}
      <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-indigo-600 text-xl">📜</span>
          <div>
            <p className="font-medium text-indigo-800 mb-1">本系统引用的核心政策文件</p>
            <div className="space-y-1 text-indigo-700 text-sm">
              <p>1. 《新疆维吾尔自治区基层工会经费收支管理办法实施细则》（<strong>新工办〔2019〕3号</strong>）</p>
              <p>2. 《关于做好2025年政府采购脱贫地区农副产品工作的通知》（<strong>新财购〔2025〕2号</strong>）</p>
              <p>3. 《832平台采购人系统操作指南》（<strong>财办库〔2024〕267号</strong>）</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyLibrary;
