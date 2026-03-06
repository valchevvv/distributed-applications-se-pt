import api from './api';
import { MenuItem, MenuItemSearchParams } from '../types/menu-item.types';

export class MenuItemService {
  static async getAll(params: { pageNumber?: number; pageSize?: number } = {}): Promise<{
    data: MenuItem[];
    totalCount: number;
    totalPages: number;
  }> {
    const response = await api.get('/MenuItems', { params });
    return {
      data: response.data,
      totalCount: parseInt(response.headers['x-total-count'] || '0'),
      totalPages: parseInt(response.headers['x-total-pages'] || '0')
    };
  }

  static async search(params: MenuItemSearchParams): Promise<MenuItem[]> {
    const response = await api.get('/MenuItems/search', { params });
    return response.data;
  }

  static async getById(id: number): Promise<MenuItem> {
    const response = await api.get(`/MenuItems/${id}`);
    return response.data;
  }

  static async getByCategory(categoryId: number): Promise<MenuItem[]> {
    const response = await api.get(`/MenuItems/category/${categoryId}`);
    return response.data;
  }

  static async create(menuItem: Partial<MenuItem>): Promise<MenuItem> {
    const payload: Partial<MenuItem> = {
      ...menuItem,
      orderDetails: menuItem.orderDetails ?? [],
    };
    const response = await api.post('/MenuItems', payload);
    return response.data;
  }

  static async update(id: number, menuItem: Partial<MenuItem>): Promise<void> {
    await api.put(`/MenuItems/${id}`, menuItem);
  }

  static async toggleAvailability(id: number): Promise<{ isAvailable: boolean }> {
    const response = await api.patch(`/MenuItems/${id}/toggle-availability`);
    return response.data;
  }

  static async delete(id: number): Promise<void> {
    await api.delete(`/MenuItems/${id}`);
  }
}