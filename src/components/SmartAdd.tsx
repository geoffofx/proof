import React, { useState } from 'react';
import { Plus, X, Search } from 'lucide-react';
import type { AccomplishmentTemplate } from '../types';

interface SmartAddProps {
  templates: AccomplishmentTemplate[];
  onAdd: (text: string, templateId?: string) => void;
  onCreateTemplate: (text: string, frequency: string) => void;
}

export const SmartAdd: React.FC<SmartAddProps> = ({ templates, onAdd, onCreateTemplate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const [isTemplateMode, setIsTemplateMode] = useState(false);
  const [frequency, setFrequency] = useState('none');

  const filteredTemplates = templates.filter(t => 
    t.text.toLowerCase().includes(text.toLowerCase())
  ).slice(0, 5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (isTemplateMode) {
      onCreateTemplate(text, frequency);
    } else {
      onAdd(text);
    }

    reset();
  };

  const reset = () => {
    setText('');
    setIsOpen(false);
    setIsTemplateMode(false);
    setFrequency('none');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all z-50 active:scale-95"
      >
        <Plus className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            {isTemplateMode ? 'New Recurring Habit' : 'What did you do today?'}
          </h2>
          <button onClick={reset} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="relative">
            <textarea
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="I helped my son with his homework..."
              className="w-full min-h-[100px] p-3 text-gray-800 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all"
            />
          </div>

          {!isTemplateMode && text.length > 0 && filteredTemplates.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold ml-1">Suggestions</p>
              {filteredTemplates.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    onAdd(t.text, t.id);
                    reset();
                  }}
                  className="w-full text-left p-2 hover:bg-blue-50 rounded-lg text-sm text-gray-700 flex items-center gap-2 group transition-colors"
                >
                  <Search className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500" />
                  {t.text}
                </button>
              ))}
            </div>
          )}

          {isTemplateMode && (
            <div className="mt-4">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Frequency</label>
              <div className="grid grid-cols-3 gap-2">
                {['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'none'].map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFrequency(f)}
                    className={`p-2 text-xs rounded-lg border transition-all ${
                      frequency === f 
                        ? 'bg-blue-600 border-blue-600 text-white font-semibold' 
                        : 'border-gray-200 text-gray-600 hover:border-blue-300'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setIsTemplateMode(!isTemplateMode)}
              className="flex-1 py-3 text-sm font-medium text-blue-600 border border-blue-100 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
            >
              {isTemplateMode ? 'One-off Entry' : 'Make Recurring'}
            </button>
            <button
              type="submit"
              disabled={!text.trim()}
              className="flex-[2] py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
            >
              {isTemplateMode ? 'Create Habit' : 'Log Proof'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
