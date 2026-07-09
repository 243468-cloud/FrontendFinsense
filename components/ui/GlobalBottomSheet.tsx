'use client';
import { useUIStore } from '@/store/uiStore';
import { BottomSheet } from './BottomSheet';

export function GlobalBottomSheet() {
  const { bottomSheetOpen, closeBottomSheet, bottomSheetContent } = useUIStore();

  return (
    <BottomSheet
      open={bottomSheetOpen}
      onClose={closeBottomSheet}
    >
      {bottomSheetContent}
    </BottomSheet>
  );
}
