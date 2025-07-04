import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { LectureTopic, AnalysisResult } from './types';
import { LECTURE_TOPICS } from './constants';
import { analyzeTopicInNews } from './services/geminiService';
import LectureTopicList from './components/LectureTopicList';
import AnalysisDisplay from './components/AnalysisDisplay';
import Introduction from './components/Introduction';
import { ApprenticeAvatarIcon, SparklesIcon } from './components/icons/Icons';

const App: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<LectureTopic | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectTopic = useCallback((topic: LectureTopic) => {
    if (isLoading) return;
    setSelectedTopic(topic);
    setAnalysisResult(null);
    setError(null);
  }, [isLoading]);
  
  useEffect(() => {
    if (!selectedTopic) return;

    const getAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await analyzeTopicInNews(selectedTopic);
        setAnalysisResult(result);
      } catch (e) {
        if (e instanceof Error) {
          setError(`Failed to get analysis. ${e.message}. Please ensure your API key is configured correctly.`);
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    getAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTopic]);

  return (
    <div className="min-h-screen bg-purple-50 text-slate-800">
      <header className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 shadow-lg sticky top-0 z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
                <div className="flex items-center space-x-4">
                  <ApprenticeAvatarIcon className="h-12 w-12 text-white" />
                  <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Prof. Hareli's</h1>
                    <p className="text-sm text-purple-100 font-light">Real World Apprentice</p>
                  </div>
                </div>
                <a href="https://gemini.google.com" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                  <SparklesIcon className="h-5 w-5 text-yellow-300"/>
                  <span className="font-semibold text-sm text-white">Powered by Gemini</span>
                </a>
            </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Introduction />

        <div className="lg:grid lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4 xl:col-span-3 mb-8 lg:mb-0">
            <div className="sticky top-28">
              <h2 className="text-xl font-bold text-slate-900 mb-4 px-3">Lecture Topics</h2>
              <LectureTopicList
                topics={LECTURE_TOPICS}
                selectedTopic={selectedTopic}
                onSelectTopic={handleSelectTopic}
                isLoading={isLoading}
              />
            </div>
          </div>

          <div className="lg:col-span-8 xl:col-span-9">
            <AnalysisDisplay
              selectedTopic={selectedTopic}
              result={analysisResult}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;