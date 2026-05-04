import React, { useState } from 'react';
import BasicInfoForm from '../../components/desktop/BasicInfoForm';
import SolutionPreview from '../../components/desktop/SolutionPreview';
import ProcurementReport from '../../components/desktop/ProcurementReport';
import { generateThreeSchemes, mapFundingSource } from '../../utils/schemeGenerator';
import { assembleReport } from '../../utils/helpers/reportAssembler';
import { loadProducts } from '../../utils/helpers/productStorage';
import { exportToWord, exportToPDF } from '../../utils/helpers/exportUtils';

const SolutionPage = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    title: '',
    headCount: 0,
    totalBudget: 0,
    fundSource: '行政福利费',
    purchasePurpose: '',
    purchaseDate: '',
    contactPerson: '',
    contactPhone: '',
    scene: 'holiday',
    festival: 'spring',
    department: '',
    applicant: '',
    unitName: '',
    budgetMode: 'per_capita',
    category: '食品'
  });

  const [productListResult, setProductListResult] = useState(null);
  const [report, setReport] = useState(null);
  const [activeTab, setActiveTab] = useState('form');

  // 生成方案
  const handleGenerateSolution = () => {
    if (!formData.headCount || !formData.totalBudget) {
      alert('请先填写人数和预算信息');
      return;
    }

    // 从商品库加载商品数据
    const products = loadProducts();
    
    // 获取当前场景（默认 holiday）
    const currentScene = formData.scene || 'holiday';
    
    // 生成三个方案（PATCH-001 改进）
    const schemeParams = {
      totalBudget: formData.totalBudget,
      peopleCount: formData.headCount,
      fundingSource: mapFundingSource(formData.fundSource),
      budgetMode: formData.budgetMode || 'per_capita',
      scene: currentScene
    };
    
    const threeSchemes = generateThreeSchemes(products, schemeParams);
    setProductListResult(threeSchemes);

    // 构造完整的用户输入对象（包含所有必要字段）
    const fullUserInput = {
      ...formData,
      scene: currentScene,
      festival: formData.festival || 'spring',
      unitName: formData.unitName || formData.title || '本单位',
      department: formData.department || '',
      applicant: formData.applicant || formData.contactPerson || ''
    };

    // 生成报告（暂时使用均衡方案）
    const reportContent = assembleReport(fullUserInput, threeSchemes.balanced);
    setReport(reportContent);

    // 切换到预览标签页
    setActiveTab('preview');
  };

  // 重置方案
  const handleResetSolution = () => {
    setFormData({
      title: '',
      headCount: 0,
      totalBudget: 0,
      fundSource: '行政福利费',
      purchasePurpose: '',
      purchaseDate: '',
      contactPerson: '',
      contactPhone: ''
    });
    setProductListResult(null);
    setReport(null);
    setActiveTab('form');
  };

  // 导出Word文档
  const handleExportWord = async () => {
    if (!report) return;
    
    const fullUserInput = {
      ...formData,
      scene: formData.scene || 'holiday',
      festival: formData.festival || 'spring',
      unitName: formData.unitName || formData.title || '本单位',
      department: formData.department || '',
      applicant: formData.applicant || formData.contactPerson || ''
    };
    
    try {
      await exportToWord(report.body || report, fullUserInput);
    } catch (error) {
      console.error('导出Word失败:', error);
      alert('导出Word失败，请重试');
    }
  };

  // 导出PDF文档
  const handleExportPDF = () => {
    if (!report) return;
    
    const fullUserInput = {
      ...formData,
      scene: formData.scene || 'holiday',
      festival: formData.festival || 'spring',
      unitName: formData.unitName || formData.title || '本单位',
      department: formData.department || '',
      applicant: formData.applicant || formData.contactPerson || ''
    };
    
    try {
      exportToPDF('generated-report-content', fullUserInput, report.body || report);
    } catch (error) {
      console.error('导出PDF失败:', error);
      alert('导出PDF失败，请重试');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">制定采购方案</h1>
          <p className="text-gray-600 mt-2">填写基础信息，生成合规的采购方案</p>
        </div>

        {/* 标签页导航 */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('form')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'form'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            基础信息
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'preview'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            disabled={!productListResult}
          >
            方案预览
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'report'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            disabled={!report}
          >
            公文报告
          </button>
        </div>

        {/* 内容区域 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === 'form' && (
            <div>
              <BasicInfoForm
                formData={formData}
                onDataChange={setFormData}
                onClearForm={handleResetSolution}
              />
              <div className="mt-6 flex gap-4 justify-center">
                <button
                  onClick={handleGenerateSolution}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  生成方案
                </button>
                <button
                  onClick={handleResetSolution}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  重置
                </button>
              </div>
            </div>
          )}

          {activeTab === 'preview' && productListResult && (
            <SolutionPreview
              productListResult={productListResult}
              headCount={formData.headCount}
              totalBudget={formData.totalBudget}
              fundingSource={mapFundingSource(formData.fundSource)}
              onResetSolution={handleResetSolution}
            />
          )}

          {activeTab === 'report' && report && (
            <ProcurementReport
              report={report}
              showExportButtons={true}
              onExportWord={handleExportWord}
              onExportPDF={handleExportPDF}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SolutionPage;