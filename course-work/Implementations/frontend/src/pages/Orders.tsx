import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import { useTables } from '../hooks/useTables';
import { useEmployees } from '../hooks/useEmployees';
import { usePagination } from '../hooks/usePagination';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FiSearch, FiFilter, FiEye, FiPlus } from 'react-icons/fi';
import { format } from 'date-fns';

const OrdersPage: React.FC = () => {
  const {
    orders,
    loading,
    totalCount,
    totalPages,
    currentPage: contextPage,
    fetchOrders,
    searchOrders,
  } = useOrders();

  const { tables, fetchTables } = useTables();
  const { employees, fetchEmployees } = useEmployees();

  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    status: '',
    tableId: '',
    employeeId: '',
    minTotal: '',
    maxTotal: '',
  });

  const [showFilters, setShowFilters] = useState(false);

  const { currentPage, pageSize, goToPage, changePageSize } = usePagination({
    initialPage: contextPage,
    totalPages,
  });

  useEffect(() => {
    fetchTables(1, 100);
    fetchEmployees(1, 100);
  }, []);

  useEffect(() => {
    const hasFilters = Object.values(filters).some((val) => val !== '');
    if (hasFilters) {
      handleSearch();
    } else {
      fetchOrders(currentPage, pageSize);
    }
  }, [currentPage, pageSize]);

  const handleSearch = async () => {
    await searchOrders({
      fromDate: filters.fromDate || undefined,
      toDate: filters.toDate || undefined,
      status: filters.status || undefined,
      tableId: filters.tableId ? parseInt(filters.tableId) : undefined,
      employeeId: filters.employeeId ? parseInt(filters.employeeId) : undefined,
      minTotal: filters.minTotal ? parseFloat(filters.minTotal) : undefined,
      maxTotal: filters.maxTotal ? parseFloat(filters.maxTotal) : undefined,
    });
  };

  const handleClear = () => {
    setFilters({
      fromDate: '',
      toDate: '',
      status: '',
      tableId: '',
      employeeId: '',
      minTotal: '',
      maxTotal: '',
    });
    fetchOrders(1, pageSize);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Served':
        return 'bg-green-100 text-green-800';
      case 'Paid':
        return 'bg-purple-100 text-purple-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && orders.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <Link
          to="/orders/create"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <FiPlus />
          New Order
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <FiFilter />
            Filters
          </button>
          <button
            onClick={handleSearch}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            <FiSearch />
            Apply
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Clear
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                className="w-full border border-gray-300 rounded-md py-2 px-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                className="w-full border border-gray-300 rounded-md py-2 px-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full border border-gray-300 rounded-md py-2 px-3"
              >
                <option value="">All</option>
                <option value="New">New</option>
                <option value="In Progress">In Progress</option>
                <option value="Served">Served</option>
                <option value="Paid">Paid</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Table
              </label>
              <select
                value={filters.tableId}
                onChange={(e) => setFilters({ ...filters, tableId: e.target.value })}
                className="w-full border border-gray-300 rounded-md py-2 px-3"
              >
                <option value="">All</option>
                {tables.map((table) => (
                  <option key={table.id} value={table.id}>
                    Table {table.number}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee
              </label>
              <select
                value={filters.employeeId}
                onChange={(e) => setFilters({ ...filters, employeeId: e.target.value })}
                className="w-full border border-gray-300 rounded-md py-2 px-3"
              >
                <option value="">All</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Total
              </label>
              <input
                type="number"
                step="0.01"
                value={filters.minTotal}
                onChange={(e) => setFilters({ ...filters, minTotal: e.target.value })}
                className="w-full border border-gray-300 rounded-md py-2 px-3"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Total
              </label>
              <input
                type="number"
                step="0.01"
                value={filters.maxTotal}
                onChange={(e) => setFilters({ ...filters, maxTotal: e.target.value })}
                className="w-full border border-gray-300 rounded-md py-2 px-3"
                placeholder="0.00"
              />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Table
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Server
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Table {order.table.number ?? order.tableId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.waiter.fullName ?? `#${order.employeeId}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${order.totalPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(order.orderTime), 'dd/MM/yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      to={`/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1"
                    >
                      <FiEye size={16} />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {orders.length === 0 && (
            <p className="text-center text-gray-500 py-8">No orders found</p>
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
          pageSize={pageSize}
          onPageSizeChange={changePageSize}
          totalItems={totalCount}
          embeded={true}
        />
      </div>
    </div>
  );
};

export default OrdersPage;