import React, { useEffect, useState } from 'react';
import { useMenuItems } from '../hooks/useMenuItems';
import { useCategories } from '../hooks/useCategories';
import { usePagination } from '../hooks/usePagination';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import { FiEdit2, FiEye, FiSearch, FiFilter } from 'react-icons/fi';

const MenuItemsPage: React.FC = () => {
  const {
    menuItems,
    loading,
    totalCount,
    totalPages,
    currentPage: contextPage,
    fetchMenuItems,
    searchMenuItems,
  } = useMenuItems();

  const { categories, fetchCategories } = useCategories();

  const [searchParams, setSearchParams] = useState({
    title: '',
    minPrice: '',
    maxPrice: '',
    categoryId: '',
    isAvailable: '',
  });

  const [showFilters, setShowFilters] = useState(false);

  const { currentPage, pageSize, goToPage, changePageSize } = usePagination({
    initialPage: contextPage,
    totalPages,
  });

  useEffect(() => {
    fetchCategories(1, 100);
  }, []);

  useEffect(() => {
    const hasFilters = Object.values(searchParams).some(val => val !== '');
    if (hasFilters) {
      handleSearch();
    } else {
      fetchMenuItems(currentPage, pageSize);
    }
  }, [currentPage, pageSize]);

  const handleSearch = async () => {
    await searchMenuItems({
      title: searchParams.title || undefined,
      minPrice: searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined,
      maxPrice: searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined,
      categoryId: searchParams.categoryId ? parseInt(searchParams.categoryId) : undefined,
      isAvailable: searchParams.isAvailable ? searchParams.isAvailable === 'true' : undefined,
    });
  };

  const handleClear = () => {
    setSearchParams({
      title: '',
      minPrice: '',
      maxPrice: '',
      categoryId: '',
      isAvailable: '',
    });
    fetchMenuItems(1, pageSize);
  };

  if (loading && menuItems.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Menu Items</h1>
        <Link
          to="/menu-items/create"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          New Menu Item
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title..."
              value={searchParams.title}
              onChange={(e) => setSearchParams({ ...searchParams, title: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <FiFilter />
            Filters
          </button>
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Search
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Price
              </label>
              <input
                type="number"
                step="0.01"
                value={searchParams.minPrice}
                onChange={(e) => setSearchParams({ ...searchParams, minPrice: e.target.value })}
                className="w-full border border-gray-300 rounded-md py-2 px-3"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Price
              </label>
              <input
                type="number"
                step="0.01"
                value={searchParams.maxPrice}
                onChange={(e) => setSearchParams({ ...searchParams, maxPrice: e.target.value })}
                className="w-full border border-gray-300 rounded-md py-2 px-3"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={searchParams.categoryId}
                onChange={(e) => setSearchParams({ ...searchParams, categoryId: e.target.value })}
                className="w-full border border-gray-300 rounded-md py-2 px-3"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Availability
              </label>
              <select
                value={searchParams.isAvailable}
                onChange={(e) => setSearchParams({ ...searchParams, isAvailable: e.target.value })}
                className="w-full border border-gray-300 rounded-md py-2 px-3"
              >
                <option value="">All</option>
                <option value="true">Available</option>
                <option value="false">Unavailable</option>
              </select>
            </div>
          </div>
        )}

        {showFilters && (
          <div className="flex justify-end mt-4">
            <button
              onClick={handleClear}
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item) => {
          const category = categories.find(c => c.id === item.categoryId);
          return (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{category?.name}</p>
                
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-gray-900">${item.price.toFixed(2)}</span>
                  <span className="text-sm text-gray-500">{item.calories} cal</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Barcode: {item.internalBarcode}</span>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/menu-items/${item.id}`}
                      className="p-2 text-blue-600 hover:text-blue-800"
                    >
                      <FiEye size={18} />
                    </Link>
                    <Link
                      to={`/menu-items/${item.id}/edit`}
                      className="p-2 text-yellow-600 hover:text-yellow-800"
                    >
                      <FiEdit2 size={18} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {menuItems.length === 0 && (
        <p className="text-center text-gray-500 py-8">No menu items found</p>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
        pageSize={pageSize}
        onPageSizeChange={changePageSize}
        totalItems={totalCount}
      />
    </div>
  );
};

export default MenuItemsPage;