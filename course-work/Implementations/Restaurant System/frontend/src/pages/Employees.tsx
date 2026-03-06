import React, { useEffect, useState } from 'react';
import { useEmployees } from '../hooks/useEmployees';
import { usePagination } from '../hooks/usePagination';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { Link } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiEye, FiSearch, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';

const Employees: React.FC = () => {
  const {
    employees,
    loading,
    totalCount,
    totalPages,
    currentPage: contextPage,
    fetchEmployees,
    searchEmployees,
    deleteEmployee,
  } = useEmployees();

  const [searchParams, setSearchParams] = useState({
    name: '',
    role: '',
    minSalary: '',
    maxSalary: '',
  });

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number; name: string }>({
    isOpen: false,
    id: 0,
    name: '',
  });

  const { currentPage, pageSize, goToPage, changePageSize } = usePagination({
    initialPage: contextPage,
    totalPages,
  });

  useEffect(() => {
    const hasFilters = Object.values(searchParams).some(val => val !== '');
    if (hasFilters) {
      handleSearch();
    } else {
      fetchEmployees(currentPage, pageSize);
    }
  }, [currentPage, pageSize]);

  const handleSearch = async () => {
    await searchEmployees({
      name: searchParams.name || undefined,
      role: searchParams.role || undefined,
      minSalary: searchParams.minSalary ? parseFloat(searchParams.minSalary) : undefined,
      maxSalary: searchParams.maxSalary ? parseFloat(searchParams.maxSalary) : undefined,
    });
  };

  const handleClear = () => {
    setSearchParams({
      name: '',
      role: '',
      minSalary: '',
      maxSalary: '',
    });
    fetchEmployees(1, pageSize);
  };

  const handleDelete = async () => {
    await deleteEmployee(deleteModal.id);
    setDeleteModal({ isOpen: false, id: 0, name: '' });
  };

  const getRoleBadgeColor = (role: string | null) => {
    switch (role?.toLowerCase()) {
      case 'waiter':
        return 'bg-blue-100 text-blue-800';
      case 'chef':
        return 'bg-green-100 text-green-800';
      case 'bartender':
        return 'bg-purple-100 text-purple-800';
      case 'manager':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && employees.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
        <Link
          to="/employees/create"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          New Employee
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={searchParams.name}
              onChange={(e) => setSearchParams({ ...searchParams, name: e.target.value })}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search by name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={searchParams.role}
              onChange={(e) => setSearchParams({ ...searchParams, role: e.target.value })}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              <option value="waiter">Server</option>
              <option value="chef">Chef</option>
              <option value="bartender">Bartender</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Salary
            </label>
            <input
              type="number"
              step="0.01"
              value={searchParams.minSalary}
              onChange={(e) => setSearchParams({ ...searchParams, minSalary: e.target.value })}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Salary
            </label>
            <input
              type="number"
              step="0.01"
              value={searchParams.maxSalary}
              onChange={(e) => setSearchParams({ ...searchParams, maxSalary: e.target.value })}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
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

      {/* Employees Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hire Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <FiUser className="text-gray-500" size={16} />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{employee.fullName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(employee.role)}`}>
                      {employee.role || 'Not specified'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    +{employee.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${employee.salary.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(employee.hireDate), 'dd/MM/yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/employees/${employee.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FiEye size={18} />
                      </Link>
                      <Link
                        to={`/employees/${employee.id}/edit`}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        <FiEdit2 size={18} />
                      </Link>
                      <button
                        onClick={() =>
                          setDeleteModal({
                            isOpen: true,
                            id: employee.id,
                            name: employee.fullName,
                          })
                        }
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {employees.length === 0 && (
            <p className="text-center text-gray-500 py-8">No employees found</p>
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

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: 0, name: '' })}
        onConfirm={handleDelete}
        title="Delete Employee"
        message={`Are you sure you want to delete employee "${deleteModal.name}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
};

export default Employees;