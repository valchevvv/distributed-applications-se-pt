import React, { useEffect, useState } from 'react';
import { useOrders } from '../hooks/useOrders';
import { useTables } from '../hooks/useTables';
import { useEmployees } from '../hooks/useEmployees';
import { useMenuItems } from '../hooks/useMenuItems';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiMinus, FiTrash2, FiShoppingCart, FiUser, FiGrid } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface CartItem {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
  note: string;
}

const CreateOrder: React.FC = () => {
  const navigate = useNavigate();
  const { createOrder, addItem, calculateTotal } = useOrders();
  const { tables, fetchTables } = useTables();
  const { employees, fetchEmployees } = useEmployees();
  const { menuItems, fetchMenuItems } = useMenuItems();

  const [selectedTable, setSelectedTable] = useState<number | ''>('');
  const [selectedEmployee, setSelectedEmployee] = useState<number | ''>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState<number | ''>('');
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    fetchTables(1, 100);
    fetchEmployees(1, 100);
    fetchMenuItems(1, 100);
  }, []);

  const handleAddToCart = () => {
    if (!selectedMenuItem) {
      toast.error('Please select a menu item');
      return;
    }

    const menuItem = menuItems.find(item => item.id === Number(selectedMenuItem));
    if (!menuItem) return;

    const existingItem = cart.find(item => item.menuItemId === menuItem.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.menuItemId === menuItem.id 
          ? { ...item, quantity: item.quantity + quantity, note: note || item.note }
          : item
      ));
    } else {
      setCart([
        ...cart,
        {
          menuItemId: menuItem.id,
          name: menuItem.title,
          price: menuItem.price,
          quantity,
          note,
        },
      ]);
    }

    setSelectedMenuItem('');
    setQuantity(1);
    setNote('');
  };

  const handleRemoveFromCart = (menuItemId: number) => {
    setCart(cart.filter(item => item.menuItemId !== menuItemId));
  };

  const handleUpdateQuantity = (menuItemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCart(cart.map(item =>
      item.menuItemId === menuItemId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.1;
  };

  const handleCreateOrder = async () => {
    if (!selectedTable || !selectedEmployee) {
      toast.error('Please select table and employee');
      return;
    }

    if (cart.length === 0) {
      toast.error('Please add items to the order');
      return;
    }

    setLoading(true);
    try {
      const order = await createOrder({
        tableId: Number(selectedTable),
        employeeId: Number(selectedEmployee),
        status: 'New',
      });

      if (!order) {
        throw new Error('Failed to create order');
      }

      for (const item of cart) {
        await addItem(order.id, {
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          note: item.note || undefined,
        });
      }

      await calculateTotal(order.id);

      toast.success('Order created successfully!');
      navigate(`/orders/${order.id}`);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const availableTables = tables.filter(t => t.isAvailable);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Create New Order</h1>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${step === 1 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
            Step 1: Details
          </span>
          <span className="text-gray-400">→</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${step === 2 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
            Step 2: Items
          </span>
        </div>
      </div>

      {step === 1 ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Order Details</h2>
          
          <div className="space-y-6">
            {/* Table Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Table
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {availableTables.map((table) => (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTable(table.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedTable === table.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FiGrid className={`mx-auto mb-2 ${selectedTable === table.id ? 'text-blue-500' : 'text-gray-400'}`} size={24} />
                    <div className="text-center">
                      <div className="font-medium">Table {table.number}</div>
                      <div className="text-xs text-gray-500">Capacity: {table.capacity}</div>
                      {table.zone && <div className="text-xs text-gray-400">{table.zone}</div>}
                    </div>
                  </button>
                ))}
              </div>
              {availableTables.length === 0 && (
                <p className="text-center text-gray-500 py-4">No available tables</p>
              )}
            </div>

            {/* Employee Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Server
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {employees.filter(e => e.role === 'Waiter').map((employee) => (
                  <button
                    key={employee.id}
                    onClick={() => setSelectedEmployee(employee.id)}
                    className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                      selectedEmployee === employee.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FiUser className={selectedEmployee === employee.id ? 'text-blue-500' : 'text-gray-400'} size={20} />
                    <div className="text-left">
                      <div className="font-medium">{employee.fullName}</div>
                      <div className="text-xs text-gray-500">Phone: +{employee.phone}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!selectedTable || !selectedEmployee}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Items
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Item Selection */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Add Items</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g., no onions, extra sauce..."
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!selectedMenuItem}
                  className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <FiPlus />
                  Add to Order
                </button>
              </div>
            </div>

            {/* Cart Items */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Current Order Items</h2>
              
              {cart.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No items added yet</p>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.menuItemId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        {item.note && <div className="text-sm text-gray-500">Note: {item.note}</div>}
                        <div className="text-sm text-gray-600">${item.price.toFixed(2)} each</div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.menuItemId, item.quantity - 1)}
                            className="p-1 rounded-md bg-gray-200 hover:bg-gray-300"
                          >
                            <FiMinus size={16} />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.menuItemId, item.quantity + 1)}
                            className="p-1 rounded-md bg-gray-200 hover:bg-gray-300"
                          >
                            <FiPlus size={16} />
                          </button>
                        </div>
                        
                        <div className="w-24 text-right font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                        
                        <button
                          onClick={() => handleRemoveFromCart(item.menuItemId)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (10%):</span>
                  <span className="font-medium">${calculateTax().toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-semibold">
                  <span>Total:</span>
                  <span className="text-lg">
                    ${(calculateSubtotal() + calculateTax()).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setStep(1)}
                  className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back to Details
                </button>
                
                <button
                  onClick={handleCreateOrder}
                  disabled={cart.length === 0 || loading}
                  className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <FiShoppingCart />
                  {loading ? 'Creating Order...' : 'Create Order'}
                </button>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                <p>Table: {tables.find(t => t.id === selectedTable)?.number || 'Not selected'}</p>
                <p>Server: {employees.find(e => e.id === selectedEmployee)?.fullName || 'Not selected'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateOrder;