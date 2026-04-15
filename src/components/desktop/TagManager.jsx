import React, { useState } from 'react';

const presetTags = [
  '春节慰问',
  '古尔邦节',
  '肉孜节',
  '高频使用',
  '已审计',
  '待整改',
  '标杆方案',
  '参考模板',
];

const TagManager = ({ selectedTags = [], onTagsChange, maxTags = 5 }) => {
  const [customTagInput, setCustomTagInput] = useState('');

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < maxTags) {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const addCustomTag = (e) => {
    e.preventDefault();
    const tag = customTagInput.trim();
    if (tag && !selectedTags.includes(tag) && selectedTags.length < maxTags) {
      onTagsChange([...selectedTags, tag]);
      setCustomTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">添加标签</label>
        <div className="flex flex-wrap gap-2">
          {presetTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={addCustomTag} className="flex gap-2">
        <input
          type="text"
          value={customTagInput}
          onChange={(e) => setCustomTagInput(e.target.value)}
          placeholder="输入自定义标签，回车添加"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={selectedTags.length >= maxTags}
        />
        <button
          type="submit"
          disabled={!customTagInput.trim() || selectedTags.length >= maxTags}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          添加
        </button>
      </form>

      {selectedTags.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">已选择标签 ({selectedTags.length}/{maxTags})</label>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-blue-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagManager;
