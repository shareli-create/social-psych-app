import React from 'react';
import { LectureTopic } from '../types';

interface LectureTopicListProps {
  topics: LectureTopic[];
  selectedTopic: LectureTopic | null;
  onSelectTopic: (topic: LectureTopic) => void;
  isLoading: boolean;
}

const LectureTopicList: React.FC<LectureTopicListProps> = ({ topics, selectedTopic, onSelectTopic, isLoading }) => {
  return (
    <nav className="space-y-1" aria-label="Lecture Topics">
      {topics.map((topic) => {
        const isSelected = selectedTopic?.id === topic.id;
        return (
          <button
            key={topic.id}
            onClick={() => onSelectTopic(topic)}
            disabled={isLoading}
            className={`w-full text-left flex items-start rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 ease-in-out transform hover:scale-105 ${
              isSelected
                ? 'bg-orange-500 text-white shadow-lg'
                : 'text-slate-600 hover:bg-orange-100/80 hover:shadow-md'
            } ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <span className={`font-bold text-xs flex-shrink-0 flex items-center justify-center mr-3 ${isSelected ? 'text-orange-100' : 'text-orange-400'}`}>Wk {topic.weekLabel || topic.week}</span>
            <span className="flex-grow">{topic.title}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default LectureTopicList;