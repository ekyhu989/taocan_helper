export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ValidationRule {
  min?: number;
  max?: number;
  required?: boolean;
  type?: 'number' | 'string';
}

const VALIDATION_RULES = {
  price: {
    min: 0.01,
    max: 10000,
    required: true,
    type: 'number',
  },
  quantity: {
    min: 1,
    max: 10000,
    required: true,
    type: 'number',
  },
  budget: {
    min: 0.01,
    max: 1000000,
    required: true,
    type: 'number',
  },
  headCount: {
    min: 1,
    max: 10000,
    required: true,
    type: 'number',
  },
};

export const validateValue = (
  value: any,
  rule: ValidationRule,
  fieldName: string
): ValidationResult => {
  const errors: string[] = [];

  if (rule.required && (value === undefined || value === null || value === '')) {
    errors.push(`${fieldName}不能为空`);
  }

  if (value !== undefined && value !== null && value !== '') {
    if (rule.type === 'number') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        errors.push(`${fieldName}必须是数字`);
      } else {
        if (rule.min !== undefined && numValue < rule.min) {
          errors.push(`${fieldName}不能小于${rule.min}`);
        }
        if (rule.max !== undefined && numValue > rule.max) {
          errors.push(`${fieldName}不能大于${rule.max}`);
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validatePrice = (price: any): ValidationResult => {
  return validateValue(price, VALIDATION_RULES.price, '单价');
};

export const validateQuantity = (quantity: any): ValidationResult => {
  return validateValue(quantity, VALIDATION_RULES.quantity, '数量');
};

export const validateBudget = (budget: any): ValidationResult => {
  return validateValue(budget, VALIDATION_RULES.budget, '预算');
};

export const validateHeadCount = (headCount: any): ValidationResult => {
  return validateValue(headCount, VALIDATION_RULES.headCount, '人数');
};

export const validateMultiple = (
  validations: { value: any; validator: (v: any) => ValidationResult }[]
): ValidationResult => {
  const allErrors: string[] = [];
  
  validations.forEach(({ value, validator }) => {
    const result = validator(value);
    if (!result.isValid) {
      allErrors.push(...result.errors);
    }
  });

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
};

export const formatValidationError = (errors: string[]): string => {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0];
  return errors.join('；');
};
