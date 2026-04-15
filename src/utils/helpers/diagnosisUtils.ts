export interface RiskItem {
  type: 'annual_limit' | 'single_warning' | 'platform832';
  title: string;
  currentValue: number;
  limitValue: number;
  unit: string;
  level: 'high' | 'medium' | 'low';
  formula: string;
}

export interface DiagnosisResult {
  isValid: boolean;
  risks: RiskItem[];
  totalRiskCount: number;
}

export const calculateRisks = (
  headCount: number | '',
  totalBudget: number | '',
  platform832Amount: number = 0,
  totalAmount: number = 0
): DiagnosisResult => {
  const risks: RiskItem[] = [];
  const count = Number(headCount) || 0;
  const budget = Number(totalBudget) || 0;
  const perCapita = count > 0 ? budget / count : 0;
  const platform832Rate = totalAmount > 0 ? platform832Amount / totalAmount : 0;

  // 1. 年度人均校验
  if (perCapita > 2000) {
    risks.push({
      type: 'annual_limit',
      title: '年度人均超标',
      currentValue: perCapita,
      limitValue: 2000,
      unit: '元/人',
      level: 'high',
      formula: '人均 = 总预算 ÷ 人数',
    });
  } else if (perCapita > 500) {
    // 2. 单次预警校验
    risks.push({
      type: 'single_warning',
      title: '单次人均超过预警线',
      currentValue: perCapita,
      limitValue: 500,
      unit: '元/人',
      level: 'medium',
      formula: '人均 = 总预算 ÷ 人数',
    });
  }

  // 3. 832占比校验
  if (platform832Rate < 0.3 && totalAmount > 0) {
    risks.push({
      type: 'platform832',
      title: '832平台占比不达标',
      currentValue: Math.round(platform832Rate * 100),
      limitValue: 30,
      unit: '%',
      level: 'medium',
      formula: '832占比 = 832平台商品金额 ÷ 总金额',
    });
  }

  return {
    isValid: risks.length === 0,
    risks,
    totalRiskCount: risks.length,
  };
};

export const getAutoFixSuggestion = (risks: RiskItem[], headCount?: number | '') => {
  return risks.map(risk => {
    if (risk.type === 'annual_limit') {
      const maxBudget = risk.limitValue * (Number(headCount) || 1);
      return {
        type: risk.type,
        suggestion: `建议将总预算调整为 ≤ ${maxBudget} 元，或增加人数`,
        adjustedBudget: maxBudget,
      };
    }
    if (risk.type === 'single_warning') {
      return {
        type: risk.type,
        suggestion: '建议适当降低人均标准，或拆分多次采购',
      };
    }
    if (risk.type === 'platform832') {
      return {
        type: risk.type,
        suggestion: '建议增加832平台商品采购占比至30%以上',
      };
    }
    return { type: risk.type, suggestion: '' };
  });
};
