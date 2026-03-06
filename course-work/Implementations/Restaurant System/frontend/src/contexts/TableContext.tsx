import React, { createContext, useState, ReactNode } from 'react';
import { RestaurantTable, TableSearchParams, AvailableTablesParams } from '../types/table.types';
import { TableService } from '../services/table.service';
import toast from 'react-hot-toast';

interface TableContextType {
  tables: RestaurantTable[];
  loading: boolean;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  fetchTables: (page?: number, pageSize?: number) => Promise<void>;
  searchTables: (params: TableSearchParams) => Promise<void>;
  getAvailableTables: (params: AvailableTablesParams) => Promise<RestaurantTable[]>;
  getTable: (id: number) => Promise<RestaurantTable | null>;
  createTable: (table: Partial<RestaurantTable>) => Promise<RestaurantTable | null>;
  updateTable: (id: number, table: Partial<RestaurantTable>) => Promise<boolean>;
  toggleAvailability: (id: number) => Promise<boolean>;
  markAsCleaned: (id: number) => Promise<boolean>;
  deleteTable: (id: number) => Promise<boolean>;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export const TableProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const fetchTables = async (page: number = 1, pageSize: number = 10) => {
    try {
      setLoading(true);
      const response = await TableService.getAll({ pageNumber: page, pageSize });
      setTables(response.data);
      setTotalCount(response.totalCount);
      setTotalPages(response.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch tables', error);
      toast.error('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  const searchTables = async (params: TableSearchParams) => {
    try {
      setLoading(true);
      const data = await TableService.search(params);
      setTables(data);
      setTotalCount(data.length);
      setTotalPages(1);
      setCurrentPage(1);
    } catch (error) {
      console.error('Failed to search tables', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableTables = async (params: AvailableTablesParams): Promise<RestaurantTable[]> => {
    try {
      setLoading(true);
      return await TableService.getAvailable(params);
    } catch (error) {
      console.error('Failed to fetch available tables', error);
      toast.error('Failed to load available tables');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getTable = async (id: number): Promise<RestaurantTable | null> => {
    try {
      setLoading(true);
      return await TableService.getById(id);
    } catch (error) {
      console.error('Failed to fetch table', error);
      toast.error('Failed to load table details');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createTable = async (table: Partial<RestaurantTable>): Promise<RestaurantTable | null> => {
    try {
      setLoading(true);
      const newTable = await TableService.create(table);
      toast.success('Table created successfully');
      await fetchTables(currentPage);
      return newTable;
    } catch (error: any) {
      toast.error(error.response?.data || 'Failed to create table');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateTable = async (id: number, table: Partial<RestaurantTable>): Promise<boolean> => {
    try {
      setLoading(true);
      await TableService.update(id, table);
      toast.success('Table updated successfully');
      await fetchTables(currentPage);
      return true;
    } catch (error: any) {
      toast.error(error.response?.data || 'Failed to update table');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      const result = await TableService.toggleAvailability(id);
      toast.success(`Table marked as ${result.isAvailable ? 'available' : 'occupied'}`);
      await fetchTables(currentPage);
      return true;
    } catch (error) {
      console.error('Failed to toggle availability', error);
      toast.error('Failed to change availability');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const markAsCleaned = async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      await TableService.markAsCleaned(id);
      toast.success('Table marked as cleaned');
      await fetchTables(currentPage);
      return true;
    } catch (error) {
      console.error('Failed to mark as cleaned', error);
      toast.error('Failed to mark table as cleaned');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteTable = async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      await TableService.delete(id);
      toast.success('Table deleted successfully');
      await fetchTables(currentPage);
      return true;
    } catch (error: any) {
      toast.error(error.response?.data || 'Failed to delete table');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <TableContext.Provider
      value={{
        tables,
        loading,
        totalCount,
        totalPages,
        currentPage,
        fetchTables,
        searchTables,
        getAvailableTables,
        getTable,
        createTable,
        updateTable,
        toggleAvailability,
        markAsCleaned,
        deleteTable,
      }}
    >
      {children}
    </TableContext.Provider>
  );
};

export { TableContext };