import React, { useMemo } from 'react';
import { X, Download, BarChart3 } from 'lucide-react';
import { Button } from '../common';
import type { SolutionHistoryItem } from '../../hooks/useSolutionHistory';

interface SolutionComparatorProps {
  open: boolean;
  solutions: SolutionHistoryItem[];
  onClose: () => void;
}

const categoryLabels: Record<string, string> = {
  procurement: '采购方案',
  consolation: '慰问方案',
  request: '请示报告',
  approval: '批复文件',
};

const SolutionComparator: React.FC<SolutionComparatorProps> = ({
  open,
  solutions,
  onClose,
}) => {
  // 收集所有字段key
  const allKeys = useMemo(() => {
    const keys = new Set<string>();
    solutions.forEach((s) => {
      Object.keys(s.values).forEach((k) => keys.add(k));
    });
    return Array.from(keys);
  }, [solutions]);

  // 判断某字段在不同方案中是否有差异
  const hasDifference = (key: string): boolean => {
    const vals = solutions.map((s) => s.values[key] || '-');
    return new Set(vals).size > 1;
  };

  const handleExport = () => {
    const lines: string[] = [
      '方案对比报告',
      `生成时间：${new Date().toLocaleString()}`,
      '',
      '对比方案：',
      ...solutions.map((s, i) => `${i + 1}. ${s.templateName} (${new Date(s.exportedAt).toLocaleDateString()})`),
      '',
      '详细对比：',
    ];

    allKeys.forEach((key) => {
      const diff = hasDifference(key);
      lines.push(`\n【${key}】${diff ? ' *差异项' : ''}`);
      solutions.forEach((s, i) => {
        lines.push(`  方案${i + 1}：${s.values[key] || '-'}`);
      });
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `方案对比_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!open || solutions.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-mask"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-title"
    >
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-[1000px] max-h-[90vh] flex flex-col mx-[16px]">
        {/* Header */}
        <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-border-light">
          <div className="flex items-center gap-[12px]">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3
              id="compare-title"
              className="font-medium"
              style={{
                fontSize: 'var(--font-size-h3)',
                color: 'var(--color-text-primary)',
              }}
            >
              方案对比
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-sm hover:bg-bg-light transition-colors"
            aria-label="关闭"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Compare Table */}
        <div className="flex-1 overflow-auto px-[24px] py-[16px]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th
                    className="text-left py-[12px] px-[16px] font-medium bg-bg-light"
                    style={{
                      fontSize: 'var(--font-size-body2)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    对比项
                  </th>
                  {solutions.map((s, i) => (
                    <th
                      key={s.id}
                      className="text-left py-[12px] px-[16px] font-medium bg-bg-light min-w-[200px]"
                      style={{
                        fontSize: 'var(--font-size-body2)',
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      方案 {i + 1}
                      <div
                        className="font-normal mt-[2px]"
                        style={{
                          fontSize: 'var(--font-size-caption)',
                          color: 'var(--color-text-helper)',
                        }}
                      >
                        {s.templateName}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* 模板分类 */}
                <tr className="border-b border-border-light">
                  <td
                    className="py-[12px] px-[16px] font-medium"
                    style={{
                      fontSize: 'var(--font-size-body2)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    模板分类
                  </td>
                  {solutions.map((s) => {
                    const diff = hasDifference('templateCategory');
                    return (
                      <td
                        key={s.id}
                        className={`py-[12px] px-[16px] ${diff ? 'bg-error/5' : ''}`}
                        style={{
                          fontSize: 'var(--font-size-body1)',
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        {categoryLabels[s.templateCategory] || s.templateCategory}
                      </td>
                    );
                  })}
                </tr>
                {/* 导出时间 */}
                <tr className="border-b border-border-light">
                  <td
                    className="py-[12px] px-[16px] font-medium"
                    style={{
                      fontSize: 'var(--font-size-body2)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    导出时间
                  </td>
                  {solutions.map((s) => (
                    <td
                      key={s.id}
                      className="py-[12px] px-[16px]"
                      style={{
                        fontSize: 'var(--font-size-body1)',
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {new Date(s.exportedAt).toLocaleString()}
                    </td>
                  ))}
                </tr>
                {/* 变量值 */}
                {allKeys.map((key) => {
                  const diff = hasDifference(key);
                  return (
                    <tr
                      key={key}
                      className={`border-b border-border-light ${diff ? 'bg-error/5' : ''}`}
                    >
                      <td
                        className="py-[12px] px-[16px] font-medium"
                        style={{
                          fontSize: 'var(--font-size-body2)',
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        {key}
                        {diff && (
                          <span className="ml-[4px] text-error text-[11px]">差异</span>
                        )}
                      </td>
                      {solutions.map((s) => (
                        <td
                          key={s.id}
                          className="py-[12px] px-[16px]"
                          style={{
                            fontSize: 'var(--font-size-body1)',
                            color: 'var(--color-text-primary)',
                          }}
                        >
                          {s.values[key] || '-'}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {solutions.length < 2 && (
            <p
              className="text-center py-[24px]"
              style={{
                fontSize: 'var(--font-size-body2)',
                color: 'var(--color-text-secondary)',
              }}
            >
              请至少选择 2 个方案进行对比
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-[8px] px-[24px] py-[16px] border-t border-border-light">
          <Button variant="ghost" onClick={onClose}>
            关闭
          </Button>
          <Button variant="primary" onClick={handleExport}>
            <Download className="w-4 h-4 mr-1" />
            导出对比结果
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SolutionComparator;
