import api from './api';
import { Category, CategorySearchParams } from '../types/category.types';

export class CategoryService {
  static async getAll(params: CategorySearchParams = {}): Promise<{
    data: Category[];
    totalCount: number;
    totalPages: number;
  }> {
    const response = await api.get('/Categories', { 
      params: {
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10
      }
    });
    
    const totalCount = parseInt(response.headers['x-total-count'] || '0');
    const totalPages = parseInt(response.headers['x-total-pages'] || '0');
    
    return {
      data: response.data,
      totalCount,
      totalPages
    };
  }

  static async search(params: CategorySearchParams): Promise<Category[]> {
    const response = await api.get('/Categories/search', { params });
    return response.data;
  }

  static async getById(id: number): Promise<Category> {
    const response = await api.get(`/Categories/${id}`);
    return response.data;
  }

  static async create(category: Partial<Category>): Promise<Category> {
    const response = await api.post('/Categories', category);
    return response.data;
  }

  static async update(id: number, category: Partial<Category>): Promise<void> {
    await api.put(`/Categories/${id}`, category);
  }

  static async delete(id: number): Promise<void> {
    await api.delete(`/Categories/${id}`);
  }
}