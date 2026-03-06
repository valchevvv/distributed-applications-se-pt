import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEmployees } from '../../hooks/useEmployees';
import { useOrders } from '../../hooks/useOrders';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmationModal from '../common/ConfirmationModal';
import { FiEdit2, FiTrash2, FiArrowLeft, FiShoppingBag, FiPhone, FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';

const EmployeeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getEmployee, deleteEmployee, loading } = useEmployees();
  const { getByEmployee, orders } = useOrders();

  const [employee, setEmployee] = useState<any>(null);
  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    const data = await getEmployee(parseInt(id));
    if (data) {
      setEmployee(data);
      await getByEmployee(parseInt(id));
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const success = await deleteEmployee(parseInt(id));
    if (success) {
      navigate('/employees');
    }
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

  if (loading || !employee) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/employees')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{employee.fullName}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(employee.role)}`}>
            {employee.role || 'No Role'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/employees/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FiEdit2 />
            Edit
          </Link>
          <button
            onClick={() => setDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <FiTrash2 />
            Delete
          </button>
        </div>
      </div>

      {/* Employee Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3 text-gray-600 mb-2">
            <FiPhone />
            <span className="text-sm font-medium">Phone</span>
          </div>
          <p className="text-lg font-semibold">+{employee.phone}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3 text-gray-600 mb-2">
            <FiCalendar />
            <span className="text-sm font-medium">Hire Date</span>
          </div>
          <p className="text-lg font-semibold">
            {format(new Date(employee.hireDate), 'dd MMMM yyyy')}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-500 mb-1">Salary</p>
          <p className="text-2xl font-bold text-gray-900">${employee.salary.toFixed(2)}</p>
        </div>
      </div>

      {/* Order History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiShoppingBag className="text-gray-500" />
          <h2 className="text-lg font-semibold">Order History</h2>
        </div>

        {orders.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No orders taken by this employee yet</p>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">Order #{order.id}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      {format(new Date(order.orderTime), 'dd/MM/yyyy HH:mm')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">${order.totalPrice.toFixed(2)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === 'New' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Employee"
        message={`Are you sure you want to delete employee "${employee.fullName}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
};

export default EmployeeDetails;