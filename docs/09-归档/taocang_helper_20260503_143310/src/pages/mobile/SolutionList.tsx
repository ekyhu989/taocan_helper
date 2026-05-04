import React, { useState } from 'react';
import type { SchemeSet, Scheme } from '../../utils/schemeGenerator';
import { getDiscountLabel, mapFundingSource } from '../../utils/schemeGenerator';
import { saveHistory, formatDate, formatMoney } from '../../utils/helpers/historyStorage';

interface SolutionListProps {
  onNavigate: (page: string, data?: any) => void;
  schemeData?: {
    schemes: SchemeSet;
    formData: {
      totalBudget: number;
      peopleCount: number;
      fundSource: string;
      scene: string;
      unitName: string;
      budgetMode: string;
    };
  };
}

const SCHEME_LABELS: Record<string, string> = {
  balanced: '均衡推荐',
  costEffective: '高性价比',
  highQuality: '高品质甄选',
};

const SCHEME_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  balanced: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-500' },
  costEffective: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-500' },
  highQuality: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-500' },
};

const SolutionList: React.FC<SolutionListProps> = ({ onNavigate, schemeData }) => {
  const [selectedType, setSelectedType] = useState<'balanced' | 'costEffective' | 'highQuality'>('balanced');
  const [saved, setSaved] = useState(false);

  if (!schemeData || !schemeData.schemes) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-gray-600 mb-4">暂无方案数据</p>
          <button
            onClick={() => onNavigate('scheme')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium"
          >
            新建方案
          </button>
        </div>
      </div>
    );
  }

  const { schemes, formData } = schemeData;
  const selectedScheme: Scheme = schemes[selectedType];
  const colors = SCHEME_COLORS[selectedType];
  const perCapitaBudget = formData.peopleCount > 0 ? formData.totalBudget / formData.peopleCount : 0;
  const discountLabel = getDiscountLabel(mapFundingSource(formData.fundSource || 'union'));
  const perCapitaLimit = selectedScheme.perCapitaLimit || perCapitaBudget;
  const welfareBonus = perCapitaBudget > 0 && selectedScheme.perCapitaPrice > perCapitaBudget
    ? ((selectedScheme.perCapitaPrice - perCapitaBudget) / perCapitaBudget) * 100
    : 0;
  const isOverLimit = selectedScheme.perCapitaPrice > perCapitaLimit;

  const handleSave = () => {
    try {
      saveHistory({
        solutionData: {
          formData: {
            scene: formData.scene as any || 'spring',
            headCount: formData.peopleCount,
            totalBudget: formData.totalBudget,
            fundSource: formData.fundSource,
            budgetMode: formData.budgetMode,
            category: '食品',
          },
          reportFormData: {
            unitName: formData.unitName || '本单位',
            department: '',
            applicant: '',
            year: new Date().getFullYear(),
            festival: formData.scene || 'spring',
          },
          productList: {
            items: selectedScheme.items.map(it => ({
              product: it.product,
              quantity: it.quantity,
              subtotal: it.subtotal,
            })),
            totalAmount: selectedScheme.totalAmount,
            budgetUsageRate: formData.totalBudget > 0 ? selectedScheme.totalAmount / formData.totalBudget : 0,
            platform832Amount: selectedScheme.items
              .filter(it => it.product.is832)
              .reduce((s, it) => s + it.subtotal, 0),
            platform832Rate: selectedScheme.totalAmount > 0
              ? selectedScheme.items.filter(it => it.product.is832).reduce((s, it) => s + it.subtotal, 0) / selectedScheme.totalAmount
              : 0,
            hint832: '',
            noMatchWarning: '',
          } as any,
          report: {} as any,
        },
        summary: {
          unitName: formData.unitName || '本单位',
          scene: formData.scene as any || 'spring',
          sceneLabel: SCENE_LABELS[formData.scene] || '春节慰问',
          headCount: formData.peopleCount,
          totalBudget: formData.totalBudget,
          totalAmount: selectedScheme.totalAmount,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('保存失败:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('scheme')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              ←
            </button>
            <h1 className="text-xl font-bold text-gray-900">采购方案</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                saved ? 'bg-green-600 text-white' : 'bg-green-600 text-white'
              }`}
            >
              {saved ? '已保存 ✓' : '保存'}
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {(['balanced', 'costEffective', 'highQuality'] as const).map((type) => {
            const c = SCHEME_COLORS[type];
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedType === type
                    ? `${c.bg} ${c.text}`
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {SCHEME_LABELS[type]}
              </button>
            );
          })}
        </div>

        <div className={`bg-white rounded-xl shadow-sm p-5 border-2 ${colors.border} mb-4`}>
          <div className="flex items-center justify-between mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}>
              {SCHEME_LABELS[selectedType]}
            </span>
            {selectedScheme.ratio832.passed ? (
              <span className="text-xs text-green-600 font-medium">✅ 合规</span>
            ) : (
              <span className="text-xs text-red-500 font-medium">⚠️ 832占比不足</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                ¥{selectedScheme.perCapitaPrice.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">人均总价</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${isOverLimit ? 'text-red-600' : 'text-green-600'}`}>
                ¥{selectedScheme.totalAmount.toFixed(0)}
              </div>
              <div className="text-sm text-gray-500">总金额</div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">人均标准</span>
              <span>¥{perCapitaBudget.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">折扣系数</span>
              <span className="text-blue-600 font-medium">{discountLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">人均上限</span>
              <span>¥{perCapitaLimit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">832占比</span>
              <span className={selectedScheme.ratio832.passed ? 'text-green-600' : 'text-red-500'}>
                {selectedScheme.ratio832.amountRatio.toFixed(1)}%
              </span>
            </div>
            {welfareBonus > 0 && !isOverLimit && (
              <div className="pt-2 border-t border-gray-100">
                <div className="text-green-600 text-xs">
                  ✅ 通过{discountLabel.replace(' ', '')}，实际可采购金额提升 {welfareBonus.toFixed(0)}%
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-bold text-gray-900 mb-3">商品清单</h3>
          <div className="space-y-3">
            {selectedScheme.items.map((item, index) => (
              <div key={item.product.id || index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">{item.product.name}</div>
                  <div className="text-xs text-gray-500">
                    {item.product.spec || item.product.unit || ''} · {item.product.is832 ? '832平台' : '普通'}
                  </div>
                </div>
                <div className="text-right ml-3">
                  <div className="font-medium text-gray-900">¥{item.product.price.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
            <span className="text-gray-600 text-sm">合计</span>
            <span className="font-bold text-blue-600">¥{selectedScheme.perCapitaPrice.toFixed(2)}/人</span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-bottom">
        <div className="flex gap-3">
          <button
            onClick={() => onNavigate('scheme')}
            className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg"
          >
            重新生成
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-lg"
          >
            {saved ? '已保存 ✓' : '确认使用'}
          </button>
        </div>
      </div>
    </div>
  );
};

const SCENE_LABELS: Record<string, string> = {
  spring: '春节慰问',
  midautumn: '中秋慰问',
  special: '专项活动',
  difficulty: '困难帮扶',
};

export default SolutionList;
