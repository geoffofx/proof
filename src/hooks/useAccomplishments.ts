import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import type { AccomplishmentLog, AccomplishmentTemplate } from '../types';
import { addDays, addWeeks, addMonths, isBefore } from 'date-fns';
import { 
  subscribeToLogs, 
  subscribeToTemplates, 
  addAccomplishmentLog, 
  updateAccomplishmentLog, 
  deleteAccomplishmentLog, 
  addAccomplishmentTemplate 
} from '../firebase';

export function useAccomplishments() {
  const { user } = useAuthStore();
  const [logs, setLogs] = useState<AccomplishmentLog[]>([]);
  const [templates, setTemplates] = useState<AccomplishmentTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribeLogs = subscribeToLogs(user.uid, (logsData) => {
      setLogs(logsData);
    });

    const unsubscribeTemplates = subscribeToTemplates(user.uid, (templatesData) => {
      setTemplates(templatesData);
      setLoading(false);
    });

    return () => {
      unsubscribeLogs();
      unsubscribeTemplates();
    };
  }, [user]);

  const getReminders = () => {
    const now = new Date();
    return templates.filter(t => {
      if (t.frequency === 'none' || !t.lastLogged) return false;
      
      const lastDate = t.lastLogged.toDate();
      let nextDue: Date;

      switch (t.frequency) {
        case 'daily': nextDue = addDays(lastDate, 1); break;
        case 'weekly': nextDue = addWeeks(lastDate, 1); break;
        case 'monthly': nextDue = addMonths(lastDate, 1); break;
        case 'quarterly': nextDue = addMonths(lastDate, 3); break;
        case 'yearly': nextDue = addMonths(lastDate, 12); break;
        default: return false;
      }

      return isBefore(nextDue, now);
    });
  };

  const addLog = async (text: string, templateId: string | null = null, seriesId: string | null = null, notes: string = "") => {
    if (!user) return;
    await addAccomplishmentLog(user.uid, text, templateId, seriesId, notes);
  };

  const updateLog = async (logId: string, text: string, notes: string = "", mode: 'one' | 'future' | 'all' = 'one') => {
    if (!user) return;
    await updateAccomplishmentLog(user.uid, logId, text, notes, mode, logs);
  };

  const deleteLog = async (logId: string) => {
    await deleteAccomplishmentLog(logId);
  };

  const addTemplate = async (template: Omit<AccomplishmentTemplate, 'id' | 'userId' | 'createdAt' | 'lastLogged'>) => {
    if (!user) return;
    await addAccomplishmentTemplate(user.uid, template);
  };

  return { logs, templates, loading, addLog, updateLog, deleteLog, addTemplate, getReminders };
}

