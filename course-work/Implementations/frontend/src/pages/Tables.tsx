import React, { useEffect, useState } from 'react';
import { useTables } from '../hooks/useTables';
import { usePagination } from '../hooks/usePagination';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { Link } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiEye, FiSearch, FiRefreshCw } from 'react-icons/fi';
import { format } from 'date-fns';

const Tables: React.FC = () => {
  const {
    tables,
    loading,
    totalCount,
    totalPages,
    currentPage: contextPage,
    fetchTables,
    searchTables,
    toggleAvailability,
    markAsCleaned,
    deleteTable,
  } = useTables();

  const [searchParams, setSearchParams] = useState({
    number: '',
    zone: '',
    minCapacity: '',
    isAvailable: '',
  });

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number; number: number }>({
    isOpen: false,
    id: 0,
    number: 0,
  });

  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const { currentPage, pageSize, goToPage, changePageSize } = usePagination({
    initialPage: contextPage,
    totalPages,
  });

  useEffect(() => {
    const hasFilters = Object.values(searchParams).some(val => val !== '');
    if (hasFilters) {
      handleSearch();
    } else {
      fetchTables(currentPage, pageSize);
    }
  }, [currentPage, pageSize]);

  const handleSearch = async () => {
    await searchTables({
      number: searchParams.number ? parseInt(searchParams.number) : undefined,
      zone: searchParams.zone || undefined,
      minCapacity: searchParams.minCapacity ? parseInt(searchParams.minCapacity) : undefined,
      isAvailable: searchParams.isAvailable ? searchParams.isAvailable === 'true' : undefined,
    });
  };

  const handleClear = () => {
    setSearchParams({
      number: '',
      zone: '',
      minCapacity: '',
      isAvailable: '',
    });
    fetchTables(1, pageSize);
  };

  const handleToggleAvailability = async (id: number) => {
    setActionLoading(id);
    await toggleAvailability(id);
    setActionLoading(null);
  };

  const handleMarkAsCleaned = async (id: number) => {
    setActionLoading(id);
    await markAsCleaned(id);
    setActionLoading(null);
  };

  const handleDelete = async () => {
    await deleteTable(deleteModal.id);
    setDeleteModal({ isOpen: false, id: 0, number: 0 });
  };

  if (loading && tables.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Tables</h1>
        <Link
          to="/tables/create"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          New Table
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Table Number
            </label>
            <input
              type="number"
              value={searchParams.number}
              onChange={(e) => setSearchParams({ ...searchParams, number: e.target.value })}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter table number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zone
            </label>
            <input
              type="text"
              value={searchParams.zone}
              onChange={(e) => setSearchParams({ ...searchParams, zone: e.target.value })}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Terrace, Inside"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Capacity
            </label>
            <input
              type="number"
              value={searchParams.minCapacity}
              onChange={(e) => setSearchParams({ ...searchParams, minCapacity: e.target.value })}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Minimum seats"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Availability
            </label>
            <select
              value={searchParams.isAvailable}
              onChange={(e) => setSearchParams({ ...searchParams, isAvailable: e.target.value })}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="true">Available</option>
              <option value="false">Occupied</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={handleClear}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Clear
          </button>
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center gap-2"
          >
            <FiSearch />
            Search
          </button>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map((table) => (
          <div key={table.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Table {table.number}</h3>
                  {table.zone && (
                    <p className="text-sm text-gray-500">Zone: {table.zone}</p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  table.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {table.isAvailable ? 'Available' : 'Occupied'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm">
                  <span className="font-medium">Capacity:</span> {table.capacity} seats
                </p>
                <p className="text-sm">
                  <span className="font-medium">Last Cleaned:</span>{' '}
                  {format(new Date(table.lastCleaned), 'dd/MM/yyyy HH:mm')}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/tables/${table.id}`}
                    className="p-2 text-blue-600 hover:text-blue-800"
                  >
                    <FiEye size={18} />
                  </Link>
                  <Link
                    to={`/tables/${table.id}/edit`}
                    className="p-2 text-yellow-600 hover:text-yellow-800"
                  >
                    <FiEdit2 size={18} />
                  </Link>
                  <button
                    onClick={() => setDeleteModal({ isOpen: true, id: table.id, number: table.number })}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleAvailability(table.id)}
                    disabled={actionLoading === table.id}
                    className={`text-xs px-3 py-1 rounded-full transition-colors ${
                      table.isAvailable
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    } disabled:opacity-50`}
                  >
                    {actionLoading === table.id ? '...' : table.isAvailable ? 'Mark Occupied' : 'Mark Available'}
                  </button>
                  <button
                    onClick={() => handleMarkAsCleaned(table.id)}
                    disabled={actionLoading === table.id}
                    className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    <FiRefreshCw size={12} />
                    Clean
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {tables.length === 0 && (
        <p className="text-center text-gray-500 py-8">No tables found</p>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
        pageSize={pageSize}
        onPageSizeChange={changePageSize}
        totalItems={totalCount}
      />

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: 0, number: 0 })}
        onConfirm={handleDelete}
        title="Delete Table"
        message={`Are you sure you want to delete Table ${deleteModal.number}? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
};

export default Tables;