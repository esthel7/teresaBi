import { ReactNode } from 'react';
import { create } from 'zustand';

interface ModalType {
  callerId: string;
  setCallerId: (callerId: string) => void;
  modal: ReactNode;
  setModal: (modal: ReactNode) => void;
}

export const useModalStore = create<ModalType>(set => ({
  callerId: '',
  setCallerId: callerId => set({ callerId }),
  modal: null,
  setModal: modal => set({ modal })
}));
