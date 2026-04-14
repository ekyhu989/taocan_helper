import React, { useState, useEffect } from 'react';
import {
  getUndoStack,
  undoAction,
  getRemainingTime,
  registerUndoCallbacks,
  unregisterUndoCallbacks,
} from '../utils/undoManager';

const UndoToast = () => {
  const [actions, setActions] = useState(getUndoStack());

  useEffect(() => {
    const updateActions = () => {
      setActions(getUndoStack());
    };

    registerUndoCallbacks({
      onActionAdded: updateActions,
      onActionRemoved: updateActions,
      onStackChanged: updateActions,
    });

    const timer = setInterval(updateActions, 1000);

    return () => {
      unregisterUndoCallbacks();
      clearInterval(timer);
    };
  }, []);

  if (actions.length === 0) return null;

  const latestAction = actions[actions.length - 1];
  const remainingSeconds = Math.ceil(getRemainingTime(latestAction) / 1000);

  const handleUndo = () => {
    undoAction(latestAction.id);
  };

  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[100]">
      <div className="bg-gray-800 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-4 animate-slide-up">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-green-400">✅</span>
            <span className="font-medium">{latestAction.message}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm">
            {remainingSeconds}秒后消失
          </span>
          <button
            onClick={handleUndo}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium transition-colors"
          >
            撤销
          </button>
        </div>
      </div>
    </div>
  );
};

export default UndoToast;
