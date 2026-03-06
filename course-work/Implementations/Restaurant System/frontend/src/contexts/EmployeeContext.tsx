import React, { createContext, useState, ReactNode } from 'react';
import { Employee, EmployeeSearchParams } from '../types/employee.types';
import { EmployeeService } from '../services/employee.service';
import toast from 'react-hot-toast';

interface EmployeeContextType {
  employees: Employee[];
  loading: boolean;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  fetchEmployees: (page?: number, pageSize?: number) => Promise<void>;
  searchEmployees: (params: EmployeeSearchParams) => Promise<void>;
  getEmployee: (id: number) => Promise<Employee | null>;
  getByRole: (role: string) => Promise<Employee[]>;
  createEmployee: (employee: Partial<Employee>) => Promise<Employee | null>;
  updateEmployee: (id: number, employee: Partial<Employee>) => Promise<boolean>;
  deleteEmployee: (id: number) => Promise<boolean>;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export const EmployeeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const fetchEmployees = async (page: number = 1, pageSize: number = 10) => {
    try {
      setLoading(true);
      const response = await EmployeeService.getAll({ pageNumber: page, pageSize });
      setEmployees(response.data);
      setTotalCount(response.totalCount);
      setTotalPages(response.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch employees', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const searchEmployees = async (params: EmployeeSearchParams) => {
    try {
      setLoading(true);
      const data = await EmployeeService.search(params);
      setEmployees(data);
      setTotalCount(data.length);
      setTotalPages(1);
      setCurrentPage(1);
    } catch (error) {
      console.error('Failed to search employees', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const getEmployee = async (id: number): Promise<Employee | null> => {
    try {
      setLoading(true);
      return await EmployeeService.getById(id);
    } catch (error) {
      console.error('Failed to fetch employee', error);
      toast.error('Failed to load employee details');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getByRole = async (role: string): Promise<Employee[]> => {
    try {
      setLoading(true);
      return await EmployeeService.getByRole(role);
    } catch (error) {
      console.error('Failed to fetch employees by role', error);
      toast.error('Failed to load employees');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createEmployee = async (employee: Partial<Employee>): Promise<Employee | null> => {
    try {
      setLoading(true);
      const newEmployee = await EmployeeService.create(employee);
      toast.success('Employee created successfully');
      await fetchEmployees(currentPage);
      return newEmployee;
    } catch (error: any) {
      toast.error(error.response?.data || 'Failed to create employee');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateEmployee = async (id: number, employee: Partial<Employee>): Promise<boolean> => {
    try {
      setLoading(true);
      await EmployeeService.update(id, employee);
      toast.success('Employee updated successfully');
      await fetchEmployees(currentPage);
      return true;
    } catch (error: any) {
      toast.error(error.response?.data || 'Failed to update employee');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteEmployee = async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      await EmployeeService.delete(id);
      toast.success('Employee deleted successfully');
      await fetchEmployees(currentPage);
      return true;
    } catch (error: any) {
      toast.error(error.response?.data || 'Failed to delete employee');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <EmployeeContext.Provider
      value={{
        employees,
        loading,
        totalCount,
        totalPages,
        currentPage,
        fetchEmployees,
        searchEmployees,
        getEmployee,
        getByRole,
        createEmployee,
        updateEmployee,
        deleteEmployee,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};

export { EmployeeContext };