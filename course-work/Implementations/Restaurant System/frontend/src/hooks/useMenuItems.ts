import { useContext } from 'react';
import { MenuItemContext } from '../contexts/MenuItemContext';

export const useMenuItems = () => {
  const context = useContext(MenuItemContext);
  if (context === undefined) {
    throw new Error('useMenuItems must be used within a MenuItemProvider');
  }
  return context;
};