import { Timestamp } from '../firebase';

export type Frequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'none';

export interface AccomplishmentTemplate {
  id: string;
  userId: string;
  text: string;
  category: string;
  frequency: Frequency;
  lastLogged: Timestamp | null;
  createdAt: Timestamp;
}

export interface AccomplishmentLog {
  id: string;
  templateId: string | null;
  userId: string;
  text: string;
  timestamp: Timestamp;
  seriesId: string | null;
}
