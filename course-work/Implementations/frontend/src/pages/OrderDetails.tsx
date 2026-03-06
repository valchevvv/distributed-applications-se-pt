import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import { useMenuItems } from '../hooks/useMenuItems';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmationModal from '../components/common/ConfirmationModal';
import {
  FiArrowLeft,
  FiTrash2,
  FiPlus,
  FiPrinter,
  FiClock,
  FiUser,
  FiGrid,
} from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    currentOrder, 
    orderDetails, 
    loading, 
    getOrder, 
    loadOrderDetails,
    updateStatus,
    addItem,
    deleteOrder,
    calculateTotal
  } = useOrders();
  const { menuItems, fetchMenuItems } = useMenuItems();

  const [showAddItem, setShowAddItem] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<number | ''>('');
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      getOrder(parseInt(id));
      loadOrderDetails(parseInt(id));
      fetchMenuItems(1, 100);
    }
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    setUpdating(true);
    const success = await updateStatus(parseInt(id), newStatus);
    if (success) {
      toast.success(`Order status updated to ${newStatus}`);
    }
    setUpdating(false);
  };

  const handleAddItem = async () => {
    if (!id || !selectedMenuItem) return;

    const success = await addItem(parseInt(id), {
      menuItemId: Number(selectedMenuItem),
      quantity,
      note: note || undefined,
    });

    if (success) {
      toast.success('Item added to order');
      await calculateTotal(parseInt(id));
      setShowAddItem(false);
      setSelectedMenuItem('');
      setQuantity(1);
      setNote('');
    }
  };

  const handleDeleteOrder = async () => {
    if (!id) return;
    const success = await deleteOrder(parseInt(id));
    if (success) {
      navigate('/orders');
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Served': return 'bg-green-100 text-green-800 border-green-200';
      case 'Paid': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const availableStatuses = ['New', 'In Progress', 'Served', 'Paid', 'Cancelled'];

  if (loading || !currentOrder) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/orders')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Order #{currentOrder.id}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(currentOrder.status)}`}>
            {currentOrder.status}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintReceipt}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FiPrinter />
            Print Receipt
          </button>
          <button
            onClick={() => setDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <FiTrash2 />
            Delete Order
          </button>
        </div>
      </div>

      {/* Order Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3 text-gray-600 mb-2">
            <FiGrid size={18} />
            <span className="text-sm font-medium">Table</span>
          </div>
          <p className="text-lg font-semibold">Table {currentOrder.table.number}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3 text-gray-600 mb-2">
            <FiUser size={18} />
            <span className="text-sm font-medium">Server</span>
          </div>
          <p className="text-lg font-semibold">{currentOrder.waiter.fullName}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3 text-gray-600 mb-2">
            <FiClock size={18} />
            <span className="text-sm font-medium">Order Time</span>
          </div>
          <p className="text-lg font-semibold">
            {format(new Date(currentOrder.orderTime), 'dd/MM/yyyy HH:mm')}
          </p>
        </div>
      </div>

      {/* Status Update */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Update Status</h2>
        <div className="flex flex-wrap gap-2">
          {availableStatuses.map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={updating || status === currentOrder.status}
              className={`px-4 py-2 rounded-lg transition-colors ${
                status === currentOrder.status
                  ? getStatusColor(status)
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Order Items</h2>
          <button
            onClick={() => setShowAddItem(true)}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-700"
          >
            <FiPlus />
            Add Item
          </button>
        </div>

        {showAddItem && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-3">Add New Item</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Menu Item
                </label>
                <select
                  value={selectedMenuItem}
                  onChange={(e) => setSelectedMenuItem(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select item</option>
                  {menuItems.filter(item => item.isAvailable).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title} - ${item.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Special instructions..."
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddItem(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                disabled={!selectedMenuItem}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                Add Item
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {orderDetails.map((detail) => {
            const menuItem = menuItems.find(m => m.id === detail.menuItemId) || { title: 'Unknown Item' };
            return (
              <div key={detail.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{menuItem.title}</div>
                  {detail.note && <div className="text-sm text-gray-500">Note: {detail.note}</div>}
                  <div className="text-sm text-gray-600">
                    ${(detail.subTotal / detail.quantity).toFixed(2)} × {detail.quantity}
                  </div>
                </div>
                <div className="font-semibold">${detail.subTotal.toFixed(2)}</div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span>${(currentOrder.totalPrice / 1.1).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax (10%):</span>
            <span>${(currentOrder.totalPrice - currentOrder.totalPrice / 1.1).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg mt-2">
            <span>Total:</span>
            <span>${currentOrder.totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDeleteOrder}
        title="Delete Order"
        message={`Are you sure you want to delete Order #${currentOrder.id}? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
};

export default OrderDetails;