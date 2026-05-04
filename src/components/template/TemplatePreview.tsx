import React from 'react';
import type { Template } from '../../types/template.types';

interface TemplatePreviewProps {
  template: Template;
}

/**
 * 高亮模板内容中的变量占位符
 * 将 ${变量名} 替换为带高亮样式的 span
 */
const highlightVariables = (content: string): React.ReactNode[] => {
  const parts = content.split(/(\$\{[^}]+\})/g);

  return parts.map((part, index) => {
    const match = part.match(/^\$\{([^}]+)\}$/);
    if (match) {
      const variableName = match[1];
      return (
        <span
          key={index}
          className="inline-block mx-[2px] px-[6px] py-[2px] rounded-sm font-semibold text-white"
          style={{ backgroundColor: 'var(--color-warning)' }}
          role="mark"
          aria-label={`变量：${variableName}`}
        >
          ${`{${variableName}}`}
        </span>
      );
    }
    // 处理换行
    return part.split('\n').map((line, lineIndex, arr) => (
      <React.Fragment key={`${index}-${lineIndex}`}>
        {line}
        {lineIndex < arr.length - 1 && <br />}
      </React.Fragment>
    ));
  });
};

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template }) => {
  return (
    <div
      className="bg-white rounded-md border border-border"
      style={{
        padding: 'var(--spacing-lg)',
        fontSize: 'var(--font-size-body1)',
        lineHeight: 'var(--line-height-loose)',
        color: 'var(--color-text-primary)',
      }}
    >
      {/* 模板标题 */}
      <div
        className="text-center font-semibold mb-[24px] pb-[16px] border-b border-border-light"
        style={{ fontSize: 'var(--font-size-h3)' }}
      >
        {template.name}
      </div>

      {/* 模板内容 */}
      <div className="whitespace-pre-wrap">
        {highlightVariables(template.content)}
      </div>

      {/* 变量列表 */}
      {template.variables.length > 0 && (
        <div className="mt-[32px] pt-[16px] border-t border-border-light">
          <h4
            className="font-medium mb-[12px]"
            style={{
              fontSize: 'var(--font-size-body1)',
              color: 'var(--color-text-secondary)',
            }}
          >
            模板变量（共{template.variables.length}个）
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[8px]">
            {template.variables.map((variable) => (
              <div
                key={variable.key}
                className="flex items-center gap-[8px] px-[12px] py-[8px] rounded-sm bg-bg-light"
              >
                <span
                  className="font-medium"
                  style={{ color: 'var(--color-warning)' }}
                >
                  ${`{${variable.key}}`}
                </span>
                <span
                  style={{
                    fontSize: 'var(--font-size-caption)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {variable.label}
                  {variable.required && (
                    <span className="text-error ml-[4px]">*</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatePreview;
