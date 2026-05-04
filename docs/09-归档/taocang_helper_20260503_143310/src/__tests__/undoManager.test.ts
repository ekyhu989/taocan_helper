import {
  executeWithUndo,
  undoAction,
  getUndoStack,
  clearUndoStack,
  getRemainingTime,
  UndoableAction,
} from '../utils/undoManager';

describe('V1.6 撤销管理器 - undoManager', () => {
  beforeEach(() => {
    clearUndoStack();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('执行可撤销操作 - executeWithUndo', () => {
    test('TC-V16-087: 执行操作成功', () => {
      const executeMock = jest.fn();
      const undoMock = jest.fn();

      const action = executeWithUndo(
        'delete',
        'product',
        '删除商品',
        { id: 1, name: '商品1' },
        null,
        executeMock,
        undoMock
      );

      expect(executeMock).toHaveBeenCalled();
      expect(action.type).toBe('delete');
      expect(action.target).toBe('product');
    });

    test('TC-V16-088: 操作添加到撤销栈', () => {
      const action = executeWithUndo(
        'update',
        'budget',
        '更新预算',
        5000,
        6000,
        () => {},
        () => {}
      );

      const stack = getUndoStack();
      expect(stack.length).toBe(1);
      expect(stack[0].id).toBe(action.id);
    });

    test('TC-V16-089: 多个操作依次添加', () => {
      executeWithUndo('delete', 'product1', '删除商品1', {}, {}, () => {}, () => {});
      executeWithUndo('delete', 'product2', '删除商品2', {}, {}, () => {}, () => {});

      const stack = getUndoStack();
      expect(stack.length).toBe(2);
    });
  });

  describe('撤销操作 - undoAction', () => {
    test('TC-V16-090: 成功撤销操作', () => {
      const undoMock = jest.fn();

      const action = executeWithUndo(
        'delete',
        'product',
        '删除商品',
        {},
        {},
        () => {},
        undoMock
      );

      const result = undoAction(action.id);
      expect(result).toBe(true);
      expect(undoMock).toHaveBeenCalled();
    });

    test('TC-V16-091: 撤销后从栈中移除', () => {
      const action = executeWithUndo(
        'delete',
        'product',
        '删除商品',
        {},
        {},
        () => {},
        () => {}
      );

      undoAction(action.id);
      const stack = getUndoStack();
      expect(stack.length).toBe(0);
    });

    test('TC-V16-092: 撤销不存在的操作返回false', () => {
      const result = undoAction('nonexistent-id');
      expect(result).toBe(false);
    });
  });

  describe('撤销栈管理 - clearUndoStack', () => {
    test('TC-V16-093: 清空撤销栈', () => {
      executeWithUndo('delete', 'product1', '删除1', {}, {}, () => {}, () => {});
      executeWithUndo('delete', 'product2', '删除2', {}, {}, () => {}, () => {});

      clearUndoStack();
      const stack = getUndoStack();
      expect(stack.length).toBe(0);
    });
  });

  describe('超时清理机制', () => {
    test('TC-V16-094: 获取剩余时间', () => {
      const action = executeWithUndo(
        'delete', 'product', '删除', {}, {}, () => {}, () => {});
      const remaining = getRemainingTime(action);
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(30000);
    });

    test('TC-V16-095: 30秒后操作自动清理', () => {
      executeWithUndo('delete', 'product', '删除', {}, {}, () => {}, () => {});

      jest.advanceTimersByTime(30000);

      const stack = getUndoStack();
      expect(stack.length).toBe(0);
    });
  });

  describe('操作类型验证', () => {
    test('TC-V16-096: 删除操作类型', () => {
      const action = executeWithUndo('delete', 'target', '消息', {}, {}, () => {}, () => {});
      expect(action.type).toBe('delete');
    });

    test('TC-V16-097: 更新操作类型', () => {
      const action = executeWithUndo('update', 'target', '消息', {}, {}, () => {}, () => {});
      expect(action.type).toBe('update');
    });

    test('TC-V16-098: 清空操作类型', () => {
      const action = executeWithUndo('clear', 'target', '消息', {}, {}, () => {}, () => {});
      expect(action.type).toBe('clear');
    });
  });
});
