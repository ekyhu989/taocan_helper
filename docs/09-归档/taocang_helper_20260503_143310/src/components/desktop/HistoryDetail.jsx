import React from 'react';
import { formatDate, formatMoney } from '../../utils/helpers/historyStorage';

/**
 * 历史方案详情展示组件
 * ─────────────────────────────────
 * 在 HistoryManager 面板内展示单条历史方案的完整信息
 *
 * Props:
 *   - item: HistoryItem       历史记录对象
 *   - onBack: () => void      返回列表
 *   - onReuse: () => void     使用此方案
 */
function HistoryDetail({ item, onBack, onReuse }) {
  const { createdAt, solutionData, summary } = item;
  const { formData, reportFormData, productList, report } = solutionData;

  const budgetModeLabel = formData.budgetMode === 'per_capita' ? '按人均标准' : '按总额控制';
  const categoryLabel = formData.category || '全部';
  const perCapita = formData.headCount > 0 ? (productList.totalAmount / formData.headCount) : 0;
  const platform832Pct = Math.round(productList.platform832Rate * 100);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onBack} />

      {/* 面板主体 */}
      <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 shrink-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 transition-colors font-medium"
          >
            <span>←</span>
            <span>返回列表</span>
          </button>
          <button
            onClick={onReuse}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            使用此方案
          </button>
        </div>

        {/* 详情内容（可滚动） */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* 生成时间 */}
          <div className="text-sm text-gray-500">
            生成时间：<span className="text-gray-700 font-medium">{formatDate(createdAt)}</span>
          </div>

          {/* 基础信息 */}
          <section className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">基础信息</h3>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
              <InfoRow label="单位名称" value={reportFormData.unitName} />
              <InfoRow label="申请部门" value={reportFormData.department} />
              <InfoRow label="申请人" value={reportFormData.applicant} />
              <InfoRow label="采购场景" value={summary.sceneLabel} />
              <InfoRow label="慰问人数" value={`${summary.headCount} 人`} />
              <InfoRow label="总预算" value={`¥${formatMoney(summary.totalBudget)}`} />
              <InfoRow label="实际合计" value={`¥${formatMoney(summary.totalAmount)}`} highlight />
              <InfoRow label="人均福利" value={`¥${formatMoney(perCapita)}`} />
              <InfoRow label="资金来源" value={formData.fundSource} />
              <InfoRow label="预算模式" value={budgetModeLabel} />
              <InfoRow label="意向品类" value={categoryLabel} />
              {reportFormData.festival && <InfoRow label="节日" value={reportFormData.festival} />}
            </div>
          </section>

          {/* 商品清单 */}
          <section className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">商品清单</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300 text-gray-600">
                    <th className="text-left py-2 pr-2 font-medium">#</th>
                    <th className="text-left py-2 pr-2 font-medium">商品名称</th>
                    <th className="text-right py-2 px-2 font-medium">单价</th>
                    <th className="text-right py-2 px-2 font-medium">数量</th>
                    <th className="text-right py-2 pl-2 font-medium">小计</th>
                  </tr>
                </thead>
                <tbody>
                  {productList.items.map((entry, idx) => (
                    <tr key={entry.product.id} className="border-b border-gray-100 last:border-0">
                      <td className="py-2 pr-2 text-gray-400">{idx + 1}</td>
                      <td className="py-2 pr-2">
                        <span className="text-gray-800">{entry.product.name}</span>
                        {entry.product.is832 && (
                          <span className="ml-1.5 inline-block px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded font-medium">
                            832
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-right text-gray-600">
                        ¥{entry.product.price}
                      </td>
                      <td className="py-2 px-2 text-right text-gray-600">
                        {entry.quantity} {entry.product.unit}
                      </td>
                      <td className="py-2 pl-2 text-right font-medium text-gray-800">
                        ¥{formatMoney(entry.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300">
                    <td colSpan={4} className="py-2 text-right font-bold text-gray-700">合计</td>
                    <td className="py-2 text-right font-bold text-gray-900">
                      ¥{formatMoney(productList.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* 832 占比 */}
            <div className="mt-3 text-sm text-gray-600">
              832平台占比：
              <span className={`font-semibold ${platform832Pct >= 30 ? 'text-green-600' : 'text-orange-500'}`}>
                {platform832Pct}%
              </span>
              {productList.hint832 && (
                <p className="mt-1 text-xs text-gray-400">{productList.hint832}</p>
              )}
            </div>
          </section>

          {/* 采购申请报告 */}
          <section className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">采购申请报告</h3>

            {report ? (
              <div>
                <div className="mb-3 font-semibold text-gray-800">{report.title}</div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-white rounded-md p-4 border border-gray-200 max-h-96 overflow-y-auto">
                  {report.body}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-400 text-center py-4">（无报告数据）</div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}

/** 信息行组件 */
function InfoRow({ label, value, highlight }) {
  return (
    <div>
      <div className="text-gray-500 text-xs">{label}</div>
      <div className={`font-medium ${highlight ? 'text-blue-700' : 'text-gray-800'}`}>
        {value || '-'}
      </div>
    </div>
  );
}

export default HistoryDetail;
