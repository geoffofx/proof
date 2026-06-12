import React, { useMemo, useRef } from 'react';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  subWeeks, 
  addWeeks, 
  isSameDay,
  isToday,
  startOfYear,
  eachMonthOfInterval,
  endOfYear
} from 'date-fns';
import type { AccomplishmentLog } from '../types';
import { useCalendarStore } from '../store/useCalendarStore';
import { Maximize2, Minimize2 } from 'lucide-react';

interface CalendarProps {
  logs: AccomplishmentLog[];
}

export const Calendar: React.FC<CalendarProps> = ({ logs }) => {
  const { zoomLevel, setZoomLevel, filterTemplateId } = useCalendarStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate weeks of data for the infinite scroll
  const weeks = useMemo(() => {
    const today = new Date();
    const start = startOfWeek(subWeeks(today, 26), { weekStartsOn: 1 }); // Show half a year of weeks
    const end = endOfWeek(addWeeks(today, 4), { weekStartsOn: 1 });
    
    const days = eachDayOfInterval({ start, end });
    const weekChunks: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weekChunks.push(days.slice(i, i + 7));
    }
    return weekChunks.reverse(); // Newest at top
  }, []);

  const years = useMemo(() => {
    const today = new Date();
    const yearsArr: Date[] = [];
    for (let i = 0; i < 5; i++) {
      yearsArr.push(subWeeks(today, i * 52));
    }
    return yearsArr;
  }, []);

  const getDayLogs = (day: Date) => {
    return logs.filter(log => {
      const logDate = log.timestamp.toDate();
      const matchesDay = isSameDay(logDate, day);
      const matchesFilter = !filterTemplateId || log.templateId === filterTemplateId;
      return matchesDay && matchesFilter;
    });
  };

  if (zoomLevel === 'yearly') {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Yearly Overview</h2>
          <button 
            onClick={() => setZoomLevel('weekly')}
            className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Minimize2 className="w-4 h-4" /> Weekly View
          </button>
        </div>
        
        {years.map(yearDate => (
          <div key={yearDate.getFullYear()} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-2xl font-black text-gray-200 mb-4">{yearDate.getFullYear()}</h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {eachMonthOfInterval({
                start: startOfYear(yearDate),
                end: endOfYear(yearDate)
              }).map(month => {
                const monthLogs = logs.filter(l => 
                  l.timestamp.toDate().getMonth() === month.getMonth() &&
                  l.timestamp.toDate().getFullYear() === month.getFullYear()
                );
                return (
                  <div key={month.getTime()} className="aspect-square rounded-xl bg-gray-50 flex flex-col items-center justify-center p-2 relative group hover:bg-blue-50 transition-colors">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{format(month, 'MMM')}</span>
                    <span className="text-lg font-black text-gray-300 group-hover:text-blue-200">{monthLogs.length}</span>
                    {monthLogs.length > 0 && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-800">Consistency Grid</h2>
        <button 
          onClick={() => setZoomLevel('yearly')}
          className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <Maximize2 className="w-4 h-4" /> Yearly View
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-bold text-gray-400 uppercase py-2">
            {d}
          </div>
        ))}
      </div>

      <div ref={scrollRef} className="space-y-1 h-[600px] overflow-y-auto pr-2 scrollbar-hide">
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-7 gap-1">
            {week.map((day, dayIdx) => {
              const dayLogs = getDayLogs(day);
              const intensity = Math.min(dayLogs.length, 4);
              const bgColors = [
                'bg-gray-50',
                'bg-blue-100',
                'bg-blue-300',
                'bg-blue-500',
                'bg-blue-700'
              ];

              return (
                <div
                  key={dayIdx}
                  className={`aspect-square rounded-lg flex items-center justify-center relative transition-all duration-300 group ${
                    isToday(day) ? 'ring-2 ring-blue-600 ring-offset-2' : ''
                  } ${bgColors[intensity]}`}
                >
                  <span className={`text-[10px] font-bold ${intensity > 2 ? 'text-white' : 'text-gray-300'}`}>
                    {day.getDate()}
                  </span>
                  
                  {dayLogs.length > 0 && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/80 rounded-lg z-10 flex items-center justify-center transition-opacity cursor-help">
                      <span className="text-white text-[10px] font-bold">{dayLogs.length} wins</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
