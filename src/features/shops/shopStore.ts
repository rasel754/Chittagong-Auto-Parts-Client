import { create } from 'zustand';
import { Shop } from '@/types';

interface ShopState {
  shops: Shop[];
  activeShopId: string | null; // null represents Common Dashboard (All shops)
  isCreateModalOpen: boolean;
  setShops: (shops: Shop[]) => void;
  setActiveShopId: (shopId: string | null) => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;
}

export const useShopStore = create<ShopState>((set) => ({
  shops: [],
  activeShopId: null,
  isCreateModalOpen: false,
  setShops: (shops) => set({ shops }),
  setActiveShopId: (activeShopId) => set({ activeShopId }),
  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),
}));
