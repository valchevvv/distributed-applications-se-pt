import api from './api';
import { RestaurantTable, TableSearchParams, AvailableTablesParams } from '../types/table.types';

export class TableService {
  static async getAll(params: { pageNumber?: number; pageSize?: number } = {}): Promise<{
    data: RestaurantTable[];
    totalCount: number;
    totalPages: number;
  }> {
    const response = await api.get('/RestaurantTables', { params });
    return {
      data: response.data,
      totalCount: parseInt(response.headers['x-total-count'] || '0'),
      totalPages: parseInt(response.headers['x-total-pages'] || '0')
    };
  }

  static async search(params: TableSearchParams): Promise<RestaurantTable[]> {
    const response = await api.get('/RestaurantTables/search', { params });
    return response.data;
  }

  static async getAvailable(params: AvailableTablesParams): Promise<RestaurantTable[]> {
    const response = await api.get('/RestaurantTables/available', { params });
    return response.data;
  }

  static async getById(id: number): Promise<RestaurantTable> {
    const response = await api.get(`/RestaurantTables/${id}`);
    return response.data;
  }

  static async create(table: Partial<RestaurantTable>): Promise<RestaurantTable> {
    const response = await api.post('/RestaurantTables', table);
    return response.data;
  }

  static async update(id: number, table: Partial<RestaurantTable>): Promise<void> {
    await api.put(`/RestaurantTables/${id}`, table);
  }

  static async toggleAvailability(id: number): Promise<{ isAvailable: boolean }> {
    const response = await api.patch(`/RestaurantTables/${id}/toggle-availability`);
    return response.data;
  }

  static async markAsCleaned(id: number): Promise<{ lastCleaned: string }> {
    const response = await api.patch(`/RestaurantTables/${id}/clean`);
    return response.data;
  }

  static async delete(id: number): Promise<void> {
    await api.delete(`/RestaurantTables/${id}`);
  }
}