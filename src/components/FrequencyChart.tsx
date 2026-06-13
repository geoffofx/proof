import React from 'react';
import { ProofFrequency, getMilestoneProgress } from '../utils/statistics';

interface FrequencyChartProps {
  frequencies: ProofFrequency[];
}

export const FrequencyChart: React.FC<FrequencyChartProps> = ({ frequencies }) => {
  return (
    <div className="space-y-6">
      {frequencies.map((item) => {
        const { current, prevMilestone, nextMilestone, progress } = getMilestoneProgress(item.count);
        
        return (
          <div key={item.text} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-800">{item.text}</span>
              <span className="text-sm font-bold text-blue-600">{current} logs</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{prevMilestone}</span>
              <span>Next: {nextMilestone}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
