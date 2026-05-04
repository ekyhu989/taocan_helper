import React from 'react';

interface SceneQuickEntryProps {
  onSelectScene: (scene: string) => void;
}

const SceneQuickEntry: React.FC<SceneQuickEntryProps> = ({ onSelectScene }) => {
  const scenes = [
    {
      id: 'spring',
      icon: '🧧',
      label: '春节慰问',
      color: 'bg-red-500',
      description: '春节福利采购'
    },
    {
      id: 'midautumn',
      icon: '🥮',
      label: '中秋慰问',
      color: 'bg-orange-500',
      description: '中秋福利采购'
    },
    {
      id: 'special',
      icon: '🎯',
      label: '专项活动',
      color: 'bg-blue-500',
      description: '专项活动采购'
    },
    {
      id: 'difficulty',
      icon: '❤️',
      label: '困难帮扶',
      color: 'bg-green-500',
      description: '困难职工帮扶'
    }
  ];

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-4 py-3">
        <h2 className="text-lg font-bold text-gray-900 mb-3">快捷入口</h2>
        <div className="flex overflow-x-auto gap-3 pb-2 -mx-1 px-1">
          {scenes.map((scene) => (
            <button
              key={scene.id}
              onClick={() => onSelectScene(scene.id)}
              className="flex-shrink-0 w-32 p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all active:scale-95"
            >
              <div className={`w-12 h-12 ${scene.color} rounded-xl flex items-center justify-center mb-3`}>
                <span className="text-2xl">{scene.icon}</span>
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">{scene.label}</h3>
              <p className="text-xs text-gray-500">{scene.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SceneQuickEntry;
