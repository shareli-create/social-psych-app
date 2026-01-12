import React from 'react';
import { LectureTopic, AnalysisResult } from '../types';

interface AnalysisDisplayProps {
  selectedTopic: LectureTopic | null;
  result: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({
  selectedTopic,
  result,
  isLoading,
  error,
}) => {
  if (!selectedTopic) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-slate-500 text-lg">
          Select a lecture topic to see real-world examples
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
        </div>
        <p className="text-slate-500 text-center mt-6">
          Analyzing recent news for relevant examples...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">Analysis Failed</h3>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-lg p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">{selectedTopic.title}</h2>
        <p className="text-purple-100 text-sm">
          <strong>Key concepts:</strong> {selectedTopic.concepts}
        </p>
      </div>

      {result.analyses.map((analysis, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-semibold text-slate-800 flex-1">
                {analysis.source_title}
              </h3>
            </div>
            <p className="text-sm text-slate-500 mb-3">
              Source: {analysis.source_attribution}
              {analysis.source_uri && (
                <>
                  {' • '}
                  <a
                    href={analysis.source_uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-800 underline"
                  >
                    Read full article
                  </a>
                </>
              )}
            </p>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold text-slate-700 mb-2">What Happened:</h4>
            <p className="text-slate-600">{analysis.event_summary}</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
            <h4 className="font-semibold text-slate-700 mb-2">
              Psychology Connection:
            </h4>
            <p className="text-slate-600">{analysis.psychological_explanation}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnalysisDisplay;
