import React, { useEffect, useState } from 'react';
import { useOrders } from '../hooks/useOrders';
import { useCategories } from '../hooks/useCategories';
import { useMenuItems } from '../hooks/useMenuItems';
import { useTables } from '../hooks/useTables';
import { useEmployees } from '../hooks/useEmployees';
import { Link } from 'react-router-dom';
import {
  FiGrid,
  FiCoffee,
  FiUsers,
  FiShoppingBag,
  FiDollarSign,
  FiClock,
  FiCheckCircle,
} from 'react-icons/fi';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const { orders, fetchOrders } = useOrders();
  const { categories, fetchCategories } = useCategories();
  const { menuItems, fetchMenuItems } = useMenuItems();
  const { tables, fetchTables } = useTables();
  const { employees, fetchEmployees } = useEmployees();

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeTables: 0,
    availableItems: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });

  useEffect(() => {
    fetchOrders(1, 100);
    fetchCategories(1, 100);
    fetchMenuItems(1, 100);
    fetchTables(1, 100);
    fetchEmployees(1, 100);
  }, []);

  useEffect(() => {
    if (orders.length) {
      const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
      const pendingOrders = orders.filter(o => o.status === 'New').length;
      const completedOrders = orders.filter(o => o.status === 'Served').length;

      setStats(prev => ({
        ...prev,
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders,
        completedOrders,
      }));
    }

    if (tables.length) {
      setStats(prev => ({
        ...prev,
        activeTables: tables.filter(t => t.isAvailable).length,
      }));
    }

    if (menuItems.length) {
      setStats(prev => ({
        ...prev,
        availableItems: menuItems.filter(m => m.isAvailable).length,
      }));
    }
  }, [orders, tables, menuItems]);

  const recentOrders = orders.slice(0, 5);

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: FiShoppingBag,
      color: 'bg-blue-500',
      link: '/orders',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: FiDollarSign,
      color: 'bg-green-500',
      link: '/orders',
    },
    {
      title: 'Active Tables',
      value: `${stats.activeTables}/${tables.length}`,
      icon: FiGrid,
      color: 'bg-purple-500',
      link: '/tables',
    },
    {
      title: 'Available Items',
      value: stats.availableItems,
      icon: FiCoffee,
      color: 'bg-yellow-500',
      link: '/menu-items',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: FiClock,
      color: 'bg-orange-500',
      link: '/orders',
    },
    {
      title: 'Completed Today',
      value: stats.completedOrders,
      icon: FiCheckCircle,
      color: 'bg-teal-500',
      link: '/orders',
    },
  ];

  const quickLinks = [
    { title: 'Categories', count: categories.length, icon: FiGrid, link: '/categories' },
    { title: 'Menu Items', count: menuItems.length, icon: FiCoffee, link: '/menu-items' },
    { title: 'Tables', count: tables.length, icon: FiGrid, link: '/tables' },
    { title: 'Employees', count: employees.length, icon: FiUsers, link: '/employees' },
  ];

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'New': 'bg-yellow-100 text-yellow-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Served': 'bg-green-100 text-green-800',
      'Paid': 'bg-purple-100 text-purple-800',
      'Cancelled': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          to="/orders/create"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          New Order
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-semibold mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-full text-white`}>
                <stat.icon size={24} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickLinks.map((link, index) => (
            <Link
              key={index}
              to={link.link}
              className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <link.icon className="text-gray-600 mb-2" size={24} />
              <span className="text-sm text-gray-600">{link.title}</span>
              <span className="text-lg font-semibold text-gray-900">{link.count}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Link to="/orders" className="text-blue-500 hover:text-blue-700 text-sm">
            View All
          </Link>
        </div>

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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/orders/${order.id}`} className="text-sm font-medium text-gray-900">
                      #{order.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Table {order.table.number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.waiter.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${order.totalPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(order.orderTime), 'HH:mm')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {recentOrders.length === 0 && (
            <p className="text-center text-gray-500 py-4">No recent orders</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;