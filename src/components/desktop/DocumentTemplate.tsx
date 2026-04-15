import React from 'react';

interface DocumentTemplateProps {
  title?: string;
  department?: string;
  date?: string;
  content?: React.ReactNode;
}

const DocumentTemplate: React.FC<DocumentTemplateProps> = ({
  title = '基层工会采购方案',
  department = '某某单位工会',
  date = new Date().toLocaleDateString('zh-CN'),
  children
}) => {
  return (
    <div className="bg-white shadow-lg mx-auto max-w-[800px]">
      {/* 红头区域 */}
      <div className="text-center border-b-4 border-red-600 pb-6 pt-8">
        <div className="text-4xl font-bold text-red-600 mb-2">
          {department}
        </div>
        <div className="text-lg text-gray-600">文件</div>
      </div>

      {/* 文号 */}
      <div className="px-12 py-4 text-right">
        <span className="text-gray-600">工发〔{new Date().getFullYear()}〕001号</span>
      </div>

      {/* 标题 */}
      <div className="px-12 py-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {title}
        </h1>
      </div>

      {/* 主送单位 */}
      <div className="px-12 py-2">
        <p className="text-gray-900">各部门、各分会：</p>
      </div>

      {/* 正文内容 */}
      <div className="px-12 py-4">
        {children || (
          <div className="space-y-4 text-gray-900 leading-relaxed">
            <p className="indent-8">
              为做好工会福利发放工作，根据《基层工会经费收支管理办法》相关规定，结合我单位实际情况，制定本采购方案。
            </p>
            <p className="indent-8">
              本次采购预算总额为 <strong>¥50,000.00</strong> 元，计划发放人数 <strong>100</strong> 人，人均标准 <strong>¥500.00</strong> 元。
            </p>
          </div>
        )}
      </div>

      {/* 商品清单 */}
      <div className="px-12 py-4">
        <h3 className="text-lg font-bold text-gray-900 mb-4">一、采购清单</h3>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-4 py-2 text-left">序号</th>
              <th className="border border-gray-300 px-4 py-2 text-left">商品名称</th>
              <th className="border border-gray-300 px-4 py-2 text-right">单价</th>
              <th className="border border-gray-300 px-4 py-2 text-center">数量</th>
              <th className="border border-gray-300 px-4 py-2 text-right">小计</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2">1</td>
              <td className="border border-gray-300 px-4 py-2">东北大米 5kg</td>
              <td className="border border-gray-300 px-4 py-2 text-right">¥68.00</td>
              <td className="border border-gray-300 px-4 py-2 text-center">2</td>
              <td className="border border-gray-300 px-4 py-2 text-right">¥136.00</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">2</td>
              <td className="border border-gray-300 px-4 py-2">鲁花花生油 5L</td>
              <td className="border border-gray-300 px-4 py-2 text-right">¥128.00</td>
              <td className="border border-gray-300 px-4 py-2 text-center">1</td>
              <td className="border border-gray-300 px-4 py-2 text-right">¥128.00</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">3</td>
              <td className="border border-gray-300 px-4 py-2">新疆灰枣礼盒</td>
              <td className="border border-gray-300 px-4 py-2 text-right">¥88.00</td>
              <td className="border border-gray-300 px-4 py-2 text-center">1</td>
              <td className="border border-gray-300 px-4 py-2 text-right">¥88.00</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-300 px-4 py-2" colSpan={4} className="font-bold text-right">
                总计
              </td>
              <td className="border border-gray-300 px-4 py-2 text-right font-bold">
                ¥352.00
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 合规说明 */}
      <div className="px-12 py-4">
        <h3 className="text-lg font-bold text-gray-900 mb-4">二、合规说明</h3>
        <div className="space-y-2 text-gray-900">
          <p>1. 人均标准：¥352.00 元/人（≤500元，合规）</p>
          <p>2. 832产品占比：66.7%（≥60%，合规）</p>
          <p>3. 资金来源：工会经费</p>
        </div>
      </div>

      {/* 落款 */}
      <div className="px-12 py-12 text-right">
        <p className="text-gray-900">{department}</p>
        <p className="text-gray-900 mt-2">{date}</p>
      </div>

      {/* 签章区域 */}
      <div className="px-12 py-8 border-t border-gray-300 mt-8">
        <div className="grid grid-cols-2 gap-8">
          <div className="text-center">
            <div className="border-2 border-dashed border-gray-300 w-32 h-32 mx-auto mb-2 flex items-center justify-center text-gray-400">
              单位公章
            </div>
            <p className="text-sm text-gray-600">（盖章处）</p>
          </div>
          <div className="text-center">
            <div className="border-2 border-dashed border-gray-300 w-32 h-32 mx-auto mb-2 flex items-center justify-center text-gray-400">
              负责人
            </div>
            <p className="text-sm text-gray-600">（签字）</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentTemplate;
