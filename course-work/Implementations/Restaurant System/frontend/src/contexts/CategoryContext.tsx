import React, { createContext, useState, ReactNode } from 'react';
import { Category, CategorySearchParams } from '../types/category.types';
import { CategoryService } from '../services/category.service';
import toast from 'react-hot-toast';

interface CategoryContextType {
  categories: Category[];
  loading: boolean;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  fetchCategories: (page?: number, pageSize?: number) => Promise<void>;
  searchCategories: (params: CategorySearchParams) => Promise<void>;
  getCategory: (id: number) => Promise<Category | null>;
  createCategory: (category: Partial<Category>) => Promise<Category | null>;
  updateCategory: (id: number, category: Partial<Category>) => Promise<boolean>;
  deleteCategory: (id: number) => Promise<boolean>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const fetchCategories = async (page: number = 1, pageSize: number = 10) => {
    try {
      setLoading(true);
      const response = await CategoryService.getAll({ pageNumber: page, pageSize });
      setCategories(response.data);
      setTotalCount(response.totalCount);
      setTotalPages(response.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch categories', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const searchCategories = async (params: CategorySearchParams) => {
    try {
      setLoading(true);
      const data = await CategoryService.search(params);
      setCategories(data);
      setTotalCount(data.length);
      setTotalPages(1);
      setCurrentPage(1);
    } catch (error) {
      console.error('Failed to search categories', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const getCategory = async (id: number): Promise<Category | null> => {
    try {
      setLoading(true);
      return await CategoryService.getById(id);
    } catch (error) {
      console.error('Failed to fetch category', error);
      toast.error('Failed to load category details');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (category: Partial<Category>): Promise<Category | null> => {
    try {
      setLoading(true);
      const newCategory = await CategoryService.create(category);
      toast.success('Category created successfully');
      await fetchCategories(currentPage);
      return newCategory;
    } catch (error: any) {
      toast.error(error.response?.data || 'Failed to create category');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: number, category: Partial<Category>): Promise<boolean> => {
    try {
      setLoading(true);
      await CategoryService.update(id, category);
      toast.success('Category updated successfully');
      await fetchCategories(currentPage);
      return true;
    } catch (error: any) {
      toast.error(error.response?.data || 'Failed to update category');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      await CategoryService.delete(id);
      toast.success('Category deleted successfully');
      await fetchCategories(currentPage);
      return true;
    } catch (error: any) {
      toast.error(error.response?.data || 'Failed to delete category');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CategoryContext.Provider
      value={{
        categories,
        loading,
        totalCount,
        totalPages,
        currentPage,
        fetchCategories,
        searchCategories,
        getCategory,
        createCategory,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export { CategoryContext };