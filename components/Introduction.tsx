import React from 'react';

const Introduction: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-3">
        Welcome to Prof. Hareli's Real World Apprentice
      </h2>
      <p className="text-slate-600 mb-3">
        This AI-powered tool helps you connect social psychology concepts from class
        to real-world events happening right now. Select a lecture topic from the
        left to see recent news stories analyzed through a psychological lens.
      </p>
      <p className="text-slate-500 text-sm">
        Each analysis includes the news event, its source, and an explanation of how
        it demonstrates key concepts from the lecture.
      </p>
    </div>
  );
};

export default Introduction;
