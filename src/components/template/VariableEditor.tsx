import React, { useState, useCallback } from 'react';
import { Input } from '../common';
import type { Template, TemplateVariable } from '../../types/template.types';

export type VariableValues = Record<string, string>;

interface VariableEditorProps {
  template: Template;
  values: VariableValues;
  onChange: (values: VariableValues) => void;
  errors: Record<string, string>;
  onValidate: (key: string, error: string) => void;
}

/**
 * 将模板内容中的变量占位符替换为用户输入的值
 */
export const fillTemplate = (content: string, values: VariableValues): string => {
  return content.replace(/\$\{([^}]+)\}/g, (match, key) => {
    return key in values ? values[key] : match;
  });
};

const VariableEditor: React.FC<VariableEditorProps> = ({
  template,
  values,
  onChange,
  errors,
  onValidate,
}) => {
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = useCallback(
    (key: string, value: string) => {
      onChange({ ...values, [key]: value });
      // 清除错误
      if (errors[key]) {
        onValidate(key, '');
      }
    },
    [values, onChange, errors, onValidate]
  );

  const handleBlur = useCallback(
    (variable: TemplateVariable) => {
      setTouched((prev) => ({ ...prev, [variable.key]: true }));
      // 必填验证
      if (variable.required && !values[variable.key]?.trim()) {
        onValidate(variable.key, `${variable.label}为必填项`);
      }
    },
    [values, onValidate]
  );

  const renderVariableInput = (variable: TemplateVariable) => {
    const inputType = variable.type === 'select' ? 'select' : variable.type;
    const inputValue = values[variable.key] || variable.defaultValue || '';
    const error = touched[variable.key] ? errors[variable.key] : undefined;

    const commonProps = {
      label: (
        <>
          {variable.label}
          {variable.required && (
            <span className="text-error ml-[4px]" aria-hidden="true">
              *
            </span>
          )}
        </>
      ),
      required: variable.required,
      value: inputValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        handleChange(variable.key, e.target.value),
      onBlur: () => handleBlur(variable),
      error,
      'aria-required': variable.required,
      'aria-describedby': error ? `error-${variable.key}` : undefined,
    };

    if (inputType === 'select' && variable.options) {
      return (
        <Input
          {...commonProps}
          type="select"
          options={variable.options.map((opt) => ({ value: opt, label: opt }))}
        />
      );
    }

    return <Input {...commonProps} type={inputType as 'text' | 'number' | 'date' | 'textarea'} />;
  };

  return (
    <div className="space-y-[16px]">
      {template.variables.map((variable) => (
        <div key={variable.key} id={`field-${variable.key}`}>
          {renderVariableInput(variable)}
        </div>
      ))}
    </div>
  );
};

export default VariableEditor;
