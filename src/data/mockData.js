const mockData = {
  basicInfo: {
    region: '新疆地区',
    sceneOptions: [
      { value: 'holiday', label: '传统节日慰问' },
      { value: 'activity', label: '专项活动物资' },
      { value: 'care', label: '精准帮扶慰问' }
    ],
    festivalOptions: [
      { value: 'spring', label: '春节' },
      { value: 'eid', label: '古尔邦节' },
      { value: 'nowruz', label: '肉孜节' },
      { value: 'other', label: '其他' }
    ],
    headCount: '',
    totalBudget: '',
    fundSource: '行政福利费',
    budgetMode: 'per_capita',
    category: '食品'
  },
  
  // 示例方案数据 - 用于页面加载时展示
  exampleSolution: {
    title: '某国企2026年春节慰问品采购方案示例',
    headCount: 100,
    totalBudget: 50000,
    perCapita: 500,
    products: [
      {
        id: 'ex1',
        name: '五常大米礼盒',
        unit: '箱',
        price: 120.00,
        category: '食品',
        scenes: ['holiday', 'activity'],
        is832: true,
        quantity: 1,
        subtotal: 120.00,
        supplier: '黑龙江五常粮油有限公司'
      },
      {
        id: 'ex2',
        name: '特级花生油',
        unit: '桶',
        price: 85.00,
        category: '食品',
        scenes: ['holiday', 'activity'],
        is832: true,
        quantity: 1,
        subtotal: 85.00,
        supplier: '山东鲁花集团'
      },
      {
        id: 'ex3',
        name: '精选坚果大礼包',
        unit: '盒',
        price: 150.00,
        category: '食品',
        scenes: ['holiday', 'care'],
        is832: false,
        quantity: 1,
        subtotal: 150.00,
        supplier: '三只松鼠股份有限公司'
      },
      {
        id: 'ex4',
        name: '进口纯牛奶整箱',
        unit: '箱',
        price: 68.00,
        category: '食品',
        scenes: ['holiday', 'activity', 'care'],
        is832: false,
        quantity: 2,
        subtotal: 136.00,
        supplier: '蒙牛乳业有限公司'
      },
      {
        id: 'ex5',
        name: '精品水果礼篮',
        unit: '篮',
        price: 98.00,
        category: '食品',
        scenes: ['holiday', 'care'],
        is832: true,
        quantity: 1,
        subtotal: 98.00,
        supplier: '鲜丰水果有限公司'
      },
      {
        id: 'ex6',
        name: '定制不锈钢保温杯',
        unit: '个',
        price: 65.00,
        category: '生活用品',
        scenes: ['activity'],
        is832: false,
        quantity: 1,
        subtotal: 65.00,
        supplier: '富光实业股份有限公司'
      }
    ]
  },
  
  // 原产品数据保持不变，用于生成真实方案
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
  
  // 标准公文示例 - 用于公文生成页展示
  exampleReport: `XX市财政局
政采函〔2026〕15号

关于2026年春节慰问品采购的申请

局领导：

根据《基层工会经费收支管理办法》（总工办发〔2018〕32号）和年度福利工作安排，为体现组织关怀，增强职工凝聚力，拟在2026年春节前夕开展职工慰问活动。现将有关事项请示如下：

一、慰问对象
本单位全体在职职工（含劳务派遣人员），共计100人。

二、慰问标准
按照相关规定，结合单位实际，本次慰问按人均500元标准执行，总预算为人民币50000元（大写：伍万元整）。

三、慰问品方案
经比选，拟采购以下慰问品组合：
1. 五常大米礼盒：1箱/人，单价120元
2. 特级花生油：1桶/人，单价85元  
3. 精选坚果大礼包：1盒/人，单价150元
4. 进口纯牛奶：2箱/人，单价68元/箱
5. 精品水果礼篮：1篮/人，单价98元

以上方案符合消费帮扶要求，832平台产品占比达40%，可计入年度帮扶任务。

四、采购方式
拟通过832平台集中采购，确保质量可靠、价格合理、流程合规。

五、经费来源
行政福利费列支。

妥否，请批示。

    申请部门：行政部
    申请人：王明
    2026年1月10日`,
  
  // 原有采购报告示例
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

export default mockData;
