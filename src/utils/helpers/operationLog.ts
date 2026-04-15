export interface OperationLog {
  id: string;
  schemeId?: string;
  operation: string;
  target: string;
  timestamp: string;
  beforeValue?: any;
  afterValue?: any;
  amountChange?: number;
  userAgent: string;
}

const LOGS_KEY = 'operation_logs';
const MAX_LOGS = 1000;

export const saveOperationLog = (log: Omit<OperationLog, 'id' | 'timestamp' | 'userAgent'>) => {
  const logs = getOperationLogs();
  const newLog: OperationLog = {
    ...log,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
  };

  logs.unshift(newLog);

  if (logs.length > MAX_LOGS) {
    logs.splice(MAX_LOGS);
  }

  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
};

export const getOperationLogs = (): OperationLog[] => {
  try {
    const logs = localStorage.getItem(LOGS_KEY);
    return logs ? JSON.parse(logs) : [];
  } catch {
    return [];
  }
};

export const getLogsBySchemeId = (schemeId: string): OperationLog[] => {
  return getOperationLogs().filter(log => log.schemeId === schemeId);
};

export const exportLogsToJSON = () => {
  const logs = getOperationLogs();
  const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `operation_logs_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportLogsToExcel = () => {
  const logs = getOperationLogs();
  const headers = ['时间', '操作', '目标', '变更前', '变更后', '金额变更'];
  
  const csvContent = [
    headers.join(','),
    ...logs.map(log => [
      log.timestamp,
      log.operation,
      log.target,
      JSON.stringify(log.beforeValue || '').replace(/"/g, '""'),
      JSON.stringify(log.afterValue || '').replace(/"/g, '""'),
      log.amountChange || '',
    ].join(',')),
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `operation_logs_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
