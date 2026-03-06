import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCategories } from '../../hooks/useCategories';
import { useMenuItems } from '../../hooks/useMenuItems';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmationModal from '../common/ConfirmationModal';
import { FiEdit2, FiTrash2, FiArrowLeft, FiCoffee } from 'react-icons/fi';
import { format } from 'date-fns';

const CategoryDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCategory, deleteCategory, loading } = useCategories();
  const { getByCategory, menuItems } = useMenuItems();

  const [category, setCategory] = useState<any>(null);
  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    const data = await getCategory(parseInt(id));
    if (data) {
      setCategory(data);
      await getByCategory(parseInt(id));
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const success = await deleteCategory(parseInt(id));
    if (success) {
      navigate('/categories');
    }
  };

  if (loading || !category) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/categories')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {category.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/categories/${id}/edit`}
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

      {/* Category Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-500 mb-1">Priority</p>
          <p className="text-lg font-semibold">{category.priority}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-500 mb-1">Created Date</p>
          <p className="text-lg font-semibold">
            {format(new Date(category.createdDate), 'dd/MM/yyyy')}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-500 mb-1">Menu Items</p>
          <p className="text-lg font-semibold">{menuItems.length}</p>
        </div>
      </div>

      {/* Menu Items in this Category */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FiCoffee />
            Menu Items in this Category
          </h2>
          <Link
            to={`/menu-items/create?categoryId=${id}`}
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            + Add New Item
          </Link>
        </div>

        {menuItems.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No menu items in this category</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                to={`/menu-items/${item.id}`}
                className="block p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{item.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Price: ${item.price.toFixed(2)}</p>
                <p className="text-xs text-gray-400">Calories: {item.calories}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${category.name}"? This will also delete all menu items in this category.`}
        confirmText="Delete"
      />
    </div>
  );
};

export default CategoryDetails;