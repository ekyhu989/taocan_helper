export interface UndoableAction {
  id: string;
  type: 'delete' | 'update' | 'clear';
  target: string;
  timestamp: number;
  beforeData: any;
  afterData: any;
  message: string;
  execute: () => void;
  undo: () => void;
}

const UNDO_DURATION = 30000;
let undoStack: UndoableAction[] = [];
let activeTimer: NodeJS.Timeout | null = null;

interface UndoCallbacks {
  onActionAdded?: (action: UndoableAction) => void;
  onActionRemoved?: (actionId: string) => void;
  onStackChanged?: (stack: UndoableAction[]) => void;
}

let callbacks: UndoCallbacks = {};

export const registerUndoCallbacks = (newCallbacks: UndoCallbacks) => {
  callbacks = { ...callbacks, ...newCallbacks };
};

export const unregisterUndoCallbacks = () => {
  callbacks = {};
};

const removeFromUndoStack = (actionId: string) => {
  const index = undoStack.findIndex(action => action.id === actionId);
  if (index !== -1) {
    undoStack.splice(index, 1);
    callbacks.onActionRemoved?.(actionId);
    callbacks.onStackChanged?.(undoStack);
  }
};

export const executeWithUndo = (
  type: 'delete' | 'update' | 'clear',
  target: string,
  message: string,
  beforeData: any,
  afterData: any,
  execute: () => void,
  undo: () => void
): UndoableAction => {
  const action: UndoableAction = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    type,
    target,
    timestamp: Date.now(),
    beforeData,
    afterData,
    message,
    execute,
    undo,
  };

  action.execute();
  undoStack.push(action);
  callbacks.onActionAdded?.(action);
  callbacks.onStackChanged?.(undoStack);

  setTimeout(() => {
    removeFromUndoStack(action.id);
  }, UNDO_DURATION);

  return action;
};

export const undoAction = (actionId: string): boolean => {
  const action = undoStack.find(a => a.id === actionId);
  if (action) {
    action.undo();
    removeFromUndoStack(actionId);
    return true;
  }
  return false;
};

export const getUndoStack = (): UndoableAction[] => {
  return [...undoStack];
};

export const clearUndoStack = () => {
  undoStack = [];
  callbacks.onStackChanged?.(undoStack);
};

export const getRemainingTime = (action: UndoableAction): number => {
  const elapsed = Date.now() - action.timestamp;
  return Math.max(0, UNDO_DURATION - elapsed);
};
