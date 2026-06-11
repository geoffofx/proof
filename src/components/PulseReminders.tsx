import React from 'react';
import { AccomplishmentTemplate } from '../types';
import { Activity, ArrowRight } from 'lucide-react';

interface PulseRemindersProps {
  reminders: AccomplishmentTemplate[];
  onLog: (template: AccomplishmentTemplate) => void;
}

export const PulseReminders: React.FC<PulseRemindersProps> = ({ reminders, onLog }) => {
  if (reminders.length === 0) return null;

  return (
    <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-2 mb-4 ml-1">
        <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Pulse Reminders</h2>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        {reminders.map((template) => (
          <button
            key={template.id}
            onClick={() => onLog(template)}
            className="flex-shrink-0 w-64 bg-white p-5 rounded-2xl shadow-sm border border-blue-50 hover:border-blue-200 hover:shadow-md transition-all text-left group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity className="w-12 h-12 text-blue-600" />
            </div>
            
            <p className="text-gray-800 font-semibold mb-3 line-clamp-2 leading-snug">
              {template.text}
            </p>
            
            <div className="flex items-center justify-between mt-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 bg-blue-50 px-2 py-1 rounded-md">
                {template.frequency}
              </span>
              <span className="text-xs font-medium text-gray-400 group-hover:text-blue-600 flex items-center gap-1 transition-colors">
                Log Now <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
