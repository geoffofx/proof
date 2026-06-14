import type { AccomplishmentLog } from '../types';

export const MILESTONES = [10, 25, 50, 100, 150, 200, 250, 300, 400, 500, 600, 700, 800, 900, 1000];

export interface ProofFrequency {
  text: string;
  count: number;
}

export const calculateProofFrequencies = (logs: AccomplishmentLog[]): ProofFrequency[] => {
  const counts: Record<string, number> = {};
  logs.forEach((log) => {
    counts[log.text] = (counts[log.text] || 0) + 1;
  });

  return Object.entries(counts)
    .filter(([, count]) => count > 1)
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count);
};

export const getMilestoneProgress = (count: number) => {
  let prevMilestone = 0;
  let nextMilestone = MILESTONES[0];

  for (let i = 0; i < MILESTONES.length; i++) {
    if (count < MILESTONES[i]) {
      nextMilestone = MILESTONES[i];
      prevMilestone = i === 0 ? 0 : MILESTONES[i - 1];
      break;
    }
  }

  const progress = ((count - prevMilestone) / (nextMilestone - prevMilestone)) * 100;
  
  return {
    current: count,
    prevMilestone,
    nextMilestone,
    progress: Math.min(progress, 100),
  };
};
