import React, { createContext, useState, ReactNode } from 'react';
import { MenuItem, MenuItemSearchParams } from '../types/menu-item.types';
import { MenuItemService } from '../services/menu-item.service';
import toast from 'react-hot-toast';

interface MenuItemContextType {
  menuItems: MenuItem[];
  loading: boolean;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  fetchMenuItems: (page?: number, pageSize?: number) => Promise<void>;
  searchMenuItems: (params: MenuItemSearchParams) => Promise<void>;
  getMenuItem: (id: number) => Promise<MenuItem | null>;
  getByCategory: (categoryId: number) => Promise<MenuItem[]>;
  createMenuItem: (menuItem: Partial<MenuItem>) => Promise<MenuItem | null>;
  updateMenuItem: (id: number, menuItem: Partial<MenuItem>) => Promise<boolean>;
  toggleAvailability: (id: number) => Promise<boolean>;
  deleteMenuItem: (id: number) => Promise<boolean>;
}

const MenuItemContext = createContext<MenuItemContextType | undefined>(undefined);

export const MenuItemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const fetchMenuItems = async (page: number = 1, pageSize: number = 10) => {
    try {
      setLoading(true);
      const response = await MenuItemService.getAll({ pageNumber: page, pageSize });
      setMenuItems(response.data);
      setTotalCount(response.totalCount);
      setTotalPages(response.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch menu items', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const searchMenuItems = async (params: MenuItemSearchParams) => {
    try {
      setLoading(true);
      const data = await MenuItemService.search(params);
      setMenuItems(data);
      setTotalCount(data.length);
      setTotalPages(1);
      setCurrentPage(1);
    } catch (error) {
      console.error('Failed to search menu items', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const getMenuItem = async (id: number): Promise<MenuItem | null> => {
    try {
      setLoading(true);
      return await MenuItemService.getById(id);
    } catch (error) {
      console.error('Failed to fetch menu item', error);
      toast.error('Failed to load menu item details');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getByCategory = async (categoryId: number): Promise<MenuItem[]> => {
    try {
      setLoading(true);
      return await MenuItemService.getByCategory(categoryId);
    } catch (error) {
      console.error('Failed to fetch menu items by category', error);
      toast.error('Failed to load menu items');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createMenuItem = async (menuItem: Partial<MenuItem>): Promise<MenuItem | null> => {
    try {
      setLoading(true);
      const payload: Partial<MenuItem> = { ...menuItem, orderDetails: menuItem.orderDetails || [] };



      const newItem = await MenuItemService.create(payload);
      toast.success('Menu item created successfully');
      await fetchMenuItems(currentPage);
      return newItem;
    } catch (error: any) {
      toast.error(error.response?.data || 'Failed to create menu item');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateMenuItem = async (id: number, menuItem: Partial<MenuItem>): Promise<boolean> => {
    try {
      setLoading(true);
      await MenuItemService.update(id, menuItem);
      toast.success('Menu item updated successfully');
      await fetchMenuItems(currentPage);
      return true;
    } catch (error: any) {
      toast.error(error.response?.data || 'Failed to update menu item');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      const result = await MenuItemService.toggleAvailability(id);
      toast.success(`Availability changed to ${result.isAvailable ? 'available' : 'unavailable'}`);
      await fetchMenuItems(currentPage);
      return true;
    } catch (error) {
      console.error('Failed to toggle availability', error);
      toast.error('Failed to change availability');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteMenuItem = async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      await MenuItemService.delete(id);
      toast.success('Menu item deleted successfully');
      await fetchMenuItems(currentPage);
      return true;
    } catch (error: any) {
      toast.error(error.response?.data || 'Failed to delete menu item');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <MenuItemContext.Provider
      value={{
        menuItems,
        loading,
        totalCount,
        totalPages,
        currentPage,
        fetchMenuItems,
        searchMenuItems,
        getMenuItem,
        getByCategory,
        createMenuItem,
        updateMenuItem,
        toggleAvailability,
        deleteMenuItem,
      }}
    >
      {children}
    </MenuItemContext.Provider>
  );
};

export { MenuItemContext };