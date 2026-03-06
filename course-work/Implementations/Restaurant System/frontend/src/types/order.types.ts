import { Employee } from "./employee.types";
import { RestaurantTable } from "./table.types";

export interface Order {
  id: number;
  orderTime: string;
  totalPrice: number;
  tableId: number;
  employeeId: number;
  status: string;
  table: RestaurantTable;
  waiter: Employee;
  orderDetails: OrderDetail[];
}

export interface OrderDetail {
  id: number;
  orderId: number;
  menuItemId: number;
  quantity: number;
  subTotal: number;
  note: string | null;
}

export interface MenuItem {
  id: number;
  title: string;
  price: number;
  calories: number;
  internalBarcode: number;
  categoryId: number;
  isAvailable: boolean;
}

export interface CreateOrderRequest {
  tableId: number;
  employeeId: number;
  status: string;
}

export interface AddOrderItemRequest {
  menuItemId: number;
  quantity: number;
  note?: string;
}

export interface OrderSearchParams {
  fromDate?: string;
  toDate?: string;
  status?: string;
  tableId?: number;
  employeeId?: number;
  minTotal?: number;
  maxTotal?: number;
  pageNumber?: number;
  pageSize?: number;
}