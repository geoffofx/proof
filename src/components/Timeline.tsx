import React from 'react';
import { AccomplishmentLog } from '../types';
import { format } from 'date-fns';
import { CheckCircle2, MoreVertical, Trash2, Edit2, AlertCircle } from 'lucide-react';

interface TimelineProps {
  logs: AccomplishmentLog[];
  onUpdate: (logId: string, text: string, mode: 'one' | 'future' | 'all') => void;
  onDelete: (logId: string) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ logs, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editText, setEditText] = React.useState('');
  const [showOptions, setShowOptions] = React.useState<string | null>(null);
  const [showSeriesConfirm, setShowSeriesConfirm] = React.useState<AccomplishmentLog | null>(null);

  if (logs.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
        <CheckCircle2 className="w-12 h-12 text-gray-200 mx-auto mb-4" />
        <p className="text-gray-400 font-medium">No accomplishments logged yet.</p>
        <p className="text-xs text-gray-300 mt-1">Every small step is proof of your value.</p>
      </div>
    );
  }

  const handleUpdate = (mode: 'one' | 'future' | 'all') => {
    if (showSeriesConfirm) {
      onUpdate(showSeriesConfirm.id, editText, mode);
      setShowSeriesConfirm(null);
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {logs.map((log) => (
        <div key={log.id} className="relative pl-8 pb-8 border-l-2 border-blue-50 last:border-0 last:pb-0">
          <div className="absolute -left-[9px] top-0 bg-white rounded-full p-0.5">
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
          </div>
          
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md group">
            {editingId === log.id ? (
              <div className="space-y-3">
                <textarea
                  autoFocus
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-3 text-sm text-gray-800 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (log.seriesId) {
                        setShowSeriesConfirm(log);
                      } else {
                        onUpdate(log.id, editText, 'one');
                        setEditingId(null);
                      }
                    }}
                    className="flex-1 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex-1 py-2 text-xs font-bold text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start gap-4">
                  <p className="text-gray-800 font-semibold leading-relaxed">{log.text}</p>
                  <div className="relative">
                    <button 
                      onClick={() => setShowOptions(showOptions === log.id ? null : log.id)}
                      className="p-1 text-gray-300 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {showOptions === log.id && (
                      <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-xl border border-gray-100 z-10 py-1 overflow-hidden animate-in fade-in zoom-in duration-100">
                        <button
                          onClick={() => {
                            setEditingId(log.id);
                            setEditText(log.text);
                            setShowOptions(null);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-blue-50 flex items-center gap-2"
                        >
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                        <button
                          onClick={() => {
                            onDelete(log.id);
                            setShowOptions(null);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                    {format(log.timestamp.toDate(), 'h:mm a • MMM d')}
                  </span>
                  {log.seriesId && (
                    <span className="text-[9px] font-black text-blue-400 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-widest">
                      Recurring
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      ))}

      {/* Series Edit Modal */}
      {showSeriesConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center animate-in zoom-in duration-200">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Edit Recurring Series</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              This log is part of a series. How would you like to apply your changes?
            </p>
            <div className="space-y-3">
              <button
                onClick={() => handleUpdate('one')}
                className="w-full py-3 text-sm font-bold text-gray-700 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Only this instance
              </button>
              <button
                onClick={() => handleUpdate('future')}
                className="w-full py-3 text-sm font-bold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
              >
                This and future instances
              </button>
              <button
                onClick={() => handleUpdate('all')}
                className="w-full py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
              >
                All instances in series
              </button>
              <button
                onClick={() => setShowSeriesConfirm(null)}
                className="w-full py-2 text-xs font-bold text-gray-400 hover:text-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
