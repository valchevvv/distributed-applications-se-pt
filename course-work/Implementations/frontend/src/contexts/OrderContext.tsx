import React, { createContext, useState, ReactNode } from 'react';
import { Order, OrderDetail, OrderSearchParams, CreateOrderRequest, AddOrderItemRequest } from '../types/order.types';
import { OrderService } from '../services/order.service';
import toast from 'react-hot-toast';

interface OrderContextType {
  orders: Order[];
  currentOrder: Order | null;
  orderDetails: OrderDetail[];
  loading: boolean;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  fetchOrders: (page?: number, pageSize?: number) => Promise<void>;
  searchOrders: (params: OrderSearchParams) => Promise<void>;
  getOrder: (id: number) => Promise<Order | null>;
  getByTable: (tableId: number) => Promise<Order[]>;
  getByEmployee: (employeeId: number) => Promise<Order[]>;
  getByStatus: (status: string) => Promise<Order[]>;
  getByDate: (date: string) => Promise<Order[]>;
  createOrder: (order: CreateOrderRequest) => Promise<Order | null>;
  addItem: (orderId: number, item: AddOrderItemRequest) => Promise<OrderDetail | null>;
  updateStatus: (orderId: number, status: string) => Promise<boolean>;
  calculateTotal: (orderId: number) => Promise<boolean>;
  deleteOrder: (orderId: number) => Promise<boolean>;
  loadOrderDetails: (orderId: number) => Promise<void>;
  setCurrentOrder: (order: Order | null) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const fetchOrders = async (page: number = 1, pageSize: number = 10) => {
    try {
      setLoading(true);
      const response = await OrderService.getAll({ pageNumber: page, pageSize });
      setOrders(response.data);
      setTotalCount(response.totalCount);
      setTotalPages(response.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch orders', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const searchOrders = async (params: OrderSearchParams) => {
    try {
      setLoading(true);
      const data = await OrderService.search(params);
      setOrders(data);
      setTotalCount(data.length);
      setTotalPages(1);
      setCurrentPage(1);
    } catch (error) {
      console.error('Failed to search orders', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const getOrder = async (id: number): Promise<Order | null> => {
    try {
      setLoading(true);
      const order = await OrderService.getById(id);
      setCurrentOrder(order);
      return order;
    } catch (error) {
      console.error('Failed to fetch order', error);
      toast.error('Failed to load order details');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getByTable = async (tableId: number): Promise<Order[]> => {
    try {
      setLoading(true);
      return await OrderService.getByTable(tableId);
    } catch (error) {
      console.error('Failed to fetch orders by table', error);
      toast.error('Failed to load orders');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getByEmployee = async (employeeId: number): Promise<Order[]> => {
    try {
      setLoading(true);
      return await OrderService.getByEmployee(employeeId);
    } catch (error) {
      console.error('Failed to fetch orders by employee', error);
      toast.error('Failed to load orders');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getByStatus = async (status: string): Promise<Order[]> => {
    try {
      setLoading(true);
      return await OrderService.getByStatus(status);
    } catch (error) {
      console.error('Failed to fetch orders by status', error);
      toast.error('Failed to load orders');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getByDate = async (date: string): Promise<Order[]> => {
    try {
      setLoading(true);
      return await OrderService.getByDate(date);
    } catch (error) {
      console.error('Failed to fetch orders by date', error);
      toast.error('Failed to load orders');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (order: CreateOrderRequest): Promise<Order | null> => {
    try {
      setLoading(true);
      const newOrder = await OrderService.create(order);
      toast.success('Order created successfully');
      await fetchOrders(currentPage);
      setCurrentOrder(newOrder);
      return newOrder;
    } catch (error: any) {
      toast.error(error.response?.data || 'Failed to create order');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (orderId: number, item: AddOrderItemRequest): Promise<OrderDetail | null> => {
    try {
      setLoading(true);
      const newDetail = await OrderService.addItem(orderId, item);
      toast.success('Item added to order');
      await loadOrderDetails(orderId);
      return newDetail;
    } catch (error: any) {
      toast.error(error.response?.data || 'Failed to add item');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: number, status: string): Promise<boolean> => {
    try {
      setLoading(true);
      await OrderService.updateStatus(orderId, status);
      toast.success(`Order status updated to ${status}`);
      if (currentOrder && currentOrder.id === orderId) {
        setCurrentOrder({ ...currentOrder, status });
      }
      await fetchOrders(currentPage);
      return true;
    } catch (error) {
      console.error('Failed to update status', error);
      toast.error('Failed to update order status');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = async (orderId: number): Promise<boolean> => {
    try {
      setLoading(true);
      const result = await OrderService.calculateTotal(orderId);
      toast.success('Order total recalculated');
      if (currentOrder && currentOrder.id === orderId) {
        setCurrentOrder({ ...currentOrder, totalPrice: result.totalPrice });
      }
      return true;
    } catch (error) {
      console.error('Failed to calculate total', error);
      toast.error('Failed to calculate order total');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (orderId: number): Promise<boolean> => {
    try {
      setLoading(true);
      await OrderService.delete(orderId);
      toast.success('Order deleted successfully');
      if (currentOrder && currentOrder.id === orderId) {
        setCurrentOrder(null);
        setOrderDetails([]);
      }
      await fetchOrders(currentPage);
      return true;
    } catch (error: any) {
      toast.error(error.response?.data || 'Failed to delete order');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loadOrderDetails = async (orderId: number) => {
    try {
      setLoading(true);
      const order = await OrderService.getById(orderId);
      setCurrentOrder(order);
      if (order && order.orderDetails) {
        setOrderDetails(order.orderDetails);
      }
    } catch (error) {
      console.error('Failed to load order details', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        currentOrder,
        orderDetails,
        loading,
        totalCount,
        totalPages,
        currentPage,
        fetchOrders,
        searchOrders,
        getOrder,
        getByTable,
        getByEmployee,
        getByStatus,
        getByDate,
        createOrder,
        addItem,
        updateStatus,
        calculateTotal,
        deleteOrder,
        loadOrderDetails,
        setCurrentOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export { OrderContext };