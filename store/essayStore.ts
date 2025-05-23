import { create } from 'zustand';

export interface Essay {
  id?: string;
  subject: string;
  readingLevel: string;
  content: string;
  isFavorite?: boolean;
}

interface EssayState {
  currentEssay: Essay | null;
  setCurrentEssay: (essay: Essay | null) => void;
  isReadTabVisible: boolean;
  setReadTabVisible: (visible: boolean) => void;
}

export const useEssayStore = create<EssayState>((set) => ({
  currentEssay: null,
  setCurrentEssay: (essay) => set({ currentEssay: essay }),
  isReadTabVisible: false,
  setReadTabVisible: (visible) => set({ isReadTabVisible: visible }),
})); 