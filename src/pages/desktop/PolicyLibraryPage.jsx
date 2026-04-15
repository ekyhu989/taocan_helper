import React from 'react';
import PolicyLibrary from '../../components/desktop/PolicyLibrary';

const PolicyLibraryPage = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              ←
            </button>
            <h1 className="text-xl font-bold text-gray-800">政策文库</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <PolicyLibrary />
      </div>
    </div>
  );
};

export default PolicyLibraryPage;
