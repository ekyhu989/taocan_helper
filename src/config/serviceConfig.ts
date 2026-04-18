/**
 * 客服联系方式配置
 * 
 * 集中管理所有客服信息，便于统一修改。
 * 部署前请将示例数据替换为真实联系方式。
 * 
 * 配置位置：src/config/serviceConfig.ts
 */

export const SERVICE_CONFIG = {
  /** 客服电话 */
  phone: '400-8888-6688',
  /** 客服微信号 */
  wechat: 'taocang_service',
  /** 客服邮箱 */
  email: 'service@taocang.com',
  /** 工作时间 */
  workHours: '工作日 9:00-18:00',
  /** 客服公司名称 */
  companyName: '淘仓智能采购平台',
} as const;

/** 客服引导文案（统一风格） */
export const SERVICE_MESSAGES = {
  /** 商品库页引导 */
  productLibrary: {
    title: '需要添加新商品？',
    desc: '请联系客服，我们将为您导入到商品库。',
    btnText: '联系客服',
  },
  /** 方案生成页引导（无匹配商品） */
  schemeGenerator: {
    title: '当前商品库暂无完全匹配您需求的商品',
    suggestions: [
      '调整预算或场景条件，重新生成',
      '联系客服获取专属优惠和定制服务',
    ],
    btnRegenerate: '重新生成',
    btnContact: '联系客服',
  },
} as const;
