import api from './api';
import { Employee, EmployeeSearchParams } from '../types/employee.types';

export class EmployeeService {
  static async getAll(params: { pageNumber?: number; pageSize?: number } = {}): Promise<{
    data: Employee[];
    totalCount: number;
    totalPages: number;
  }> {
    const response = await api.get('/Employees', { params });
    return {
      data: response.data,
      totalCount: parseInt(response.headers['x-total-count'] || '0'),
      totalPages: parseInt(response.headers['x-total-pages'] || '0')
    };
  }

  static async search(params: EmployeeSearchParams): Promise<Employee[]> {
    const response = await api.get('/Employees/search', { params });
    return response.data;
  }

  static async getById(id: number): Promise<Employee> {
    const response = await api.get(`/Employees/${id}`);
    return response.data;
  }

  static async getByRole(role: string): Promise<Employee[]> {
    const response = await api.get(`/Employees/role/${role}`);
    return response.data;
  }

  static async create(employee: Partial<Employee>): Promise<Employee> {
    const response = await api.post('/Employees', employee);
    return response.data;
  }

  static async update(id: number, employee: Partial<Employee>): Promise<void> {
    await api.put(`/Employees/${id}`, employee);
  }

  static async delete(id: number): Promise<void> {
    await api.delete(`/Employees/${id}`);
  }
}