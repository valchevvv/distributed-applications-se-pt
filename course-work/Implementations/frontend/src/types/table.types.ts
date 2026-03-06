import { OrderDetail } from "./order.types";

export interface RestaurantTable {
  id: number;
  number: number;
  capacity: number;
  zone: string | null;
  isAvailable: boolean;
  lastCleaned: string;
  orders?: OrderDetail[];
}

export interface TableSearchParams {
  number?: number;
  zone?: string;
  minCapacity?: number;
  isAvailable?: boolean;
}

export interface AvailableTablesParams {
  forDate?: string;
  capacity?: number;
}