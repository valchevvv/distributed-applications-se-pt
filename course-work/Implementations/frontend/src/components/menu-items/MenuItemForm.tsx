import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMenuItems } from '../../hooks/useMenuItems';
import { useCategories } from '../../hooks/useCategories';
import { MenuItem } from '../../types/menu-item.types';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FiSave, FiX } from 'react-icons/fi';

const menuItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  calories: z.number().min(0, 'Calories must be positive'),
  internalBarcode: z.number().min(1, 'Barcode is required'),
  categoryId: z.number().min(1, 'Category is required'),
  isAvailable: z.boolean(),
});

type MenuItemFormData = z.infer<typeof menuItemSchema>;

const MenuItemForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('categoryId');
  
  const navigate = useNavigate();
  const { getMenuItem, createMenuItem, updateMenuItem, loading } = useMenuItems();
  const { categories, fetchCategories } = useCategories();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      title: '',
      price: 0,
      calories: 0,
      internalBarcode: 0,
      categoryId: categoryId ? parseInt(categoryId) : 0,
      isAvailable: true,
    },
  });

  useEffect(() => {
    fetchCategories(1, 100);
    if (id) {
      loadMenuItem();
    }
  }, [id]);

  const loadMenuItem = async () => {
    if (!id) return;
    const item = await getMenuItem(parseInt(id));
    if (item) {
      setValue('title', item.title);
      setValue('price', item.price);
      setValue('calories', item.calories);
      setValue('internalBarcode', item.internalBarcode);
      setValue('categoryId', item.categoryId);
      setValue('isAvailable', item.isAvailable);
    }
  };

  const onSubmit = async (data: MenuItemFormData) => {
    const payload: Partial<MenuItem> = {
      title: data.title,
      price: data.price,
      calories: data.calories,
      internalBarcode: data.internalBarcode,
      categoryId: data.categoryId,
      isAvailable: data.isAvailable,
      orderDetails: [],
    };

    let success;
    if (id) {
      success = await updateMenuItem(parseInt(id), payload);
    } else {
      success = await createMenuItem(payload);
    }

    if (success) {
      navigate('/menu-items');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {id ? 'Edit Menu Item' : 'Create New Menu Item'}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              {...register('title')}
              type="text"
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter item title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price *
              </label>
              <input
                {...register('price', { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Calories
              </label>
              <input
                {...register('calories', { valueAsNumber: true })}
                type="number"
                min="0"
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
              {errors.calories && (
                <p className="mt-1 text-sm text-red-600">{errors.calories.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Internal Barcode *
            </label>
            <input
              {...register('internalBarcode', { valueAsNumber: true })}
              type="number"
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter barcode"
            />
            {errors.internalBarcode && (
              <p className="mt-1 text-sm text-red-600">{errors.internalBarcode.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              {...register('categoryId', { valueAsNumber: true })}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              {...register('isAvailable')}
              type="checkbox"
              id="isAvailable"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-900">
              Available for ordering
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/menu-items')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FiX />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <FiSave />
              {loading ? 'Saving...' : 'Save Menu Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuItemForm;