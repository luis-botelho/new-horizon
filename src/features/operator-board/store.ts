import { create } from 'zustand';

interface BoardFilters {
  uf: string | null;
  setUf: (uf: string | null) => void;
}

// Estado de cliente global e pequeno. Dados de servidor ficam no TanStack Query.
export const useBoardFilters = create<BoardFilters>()((set) => ({
  uf: null,
  setUf: (uf) => set({ uf }),
}));
