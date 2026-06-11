import React from 'react';
import { useAccomplishments } from '../hooks/useAccomplishments';
import { Timeline } from '../components/Timeline';
import { SmartAdd } from '../components/SmartAdd';
import { PulseReminders } from '../components/PulseReminders';
import { Calendar } from '../components/Calendar';
import { LogOut, Calendar as CalendarIcon, List } from 'lucide-react';
import { auth } from '../firebase';
import type { AccomplishmentTemplate, Frequency } from '../types';

export const Dashboard: React.FC = () => {
  const { logs, templates, loading, addLog, updateLog, deleteLog, addTemplate, getReminders } = useAccomplishments();
  const [activeView, setActiveView] = React.useState<'timeline' | 'calendar'>('timeline');

  const handleAddLog = (text: string, templateId?: string) => {
    addLog(text, templateId);
  };

  const handleCreateTemplate = (text: string, frequency: string) => {
    addTemplate({
      text,
      frequency: frequency as Frequency,
      category: 'General'
    });
  };

  const handleLogReminder = (template: AccomplishmentTemplate) => {
    addLog(template.text, template.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const reminders = getReminders();

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Proof
          </h1>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveView(activeView === 'timeline' ? 'calendar' : 'timeline')}
              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all flex items-center gap-2"
            >
              {activeView === 'timeline' ? (
                <>
                  <CalendarIcon className="w-5 h-5" />
                  <span className="text-xs font-bold hidden sm:inline">Calendar</span>
                </>
              ) : (
                <>
                  <List className="w-5 h-5" />
                  <span className="text-xs font-bold hidden sm:inline">Timeline</span>
                </>
              )}
            </button>
            <button 
              onClick={() => auth.signOut()}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {activeView === 'timeline' ? (
          <>
            <PulseReminders reminders={reminders} onLog={handleLogReminder} />
            <div className="mb-8">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">Timeline of Triumph</h2>
              <Timeline 
                logs={logs} 
                onUpdate={updateLog} 
                onDelete={deleteLog} 
              />
            </div>
          </>
        ) : (
          <Calendar logs={logs} />
        )}
      </main>

      <SmartAdd 
        templates={templates} 
        onAdd={handleAddLog} 
        onCreateTemplate={handleCreateTemplate} 
      />
    </div>
  );
};
