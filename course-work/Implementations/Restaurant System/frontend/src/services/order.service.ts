import api from './api';
import { Order, OrderDetail, OrderSearchParams, CreateOrderRequest, AddOrderItemRequest } from '../types/order.types';

export class OrderService {
  static async getAll(params: OrderSearchParams = {}): Promise<{
    data: Order[];
    totalCount: number;
    totalPages: number;
  }> {
    const response = await api.get('/Orders', { 
      params: {
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10
      }
    });
    return {
      data: response.data,
      totalCount: parseInt(response.headers['x-total-count'] || '0'),
      totalPages: parseInt(response.headers['x-total-pages'] || '0')
    };
  }

  static async search(params: OrderSearchParams): Promise<Order[]> {
    const response = await api.get('/Orders/search', { params });
    return response.data;
  }

  static async getById(id: number): Promise<Order> {
    const response = await api.get(`/Orders/${id}`);
    return response.data;
  }

  static async getByTable(tableId: number): Promise<Order[]> {
    const response = await api.get(`/Orders/table/${tableId}`);
    return response.data;
  }

  static async getByEmployee(employeeId: number): Promise<Order[]> {
    const response = await api.get(`/Orders/employee/${employeeId}`);
    return response.data;
  }

  static async getByStatus(status: string): Promise<Order[]> {
    const response = await api.get(`/Orders/status/${status}`);
    return response.data;
  }

  static async getByDate(date: string): Promise<Order[]> {
    const response = await api.get(`/Orders/date/${date}`);
    return response.data;
  }

  static async create(order: CreateOrderRequest): Promise<Order> {
    const response = await api.post('/Orders', order);
    return response.data;
  }

  static async addItem(orderId: number, item: AddOrderItemRequest): Promise<OrderDetail> {
    const response = await api.post(`/Orders/${orderId}/add-item`, item);
    return response.data;
  }

  static async updateStatus(orderId: number, status: string): Promise<void> {
    await api.patch(`/Orders/${orderId}/status`, { status });
  }

  static async calculateTotal(orderId: number): Promise<{ totalPrice: number }> {
    const response = await api.patch(`/Orders/${orderId}/calculate-total`);
    return response.data;
  }

  static async delete(orderId: number): Promise<void> {
    await api.delete(`/Orders/${orderId}`);
  }
}