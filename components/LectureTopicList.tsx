import React from 'react';
import { LectureTopic } from '../types';

interface LectureTopicListProps {
  topics: LectureTopic[];
  selectedTopic: LectureTopic | null;
  onSelectTopic: (topic: LectureTopic) => void;
  isLoading: boolean;
}

const LectureTopicList: React.FC<LectureTopicListProps> = ({
  topics,
  selectedTopic,
  onSelectTopic,
  isLoading,
}) => {
  return (
    <div className="space-y-2">
      {topics.map((topic) => (
        <button
          key={topic.id}
          onClick={() => onSelectTopic(topic)}
          disabled={isLoading}
          className={`w-full text-left p-4 rounded-lg transition-all ${
            selectedTopic?.id === topic.id
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
              : 'bg-white text-slate-700 hover:bg-purple-50 hover:shadow-md'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="font-semibold text-sm mb-1">
            Week {topic.weekLabel || topic.week}
          </div>
          <div className="font-medium text-base">{topic.title}</div>
        </button>
      ))}
    </div>
  );
};

export default LectureTopicList;
