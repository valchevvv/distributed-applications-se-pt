import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTables } from '../../hooks/useTables';
import { useOrders } from '../../hooks/useOrders';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmationModal from '../common/ConfirmationModal';
import { FiEdit2, FiTrash2, FiArrowLeft, FiShoppingBag, FiRefreshCw } from 'react-icons/fi';
import { format } from 'date-fns';

const TableDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTable, toggleAvailability, markAsCleaned, deleteTable, loading } = useTables();
  const { getByTable, orders } = useOrders();

  const [table, setTable] = useState<any>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    const data = await getTable(parseInt(id));
    if (data) {
      setTable(data);
      await getByTable(parseInt(id));
    }
  };

  const handleToggleAvailability = async () => {
    if (!id) return;
    setActionLoading(true);
    await toggleAvailability(parseInt(id));
    await loadData();
    setActionLoading(false);
  };

  const handleMarkAsCleaned = async () => {
    if (!id) return;
    setActionLoading(true);
    await markAsCleaned(parseInt(id));
    await loadData();
    setActionLoading(false);
  };

  const handleDelete = async () => {
    if (!id) return;
    const success = await deleteTable(parseInt(id));
    if (success) {
      navigate('/tables');
    }
  };

  if (loading || !table) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/tables')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Table {table.number}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            table.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {table.isAvailable ? 'Available' : 'Occupied'}
          </span>
          {table.zone && (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
              {table.zone}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleAvailability}
            disabled={actionLoading}
            className={`px-4 py-2 rounded-lg transition-colors ${
              table.isAvailable 
                ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                : 'bg-green-500 text-white hover:bg-green-600'
            } disabled:opacity-50`}
          >
            {actionLoading ? '...' : table.isAvailable ? 'Mark Occupied' : 'Mark Available'}
          </button>
          <button
            onClick={handleMarkAsCleaned}
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <FiRefreshCw />
            Mark Cleaned
          </button>
          <Link
            to={`/tables/${id}/edit`}
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

      {/* Table Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-500 mb-1">Capacity</p>
          <p className="text-2xl font-bold text-gray-900">{table.capacity} seats</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-500 mb-1">Last Cleaned</p>
          <p className="text-lg font-semibold text-gray-900">
            {format(new Date(table.lastCleaned), 'dd/MM/yyyy HH:mm')}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-500 mb-1">Zone</p>
          <p className="text-lg font-semibold text-gray-900">{table.zone || 'Not specified'}</p>
        </div>
      </div>

      {/* Order History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiShoppingBag className="text-gray-500" />
          <h2 className="text-lg font-semibold">Order History for this Table</h2>
        </div>

        {orders.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No orders for this table yet</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
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
                      order.status === 'Served' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
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
        title="Delete Table"
        message={`Are you sure you want to delete Table ${table.number}? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
};

export default TableDetails;