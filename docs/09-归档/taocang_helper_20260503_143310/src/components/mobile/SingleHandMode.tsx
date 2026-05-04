import React, { useState, useEffect } from 'react';

interface SingleHandModeProps {
  onChange?: (hand: 'left' | 'right') => void;
}

type HandPreference = 'left' | 'right';

const SingleHandMode: React.FC<SingleHandModeProps> = ({ onChange }) => {
  const [hand, setHand] = useState<HandPreference>('right');

  useEffect(() => {
    const saved = localStorage.getItem('singleHandPreference');
    if (saved === 'left' || saved === 'right') {
      setHand(saved);
    }
  }, []);

  const handleChange = (newHand: HandPreference) => {
    setHand(newHand);
    localStorage.setItem('singleHandPreference', newHand);
    onChange?.(newHand);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900">单手操作</h3>
        <span className="text-sm text-gray-500">
          {hand === 'right' ? '右手握机' : '左手握机'}
        </span>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => handleChange('right')}
          className={`flex-1 p-4 rounded-xl border-2 transition-all ${
            hand === 'right'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-gray-50'
          }`}
        >
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-2">✋</span>
            <span className={`font-medium ${hand === 'right' ? 'text-blue-700' : 'text-gray-700'}`}>
              右手
            </span>
            <span className="text-xs text-gray-500 mt-1">
              按钮靠左
            </span>
          </div>
        </button>

        <button
          onClick={() => handleChange('left')}
          className={`flex-1 p-4 rounded-xl border-2 transition-all ${
            hand === 'left'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-gray-50'
          }`}
        >
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-2">🖐️</span>
            <span className={`font-medium ${hand === 'left' ? 'text-blue-700' : 'text-gray-700'}`}>
              左手
            </span>
            <span className="text-xs text-gray-500 mt-1">
              按钮靠右
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default SingleHandMode;
