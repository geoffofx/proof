import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc,
  doc,
  deleteDoc,
  writeBatch,
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuthStore } from '../store/useAuthStore';
import { AccomplishmentLog, AccomplishmentTemplate, Frequency } from '../types';
import { addDays, addWeeks, addMonths, isBefore, subDays } from 'date-fns';

export function useAccomplishments() {
  const { user } = useAuthStore();
  const [logs, setLogs] = useState<AccomplishmentLog[]>([]);
  const [templates, setTemplates] = useState<AccomplishmentTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const logsQuery = query(
      collection(db, 'accomplishment_logs'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const templatesQuery = query(
      collection(db, 'accomplishment_templates'),
      where('userId', '==', user.uid)
    );

    const unsubscribeLogs = onSnapshot(logsQuery, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AccomplishmentLog[];
      setLogs(logsData);
    });

    const unsubscribeTemplates = onSnapshot(templatesQuery, (snapshot) => {
      const templatesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AccomplishmentTemplate[];
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

  const addLog = async (text: string, templateId: string | null = null, seriesId: string | null = null) => {
    if (!user) return;

    const newLog = {
      userId: user.uid,
      text,
      templateId,
      timestamp: Timestamp.now(),
      seriesId: seriesId || (templateId ? `series_${Date.now()}` : null)
    };

    await addDoc(collection(db, 'accomplishment_logs'), newLog);

    if (templateId) {
      const templateRef = doc(db, 'accomplishment_templates', templateId);
      await updateDoc(templateRef, {
        lastLogged: Timestamp.now()
      });
    }
  };

  const updateLog = async (logId: string, text: string, mode: 'one' | 'future' | 'all' = 'one') => {
    if (!user) return;

    const log = logs.find(l => l.id === logId);
    if (!log) return;

    if (mode === 'one' || !log.seriesId) {
      await updateDoc(doc(db, 'accomplishment_logs', logId), { text });
    } else if (mode === 'all') {
      const batch = writeBatch(db);
      const seriesLogs = logs.filter(l => l.seriesId === log.seriesId);
      seriesLogs.forEach(l => {
        batch.update(doc(db, 'accomplishment_logs', l.id), { text });
      });
      if (log.templateId) {
        batch.update(doc(db, 'accomplishment_templates', log.templateId), { text });
      }
      await batch.commit();
    } else if (mode === 'future') {
      const batch = writeBatch(db);
      const futureLogs = logs.filter(l => 
        l.seriesId === log.seriesId && 
        l.timestamp.toMillis() >= log.timestamp.toMillis()
      );
      futureLogs.forEach(l => {
        batch.update(doc(db, 'accomplishment_logs', l.id), { text });
      });
      // For 'future', we'd ideally split the series, but for simplicity here we update the template
      if (log.templateId) {
        batch.update(doc(db, 'accomplishment_templates', log.templateId), { text });
      }
      await batch.commit();
    }
  };

  const deleteLog = async (logId: string) => {
    await deleteDoc(doc(db, 'accomplishment_logs', logId));
  };

  const addTemplate = async (template: Omit<AccomplishmentTemplate, 'id' | 'userId' | 'createdAt' | 'lastLogged'>) => {
    if (!user) return;

    await addDoc(collection(db, 'accomplishment_templates'), {
      ...template,
      userId: user.uid,
      createdAt: serverTimestamp(),
      lastLogged: null
    });
  };

  return { logs, templates, loading, addLog, updateLog, deleteLog, addTemplate, getReminders };
}
