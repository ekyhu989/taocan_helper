import React, { useState } from 'react';
// import { 
//   generatePdfDocument, 
//   batchExportPdf,
//   generateExcelDocument,
//   batchExportExcel,
//   exportAuditExcel,
//   exportSimpleExcel 
// } from '../../utils/export';
import type { IScheme, IExportConfig } from '../../types';

/**
 * 导出配置面板组件
 * V2.0 导出功能优化 - 提供用户友好的导出配置界面
 */

interface ExportPanelProps {
  scheme: IScheme;
  schemes?: IScheme[];
  onExportComplete?: (result: any) => void;
  onExportError?: (error: string) => void;
  className?: string;
}

/**
 * 导出配置
 */
interface IExportSettings {
  format: 'pdf' | 'excel';
  quality: 'standard' | 'high' | 'print';
  includeLogs: boolean;
  includeCompliance: boolean;
  includeProducts: boolean;
  watermark: boolean;
  pageNumbers: boolean;
  auditFormat: boolean;
  multiSheet: boolean;
  hiddenSheets: boolean;
  styling: boolean;
  pageSetup: {
    margin: { top: number; bottom: number; left: number; right: number };
    header: string;
    footer: string;
  };
}

/**
 * 默认导出设置
 */
const defaultExportSettings: IExportSettings = {
  format: 'pdf',
  quality: 'print',
  includeLogs: true,
  includeCompliance: true,
  includeProducts: true,
  watermark: true,
  pageNumbers: true,
  auditFormat: false,
  multiSheet: true,
  hiddenSheets: true,
  styling: true,
  pageSetup: {
    margin: { top: 20, bottom: 20, left: 25, right: 25 },
    header: '智能采购助手 - 采购方案',
    footer: '第 {page} 页 / 共 {pages} 页'
  }
};

const ExportPanel: React.FC<ExportPanelProps> = ({
  scheme,
  schemes = [],
  onExportComplete,
  onExportError,
  className = ''
}) => {
  const [settings, setSettings] = useState<IExportSettings>(defaultExportSettings);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState<'standard' | 'audit' | 'simple'>('standard');

  /**
   * 应用预设配置
   */
  const applyPreset = (preset: 'standard' | 'audit' | 'simple') => {
    setSelectedPreset(preset);
    
    const presetConfigs = {
      standard: {
        ...defaultExportSettings,
        format: 'pdf' as const,
        quality: 'print' as const,
        auditFormat: false,
        multiSheet: true
      },
      audit: {
        ...defaultExportSettings,
        format: 'excel' as const,
        quality: 'high' as const,
        auditFormat: true,
        multiSheet: true,
        hiddenSheets: false,
        includeLogs: true
      },
      simple: {
        ...defaultExportSettings,
        format: 'excel' as const,
        quality: 'standard' as const,
        auditFormat: false,
        multiSheet: false,
        includeLogs: false,
        includeCompliance: false,
        styling: false
      }
    };
    
    setSettings(presetConfigs[preset]);
  };

  /**
   * 处理导出
   */
  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    
    try {
      let result;
      
      if (settings.format === 'pdf') {
        if (schemes.length > 1) {
          // 批量导出PDF
          result = await batchExportPdf(schemes, {
            format: 'pdf',
            includeLogs: settings.includeLogs,
            includeCompliance: settings.includeCompliance,
            includeProducts: settings.includeProducts,
            watermark: settings.watermark,
            pageSetup: {
              margin: settings.pageSetup.margin,
              header: settings.pageSetup.header,
              footer: settings.pageSetup.footer,
              pageNumbers: settings.pageNumbers,
              watermark: settings.watermark
            },
            quality: settings.quality
          });
        } else {
          // 单个导出PDF
          result = await generatePdfDocument(scheme, {
            format: 'pdf',
            includeLogs: settings.includeLogs,
            includeCompliance: settings.includeCompliance,
            includeProducts: settings.includeProducts,
            watermark: settings.watermark,
            pageSetup: {
              margin: settings.pageSetup.margin,
              header: settings.pageSetup.header,
              footer: settings.pageSetup.footer,
              pageNumbers: settings.pageNumbers,
              watermark: settings.watermark
            },
            quality: settings.quality
          });
        }
      } else {
        // Excel导出
        if (settings.auditFormat) {
          result = await exportAuditExcel(scheme);
        } else if (selectedPreset === 'simple') {
          result = await exportSimpleExcel(scheme);
        } else {
          result = await generateExcelDocument(scheme, {
            format: 'excel',
            includeLogs: settings.includeLogs,
            includeCompliance: settings.includeCompliance,
            includeProducts: settings.includeProducts,
            auditFormat: settings.auditFormat,
            multiSheet: settings.multiSheet,
            hiddenSheets: settings.hiddenSheets ? ['修改日志'] : [],
            styling: settings.styling
          });
        }
      }
      
      onExportComplete?.(result);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '导出失败';
      onExportError?.(errorMessage);
    } finally {
      setIsExporting(false);
      setExportProgress(100);
    }
  };

  /**
   * 更新设置
   */
  const updateSetting = <K extends keyof IExportSettings>(
    key: K,
    value: IExportSettings[K]
  ) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  /**
   * 更新页面设置
   */
  const updatePageSetup = (key: keyof IExportSettings['pageSetup'], value: any) => {
    setSettings(prev => ({
      ...prev,
      pageSetup: {
        ...prev.pageSetup,
        [key]: value
      }
    }));
  };

  return (
    <div className={`export-panel ${className}`}>
      <div className="export-header">
        <h3>导出配置</h3>
        <p>选择导出格式和配置选项</p>
      </div>

      {/* 预设选择 */}
      <div className="preset-section">
        <label>预设配置：</label>
        <div className="preset-buttons">
          <button
            className={`preset-btn ${selectedPreset === 'standard' ? 'active' : ''}`}
            onClick={() => applyPreset('standard')}
          >
            📄 标准格式
          </button>
          <button
            className={`preset-btn ${selectedPreset === 'audit' ? 'active' : ''}`}
            onClick={() => applyPreset('audit')}
          >
            🔍 审计格式
          </button>
          <button
            className={`preset-btn ${selectedPreset === 'simple' ? 'active' : ''}`}
            onClick={() => applyPreset('simple')}
          >
            📋 简化格式
          </button>
        </div>
      </div>

      {/* 格式选择 */}
      <div className="format-section">
        <label>导出格式：</label>
        <div className="format-options">
          <label className="format-option">
            <input
              type="radio"
              value="pdf"
              checked={settings.format === 'pdf'}
              onChange={(e) => updateSetting('format', e.target.value as 'pdf')}
            />
            <span>PDF文档</span>
          </label>
          <label className="format-option">
            <input
              type="radio"
              value="excel"
              checked={settings.format === 'excel'}
              onChange={(e) => updateSetting('format', e.target.value as 'excel')}
            />
            <span>Excel表格</span>
          </label>
        </div>
      </div>

      {/* PDF配置 */}
      {settings.format === 'pdf' && (
        <div className="pdf-settings">
          <div className="setting-group">
            <label>输出质量：</label>
            <select
              value={settings.quality}
              onChange={(e) => updateSetting('quality', e.target.value as any)}
            >
              <option value="standard">标准</option>
              <option value="high">高质量</option>
              <option value="print">打印优化</option>
            </select>
          </div>

          <div className="setting-group">
            <label>
              <input
                type="checkbox"
                checked={settings.watermark}
                onChange={(e) => updateSetting('watermark', e.target.checked)}
              />
              添加水印
            </label>
          </div>

          <div className="setting-group">
            <label>
              <input
                type="checkbox"
                checked={settings.pageNumbers}
                onChange={(e) => updateSetting('pageNumbers', e.target.checked)}
              />
              显示页码
            </label>
          </div>

          {/* 页面设置 */}
          <div className="page-setup">
            <h4>页面设置</h4>
            <div className="margin-settings">
              <label>页边距 (mm)：</label>
              <div className="margin-inputs">
                <input
                  type="number"
                  value={settings.pageSetup.margin.top}
                  onChange={(e) => updatePageSetup('margin', {
                    ...settings.pageSetup.margin,
                    top: parseInt(e.target.value) || 0
                  })}
                  min="0"
                  max="50"
                />
                <span>上</span>
                <input
                  type="number"
                  value={settings.pageSetup.margin.bottom}
                  onChange={(e) => updatePageSetup('margin', {
                    ...settings.pageSetup.margin,
                    bottom: parseInt(e.target.value) || 0
                  })}
                  min="0"
                  max="50"
                />
                <span>下</span>
                <input
                  type="number"
                  value={settings.pageSetup.margin.left}
                  onChange={(e) => updatePageSetup('margin', {
                    ...settings.pageSetup.margin,
                    left: parseInt(e.target.value) || 0
                  })}
                  min="0"
                  max="50"
                />
                <span>左</span>
                <input
                  type="number"
                  value={settings.pageSetup.margin.right}
                  onChange={(e) => updatePageSetup('margin', {
                    ...settings.pageSetup.margin,
                    right: parseInt(e.target.value) || 0
                  })}
                  min="0"
                  max="50"
                />
                <span>右</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Excel配置 */}
      {settings.format === 'excel' && (
        <div className="excel-settings">
          <div className="setting-group">
            <label>
              <input
                type="checkbox"
                checked={settings.multiSheet}
                onChange={(e) => updateSetting('multiSheet', e.target.checked)}
              />
              多Sheet导出
            </label>
          </div>

          <div className="setting-group">
            <label>
              <input
                type="checkbox"
                checked={settings.hiddenSheets}
                onChange={(e) => updateSetting('hiddenSheets', e.target.checked)}
              />
              隐藏修改日志
            </label>
          </div>

          <div className="setting-group">
            <label>
              <input
                type="checkbox"
                checked={settings.styling}
                onChange={(e) => updateSetting('styling', e.target.checked)}
              />
              应用样式
            </label>
          </div>
        </div>
      )}

      {/* 通用配置 */}
      <div className="common-settings">
        <h4>内容选项</h4>
        <div className="setting-group">
          <label>
            <input
              type="checkbox"
              checked={settings.includeLogs}
              onChange={(e) => updateSetting('includeLogs', e.target.checked)}
            />
            包含修改日志
          </label>
        </div>

        <div className="setting-group">
          <label>
            <input
              type="checkbox"
              checked={settings.includeCompliance}
              onChange={(e) => updateSetting('includeCompliance', e.target.checked)}
            />
            包含合规检查
          </label>
        </div>

        <div className="setting-group">
          <label>
            <input
              type="checkbox"
              checked={settings.includeProducts}
              onChange={(e) => updateSetting('includeProducts', e.target.checked)}
            />
            包含商品清单
          </label>
        </div>
      </div>

      {/* 导出按钮 */}
      <div className="export-actions">
        <button
          className="export-btn"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <span className="spinner"></span>
              导出中... {exportProgress}%
            </>
          ) : (
            `导出${schemes.length > 1 ? ` ${schemes.length} 个方案` : ''}`
          )}
        </button>
        
        {isExporting && (
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${exportProgress}%` }}
            ></div>
          </div>
        )}
      </div>

      <style jsx>{`
        .export-panel {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          max-width: 500px;
        }

        .export-header {
          margin-bottom: 20px;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 15px;
        }

        .export-header h3 {
          margin: 0 0 5px 0;
          font-size: 18px;
          font-weight: 600;
        }

        .export-header p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .preset-section,
        .format-section,
        .setting-group {
          margin-bottom: 15px;
        }

        .preset-buttons {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }

        .preset-btn {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .preset-btn.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .preset-btn:hover {
          border-color: #9ca3af;
        }

        .format-options {
          display: flex;
          gap: 20px;
          margin-top: 8px;
        }

        .format-option {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }

        .pdf-settings,
        .excel-settings,
        .common-settings {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid #f3f4f6;
        }

        .page-setup h4,
        .common-settings h4 {
          margin: 0 0 10px 0;
          font-size: 14px;
          font-weight: 600;
        }

        .margin-settings {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .margin-inputs {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .margin-inputs input {
          width: 60px;
          padding: 4px 8px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
        }

        .margin-inputs span {
          font-size: 12px;
          color: #6b7280;
        }

        .export-actions {
          margin-top: 25px;
          text-align: center;
        }

        .export-btn {
          width: 100%;
          padding: 12px 20px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .export-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .export-btn:hover:not(:disabled) {
          background: #2563eb;
        }

        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 8px;
        }

        .progress-bar {
          width: 100%;
          height: 4px;
          background: #f3f4f6;
          border-radius: 2px;
          margin-top: 10px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #10b981;
          transition: width 0.3s ease;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        input[type="checkbox"],
        input[type="radio"] {
          margin-right: 6px;
        }

        select {
          padding: 6px 10px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          background: white;
        }

        label {
          font-size: 14px;
          color: #374151;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default ExportPanel;