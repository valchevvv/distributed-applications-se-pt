import { Category } from './category.types';
import { OrderDetail } from './order.types';

export interface MenuItem {
  id: number;
  title: string;
  price: number;
  calories: number;
  internalBarcode: number;
  categoryId: number;
  category?: Category & { menuItems?: string[] };
  isAvailable: boolean;
  orderDetails?: OrderDetail[];
}

export interface MenuItemSearchParams {
  title?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: number;
  isAvailable?: boolean;
  pageNumber?: number;
  pageSize?: number;
}