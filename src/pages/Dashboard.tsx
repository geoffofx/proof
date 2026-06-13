import React, { useMemo } from 'react';
import { useAccomplishments } from '../hooks/useAccomplishments';
import { Timeline } from '../components/Timeline';
import { SmartAdd } from '../components/SmartAdd';
import { PulseReminders } from '../components/PulseReminders';
import { Calendar } from '../components/Calendar';
import { FrequencyChart } from '../components/FrequencyChart';
import { calculateProofFrequencies } from '../utils/statistics';
import { LogOut, Calendar as CalendarIcon, List, RefreshCw, BarChart2 } from 'lucide-react';
import { auth } from '../firebase';
import type { AccomplishmentTemplate, Frequency } from '../types';

export const Dashboard: React.FC = () => {
  const { logs, templates, loading, addLog, updateLog, deleteLog, addTemplate, getReminders } = useAccomplishments();
  const [activeView, setActiveView] = React.useState<'timeline' | 'calendar' | 'stats'>('timeline');

  const frequencies = useMemo(() => calculateProofFrequencies(logs), [logs]);

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

  const toggleView = () => {
    setActiveView(prev => prev === 'timeline' ? 'calendar' : prev === 'calendar' ? 'stats' : 'timeline');
  };

  const getViewIcon = () => {
    switch (activeView) {
      case 'timeline': return <CalendarIcon className="w-5 h-5" />;
      case 'calendar': return <BarChart2 className="w-5 h-5" />;
      case 'stats': return <List className="w-5 h-5" />;
    }
  };

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
              onClick={() => window.location.reload()}
              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button 
              onClick={toggleView}
              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all flex items-center gap-2"
            >
              {getViewIcon()}
              <span className="text-xs font-bold hidden sm:inline capitalize">{activeView}</span>
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
        ) : activeView === 'calendar' ? (
          <Calendar logs={logs} />
        ) : (
          <div className="mb-8">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">Frequency Stats</h2>
            <FrequencyChart frequencies={frequencies} />
          </div>
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
