import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTables } from '../../hooks/useTables';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiX } from 'react-icons/fi';

const tableSchema = z.object({
  number: z.number().min(1, 'Table number is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  zone: z.string().max(30, 'Zone must be less than 30 characters').nullable(),
  isAvailable: z.boolean(),
  lastCleaned: z.string(),
});

type TableFormData = z.infer<typeof tableSchema>;

const TableForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTable, createTable, updateTable, loading } = useTables();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TableFormData>({
    resolver: zodResolver(tableSchema),
    defaultValues: {
      number: 0,
      capacity: 2,
      zone: '',
      isAvailable: true,
      lastCleaned: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (id) {
      loadTable();
    }
  }, [id]);

  const loadTable = async () => {
    if (!id) return;
    const table = await getTable(parseInt(id));
    if (table) {
      setValue('number', table.number);
      setValue('capacity', table.capacity);
      setValue('zone', table.zone || '');
      setValue('isAvailable', table.isAvailable);
      setValue('lastCleaned', new Date(table.lastCleaned).toISOString().split('T')[0]);
    }
  };

  const onSubmit = async (data: TableFormData) => {
    let success;
    if (id) {
      success = await updateTable(parseInt(id), data);
    } else {
      success = await createTable(data);
    }

    if (success) {
      navigate('/tables');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {id ? 'Edit Table' : 'Create New Table'}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Table Number *
              </label>
              <input
                {...register('number', { valueAsNumber: true })}
                type="number"
                min="1"
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.number && (
                <p className="mt-1 text-sm text-red-600">{errors.number.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity *
              </label>
              <input
                {...register('capacity', { valueAsNumber: true })}
                type="number"
                min="1"
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.capacity && (
                <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zone
            </label>
            <input
              {...register('zone')}
              type="text"
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Terrace, Inside, VIP"
            />
            {errors.zone && (
              <p className="mt-1 text-sm text-red-600">{errors.zone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Cleaned Date
            </label>
            <input
              {...register('lastCleaned')}
              type="date"
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              {...register('isAvailable')}
              type="checkbox"
              id="isAvailable"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-900">
              Available for seating
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/tables')}
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
              {loading ? 'Saving...' : 'Save Table'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TableForm;