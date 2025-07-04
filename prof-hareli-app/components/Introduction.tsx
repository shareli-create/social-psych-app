import React from 'react';
import { LightbulbIcon, NewspaperIcon, PointerIcon, RefreshIcon } from './icons/Icons';

const Introduction: React.FC = () => {
  return (
    <div className="mb-8 p-6 sm:p-8 bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 rounded-2xl shadow-lg border border-white/50">
      <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome to Your Real World Apprentice!</h2>
          <p className="text-slate-600 mb-6 max-w-3xl">This tool is designed to bring your social psychology studies to life by linking the concepts from Prof. Shlomo Hareli's lectures to real-world events and current issues.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-slate-700">
        
        {/* How to Use */}
        <div className="bg-white/60 p-4 rounded-xl backdrop-blur-sm">
          <div className="flex items-center mb-2">
            <PointerIcon className="h-6 w-6 text-purple-500 mr-3"/>
            <h4 className="font-bold">How to Use</h4>
          </div>
          <p className="text-sm">Simply click on a lecture topic from the list on the left to get started.</p>
        </div>

        {/* Dynamic Content */}
        <div className="bg-white/60 p-4 rounded-xl backdrop-blur-sm">
          <div className="flex items-center mb-2">
            <RefreshIcon className="h-6 w-6 text-pink-500 mr-3"/>
            <h4 className="font-bold">Always Fresh</h4>
          </div>
          <p className="text-sm">The news is always changing, so you'll get new, relevant examples each time you select a topic.</p>
        </div>
        
        {/* Sources */}
        <div className="bg-white/60 p-4 rounded-xl backdrop-blur-sm">
          <div className="flex items-center mb-2">
            <NewspaperIcon className="h-6 w-6 text-orange-500 mr-3"/>
            <h4 className="font-bold">Verified Sources</h4>
          </div>
          <p className="text-sm">Events are sourced from major global news outlets like Reuters, CNN, BBC, and more.</p>
        </div>

        {/* Learning Benefit */}
        <div className="bg-white/60 p-4 rounded-xl backdrop-blur-sm">
          <div className="flex items-center mb-2">
            <LightbulbIcon className="h-6 w-6 text-yellow-500 mr-3"/>
            <h4 className="font-bold">Enrich Your Learning</h4>
          </div>
          <p className="text-sm">Bridge the gap between academic theory and real life to make concepts tangible and memorable.</p>
        </div>

      </div>
    </div>
  );
};

export default Introduction;