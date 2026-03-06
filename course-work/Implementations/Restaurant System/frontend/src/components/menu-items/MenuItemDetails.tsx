import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMenuItems } from '../../hooks/useMenuItems';
import { useCategories } from '../../hooks/useCategories';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmationModal from '../common/ConfirmationModal';
import { FiEdit2, FiTrash2, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';

const MenuItemDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getMenuItem, toggleAvailability, deleteMenuItem, loading } = useMenuItems();
  const { categories } = useCategories();

  const [item, setItem] = useState<any>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (id) {
      loadItem();
    }
  }, [id]);

  const loadItem = async () => {
    if (!id) return;
    const data = await getMenuItem(parseInt(id));
    if (data) {
      setItem(data);
    }
  };

  const handleToggleAvailability = async () => {
    if (!id) return;
    setToggling(true);
    const success = await toggleAvailability(parseInt(id));
    if (success) {
      await loadItem();
    }
    setToggling(false);
  };

  const handleDelete = async () => {
    if (!id) return;
    const success = await deleteMenuItem(parseInt(id));
    if (success) {
      navigate('/menu-items');
    }
  };

  const category = categories.find(c => c.id === item?.categoryId);

  if (loading || !item) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/menu-items')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {item.isAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleAvailability}
            disabled={toggling}
            className={`px-4 py-2 rounded-lg transition-colors ${
              item.isAvailable 
                ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                : 'bg-green-500 text-white hover:bg-green-600'
            } disabled:opacity-50`}
          >
            {toggling ? 'Updating...' : item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
          </button>
          <Link
            to={`/menu-items/${id}/edit`}
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

      {/* Item Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-500 mb-1">Price</p>
          <p className="text-2xl font-bold text-gray-900">${item.price.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-500 mb-1">Calories</p>
          <p className="text-2xl font-bold text-gray-900">{item.calories}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-500 mb-1">Barcode</p>
          <p className="text-lg font-semibold text-gray-900">{item.internalBarcode}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-500 mb-1">Category</p>
          <Link 
            to={`/categories/${item.categoryId}`}
            className="text-lg font-semibold text-blue-600 hover:text-blue-800"
          >
            {category?.name || `Category #${item.categoryId}`}
          </Link>
        </div>
      </div>

      {/* Order History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiShoppingBag className="text-gray-500" />
          <h2 className="text-lg font-semibold">Order History</h2>
        </div>
        
        {item.orderDetails && item.orderDetails.length > 0 ? (
          <p>This item has been ordered {item.orderDetails.length} times</p>
        ) : (
          <p className="text-gray-500">No order history for this item</p>
        )}
      </div>

      <ConfirmationModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Menu Item"
        message={`Are you sure you want to delete "${item.title}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
};

export default MenuItemDetails;