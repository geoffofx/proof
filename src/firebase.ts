import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged
} from "firebase/auth";
import type { Auth, User as FirebaseUser } from "firebase/auth";
import { 
  getFirestore, 
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
  Timestamp as FirebaseTimestamp, 
  serverTimestamp as firebaseServerTimestamp
} from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
import type { AccomplishmentLog, AccomplishmentTemplate } from "./types";

export interface ProofUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export type AuthUser = FirebaseUser | ProofUser;

interface StoredLog {
  id: string;
  templateId: string | null;
  userId: string;
  text: string;
  timestamp: { seconds: number; nanoseconds: number };
  seriesId: string | null;
}

interface StoredTemplate {
  id: string;
  userId: string;
  text: string;
  category: string;
  frequency: string;
  lastLogged: { seconds: number; nanoseconds: number } | null;
  createdAt: { seconds: number; nanoseconds: number };
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const isFirebaseConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "your_api_key" &&
  firebaseConfig.apiKey.trim() !== "" &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== "your_project_id" &&
  firebaseConfig.projectId.trim() !== ""
);

let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
  }
} else {
  console.warn(
    "Firebase environment variables are not configured in .env.local (or contain placeholders).\n" +
    "Running in Local Demo Mode using LocalStorage. To connect to Firebase, please define:\n" +
    "- VITE_FIREBASE_API_KEY\n" +
    "- VITE_FIREBASE_PROJECT_ID\n" +
    "in your .env.local file in the project root."
  );
}

// -------------------------------------------------------------
// Timestamp Handling
// -------------------------------------------------------------
export class LocalTimestamp {
  seconds: number;
  nanoseconds: number;

  constructor(seconds: number, nanoseconds: number) {
    this.seconds = seconds;
    this.nanoseconds = nanoseconds;
  }

  static now() {
    const ms = Date.now();
    return new LocalTimestamp(Math.floor(ms / 1000), (ms % 1000) * 1e6);
  }

  static fromDate(date: Date) {
    const ms = date.getTime();
    return new LocalTimestamp(Math.floor(ms / 1000), (ms % 1000) * 1e6);
  }

  toDate() {
    return new Date(this.seconds * 1000 + this.nanoseconds / 1e6);
  }

  toMillis() {
    return this.seconds * 1000 + this.nanoseconds / 1e6;
  }
}

export type Timestamp = FirebaseTimestamp | LocalTimestamp;
export const Timestamp = (isFirebaseConfigured ? FirebaseTimestamp : LocalTimestamp) as unknown as {
  now(): Timestamp;
  fromDate(date: Date): Timestamp;
};

// -------------------------------------------------------------
// Authentication Wrappers
// -------------------------------------------------------------
type AuthListener = (user: AuthUser | null) => void;
const authListeners = new Set<AuthListener>();

const getLocalUser = (): ProofUser | null => {
  const user = localStorage.getItem('proof_local_user');
  return user ? JSON.parse(user) as ProofUser : null;
};

const notifyAuthListeners = (user: AuthUser | null) => {
  authListeners.forEach(l => l(user));
};

export const onAuthChange = (callback: AuthListener) => {
  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, callback);
  } else {
    authListeners.add(callback);
    // Trigger immediately with current mock user status
    callback(getLocalUser());
    return () => {
      authListeners.delete(callback);
    };
  }
};

export const signInWithGoogle = async () => {
  if (isFirebaseConfigured && auth && googleProvider) {
    return signInWithPopup(auth, googleProvider);
  } else {
    const mockUser: ProofUser = {
      uid: 'local-explorer-uid',
      displayName: 'Local Explorer',
      email: 'local.explorer@example.com',
      photoURL: 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg'
    };
    localStorage.setItem('proof_local_user', JSON.stringify(mockUser));
    notifyAuthListeners(mockUser);
    return { user: mockUser };
  }
};

export const signOutUser = async () => {
  if (isFirebaseConfigured && auth) {
    return signOut(auth);
  } else {
    localStorage.removeItem('proof_local_user');
    notifyAuthListeners(null);
  }
};

// -------------------------------------------------------------
// Database Event Subscription & Mutator Wrappers
// -------------------------------------------------------------
type DBListener = () => void;
const dbListeners = new Set<DBListener>();
const notifyDBListeners = () => dbListeners.forEach(l => l());

const subscribeLocalDB = (listener: DBListener) => {
  dbListeners.add(listener);
  return () => {
    dbListeners.delete(listener);
  };
};

export const subscribeToLogs = (userId: string, callback: (logs: AccomplishmentLog[]) => void) => {
  if (isFirebaseConfigured && db) {
    const q = query(
      collection(db, 'accomplishment_logs'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AccomplishmentLog[];
      callback(logs);
    });
  } else {
    const loadAndFilterLogs = () => {
      const rawLogs = localStorage.getItem('proof_local_logs');
      const logsList = rawLogs ? (JSON.parse(rawLogs) as StoredLog[]) : [];
      const mappedLogs = logsList.map((log) => ({
        ...log,
        timestamp: new LocalTimestamp(log.timestamp.seconds, log.timestamp.nanoseconds)
      })) as unknown as AccomplishmentLog[];
      mappedLogs.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());
      callback(mappedLogs);
    };

    loadAndFilterLogs();
    return subscribeLocalDB(loadAndFilterLogs);
  }
};

export const subscribeToTemplates = (userId: string, callback: (templates: AccomplishmentTemplate[]) => void) => {
  if (isFirebaseConfigured && db) {
    const q = query(
      collection(db, 'accomplishment_templates'),
      where('userId', '==', userId)
    );
    return onSnapshot(q, (snapshot) => {
      const templates = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AccomplishmentTemplate[];
      callback(templates);
    });
  } else {
    const loadAndFilterTemplates = () => {
      const rawTemplates = localStorage.getItem('proof_local_templates');
      const templatesList = rawTemplates ? (JSON.parse(rawTemplates) as StoredTemplate[]) : [];
      const mappedTemplates = templatesList.map((template) => ({
        ...template,
        createdAt: new LocalTimestamp(template.createdAt.seconds, template.createdAt.nanoseconds),
        lastLogged: template.lastLogged 
          ? new LocalTimestamp(template.lastLogged.seconds, template.lastLogged.nanoseconds) 
          : null
      })) as unknown as AccomplishmentTemplate[];
      callback(mappedTemplates);
    };

    loadAndFilterTemplates();
    return subscribeLocalDB(loadAndFilterTemplates);
  }
};

export const addAccomplishmentLog = async (
  userId: string,
  text: string,
  templateId: string | null = null,
  seriesId: string | null = null
) => {
  if (isFirebaseConfigured && db) {
    const newLog = {
      userId,
      text,
      templateId,
      timestamp: FirebaseTimestamp.now(),
      seriesId: seriesId || (templateId ? `series_${Date.now()}` : null)
    };

    await addDoc(collection(db, 'accomplishment_logs'), newLog);

    if (templateId) {
      const templateRef = doc(db, 'accomplishment_templates', templateId);
      await updateDoc(templateRef, {
        lastLogged: FirebaseTimestamp.now()
      });
    }
  } else {
    const rawLogs = localStorage.getItem('proof_local_logs');
    const logsList = rawLogs ? (JSON.parse(rawLogs) as StoredLog[]) : [];

    const now = LocalTimestamp.now();
    const newLog: StoredLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      text,
      templateId,
      timestamp: { seconds: now.seconds, nanoseconds: now.nanoseconds },
      seriesId: seriesId || (templateId ? `series_${Date.now()}` : null)
    };

    logsList.push(newLog);
    localStorage.setItem('proof_local_logs', JSON.stringify(logsList));

    if (templateId) {
      const rawTemplates = localStorage.getItem('proof_local_templates');
      const templatesList = rawTemplates ? (JSON.parse(rawTemplates) as StoredTemplate[]) : [];
      const templateIndex = templatesList.findIndex((t) => t.id === templateId);
      if (templateIndex !== -1) {
        templatesList[templateIndex].lastLogged = { seconds: now.seconds, nanoseconds: now.nanoseconds };
        localStorage.setItem('proof_local_templates', JSON.stringify(templatesList));
      }
    }

    notifyDBListeners();
  }
};

export const updateAccomplishmentLog = async (
  userId: string,
  logId: string,
  text: string,
  mode: 'one' | 'all' | 'future' = 'one',
  logs: AccomplishmentLog[] = []
) => {
  if (isFirebaseConfigured && db) {
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
      if (log.templateId) {
        batch.update(doc(db, 'accomplishment_templates', log.templateId), { text });
      }
      await batch.commit();
    }
  } else {
    const rawLogs = localStorage.getItem('proof_local_logs');
    if (!rawLogs) return;
    const logsList = JSON.parse(rawLogs) as StoredLog[];

    const log = logsList.find((l) => l.id === logId);
    if (!log) return;

    if (mode === 'one' || !log.seriesId) {
      const index = logsList.findIndex((l) => l.id === logId);
      if (index !== -1) {
        logsList[index].text = text;
      }
    } else if (mode === 'all') {
      logsList.forEach((l) => {
        if (l.seriesId === log.seriesId) {
          l.text = text;
        }
      });
      if (log.templateId) {
        const rawTemplates = localStorage.getItem('proof_local_templates');
        const templatesList = rawTemplates ? (JSON.parse(rawTemplates) as StoredTemplate[]) : [];
        const templateIndex = templatesList.findIndex((t) => t.id === log.templateId);
        if (templateIndex !== -1) {
          templatesList[templateIndex].text = text;
          localStorage.setItem('proof_local_templates', JSON.stringify(templatesList));
        }
      }
    } else if (mode === 'future') {
      const getMillis = (ts: { seconds: number; nanoseconds: number }) => ts.seconds * 1000 + ts.nanoseconds / 1e6;
      const logMillis = getMillis(log.timestamp);

      logsList.forEach((l) => {
        if (l.seriesId === log.seriesId && getMillis(l.timestamp) >= logMillis) {
          l.text = text;
        }
      });
      if (log.templateId) {
        const rawTemplates = localStorage.getItem('proof_local_templates');
        const templatesList = rawTemplates ? (JSON.parse(rawTemplates) as StoredTemplate[]) : [];
        const templateIndex = templatesList.findIndex((t) => t.id === log.templateId);
        if (templateIndex !== -1) {
          templatesList[templateIndex].text = text;
          localStorage.setItem('proof_local_templates', JSON.stringify(templatesList));
        }
      }
    }

    localStorage.setItem('proof_local_logs', JSON.stringify(logsList));
    notifyDBListeners();
  }
};

export const deleteAccomplishmentLog = async (logId: string) => {
  if (isFirebaseConfigured && db) {
    await deleteDoc(doc(db, 'accomplishment_logs', logId));
  } else {
    const rawLogs = localStorage.getItem('proof_local_logs');
    if (!rawLogs) return;
    let logsList = JSON.parse(rawLogs) as StoredLog[];
    logsList = logsList.filter((l) => l.id !== logId);
    localStorage.setItem('proof_local_logs', JSON.stringify(logsList));
    notifyDBListeners();
  }
};

export const addAccomplishmentTemplate = async (
  userId: string,
  template: { text: string; category: string; frequency: string }
) => {
  if (isFirebaseConfigured && db) {
    await addDoc(collection(db, 'accomplishment_templates'), {
      ...template,
      userId,
      createdAt: firebaseServerTimestamp(),
      lastLogged: null
    });
  } else {
    const rawTemplates = localStorage.getItem('proof_local_templates');
    const templatesList = rawTemplates ? (JSON.parse(rawTemplates) as StoredTemplate[]) : [];

    const now = LocalTimestamp.now();
    const newTemplate: StoredTemplate = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...template,
      userId,
      createdAt: { seconds: now.seconds, nanoseconds: now.nanoseconds },
      lastLogged: null
    };

    templatesList.push(newTemplate);
    localStorage.setItem('proof_local_templates', JSON.stringify(templatesList));
    notifyDBListeners();
  }
};

