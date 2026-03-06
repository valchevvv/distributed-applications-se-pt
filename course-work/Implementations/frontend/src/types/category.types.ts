export interface Category {
  id: number;
  name: string;
  createdDate: string;
  isActive: boolean;
  priority: number;
  menuItemsCount?: number;
}

export interface CategoryListResponse {
  data: Category[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface CategorySearchParams {
  name?: string;
  isActive?: boolean;
  pageNumber?: number;
  pageSize?: number;
}