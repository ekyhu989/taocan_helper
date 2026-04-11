const mockData = {
  basicInfo: {
    unitName: 'XX市财政局',
    sceneOptions: [
      { value: 'holiday', label: '节日福利' },
      { value: 'activity', label: '职工慰问' },
      { value: 'care', label: '简易福利礼品' }
    ],
    headCount: 100,
    totalBudget: 60000,
    fundSource: '行政福利费',
    department: '行政部',
    applicant: '张三'
  },
  products: [
    {
      id: '1',
      name: '东北大米礼盒',
      unit: '箱',
      price: 120,
      category: '食品',
      scenes: ['holiday', 'activity'],
      is832: true,
      quantity: 1,
      subtotal: 120
    },
    {
      id: '2',
      name: '有机花生油',
      unit: '桶',
      price: 85,
      category: '食品',
      scenes: ['holiday', 'activity'],
      is832: true,
      quantity: 1,
      subtotal: 85
    },
    {
      id: '3',
      name: '精选坚果礼盒',
      unit: '盒',
      price: 150,
      category: '食品',
      scenes: ['holiday', 'care'],
      is832: false,
      quantity: 1,
      subtotal: 150
    },
    {
      id: '4',
      name: '进口牛奶整箱',
      unit: '箱',
      price: 68,
      category: '食品',
      scenes: ['holiday', 'activity', 'care'],
      is832: false,
      quantity: 2,
      subtotal: 136
    },
    {
      id: '5',
      name: '精品水果礼盒',
      unit: '箱',
      price: 98,
      category: '食品',
      scenes: ['holiday', 'care'],
      is832: true,
      quantity: 1,
      subtotal: 98
    },
    {
      id: '6',
      name: '中秋月饼礼盒',
      unit: '盒',
      price: 188,
      category: '食品',
      scenes: ['holiday'],
      is832: false,
      quantity: 1,
      subtotal: 188
    }
  ],
  purchaseReport: `关于2026年春节职工慰问品采购方案的申请报告

致：XX市财政局工会委员会

一、申请事由
值此春节来临之际，为体现公司对职工的关怀，增强团队凝聚力，根据《基层工会经费收支管理办法》及公司年度福利计划，拟开展节日慰问活动。

二、慰问对象及标准
1.慰问对象： 公司全体在职职工（含劳务派遣人员），共计100人。
2.预算标准：
◦人均标准：人民币600元/人。
◦总预算：人民币60000元（大写：陆万元整）。
◦合规说明：本次人均标准符合工会经费支出相关规定。

三、采购方案
本次采购拟通过832平台进行，坚持"合规、实用、普惠"原则。具体品单如下：
1.东北大米礼盒（1箱 × 120元）
2.有机花生油（1桶 × 85元）
3.精选坚果礼盒（1盒 × 150元）
4.进口牛奶整箱（2箱 × 68元）
5.精品水果礼盒（1箱 × 98元）
◦消费帮扶说明：本次方案中，832平台脱贫地区农副产品金额占比约50%，符合年度消费帮扶任务要求。

温馨提示：为完成年度消费帮扶任务，建议在食品类采购中优先选用832平台产品，便于集中完成全年指标。

四、发放方式
由各部门统一领取发放，职工签字确认。

妥否，请批示。

申请部门： 行政部
日期： 2026年1月15日`
};

module.exports = mockData;
