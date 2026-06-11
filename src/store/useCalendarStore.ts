import { create } from 'zustand';

type ZoomLevel = 'weekly' | 'yearly';

interface CalendarState {
  zoomLevel: ZoomLevel;
  filterTemplateId: string | null;
  setZoomLevel: (zoom: ZoomLevel) => void;
  setFilterTemplateId: (id: string | null) => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  zoomLevel: 'weekly',
  filterTemplateId: null,
  setZoomLevel: (zoomLevel) => set({ zoomLevel }),
  setFilterTemplateId: (filterTemplateId) => set({ filterTemplateId }),
}));
