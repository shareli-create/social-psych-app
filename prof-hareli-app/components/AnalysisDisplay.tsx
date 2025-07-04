import React from 'react';
import { AnalysisResult, LectureTopic } from '../types';
import { SpinnerIcon, ErrorIcon, ApprenticeAvatarIcon, ExternalLinkIcon } from './icons/Icons';

const AnalysisDisplay: React.FC<{
  selectedTopic: LectureTopic | null;
  result: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
}> = ({ selectedTopic, result, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white/50 rounded-lg shadow-md p-8 text-center backdrop-blur-sm">
        <SpinnerIcon className="h-12 w-12 text-orange-500" />
        <h3 className="mt-4 text-xl font-semibold text-slate-800">Analyzing Recent Events...</h3>
        <p className="mt-1 text-slate-500">Connecting Prof. Shlomo Hareli's lecture on "{selectedTopic?.title}" to current events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] bg-red-50 rounded-lg shadow-md p-8 text-center">
        <ErrorIcon className="h-12 w-12 text-red-500" />
        <h3 className="mt-4 text-xl font-semibold text-red-800">Analysis Failed</h3>
        <p className="mt-1 text-red-600 max-w-lg">{error}</p>
      </div>
    );
  }
  
  if (result && result.analyses.length > 0) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
            <h2 className="text-3xl font-bold text-slate-900">Analysis for: <span className="text-orange-600">{selectedTopic?.title}</span></h2>
        </div>
        
        {result.analyses.map((analysis, index) => {
          const searchUrl = `https://www.google.com/search?tbm=nws&q=${encodeURIComponent(analysis.source_title || '')}`;

          return (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 sm:p-8">
                <span className="inline-block bg-purple-100 text-purple-800 text-sm font-semibold px-4 py-1 rounded-full mb-5">
                  Event {index + 1}
                </span>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Source Information</h3>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <p className="text-sm text-slate-600">
                          <span className="font-semibold text-slate-900">Source:</span> {analysis.source_attribution}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                          <span className="font-semibold text-slate-900">Article Title:</span> {analysis.source_title}
                      </p>
                      <a 
                          href={searchUrl}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center mt-4 text-sm font-semibold text-purple-600 hover:text-purple-800 transition-colors"
                      >
                          Find this article on Google News
                          <ExternalLinkIcon className="h-4 w-4 ml-1.5"/>
                      </a>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Event Summary</h3>
                  <p className="text-slate-600 leading-relaxed">
                      {analysis.event_summary}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Psychological Explanation</h3>
                  <p className="text-slate-600 leading-relaxed">
                    {analysis.psychological_explanation}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white/50 rounded-lg shadow-md p-8 text-center backdrop-blur-sm">
      <ApprenticeAvatarIcon className="h-24 w-24 text-purple-400" />
      <h3 className="mt-4 text-2xl font-bold text-slate-800">Real World Apprentice</h3>
      <p className="mt-2 text-slate-500 max-w-md">Please select a lecture topic from the list to begin the analysis. The AI will find and explain three relevant world news events.</p>
    </div>
  );
};

export default AnalysisDisplay;