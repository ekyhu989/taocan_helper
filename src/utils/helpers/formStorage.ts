/**
 * 表单数据持久化工具
 * 
 * 将基础信息表单（solutionFormData）和公文表单（reportFormData）
 * 自动保存到 localStorage，页面刷新后可恢复。
 */

const SOLUTION_FORM_KEY = 'taocang_solution_form';
const REPORT_FORM_KEY = 'taocang_report_form';

// ─── 基础信息表单（6字段） ───

export function saveSolutionForm(data) {
  try {
    localStorage.setItem(SOLUTION_FORM_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('保存基础表单失败:', err);
  }
}

export function loadSolutionForm() {
  try {
    const stored = localStorage.getItem(SOLUTION_FORM_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (err) {
    console.warn('读取基础表单失败:', err);
    return null;
  }
}

// ─── 公文信息表单（5字段） ───

export function saveReportForm(data) {
  try {
    localStorage.setItem(REPORT_FORM_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('保存公文表单失败:', err);
  }
}

export function loadReportForm() {
  try {
    const stored = localStorage.getItem(REPORT_FORM_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (err) {
    console.warn('读取公文表单失败:', err);
    return null;
  }
}

// ─── 清空 ───

export function clearSolutionForm() {
  try {
    localStorage.removeItem(SOLUTION_FORM_KEY);
  } catch (err) {
    console.warn('清空基础表单失败:', err);
  }
}

export function clearReportForm() {
  try {
    localStorage.removeItem(REPORT_FORM_KEY);
  } catch (err) {
    console.warn('清空公文表单失败:', err);
  }
}

export function clearAllForms() {
  clearSolutionForm();
  clearReportForm();
}

// ─── 防抖工具 ───

/**
 * 创建一个防抖版本的函数
 * @param {Function} fn - 要防抖的函数
 * @param {number} delay - 延迟毫秒数，默认300ms
 * @returns {Function} 防抖后的函数
 */
export function debounce(fn, delay = 300) {
  let timer = null;
  const debounced = function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
  // 挂载 cancel 方法
  debounced.cancel = function () {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };
  return debounced;
}
