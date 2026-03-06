import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiHome, 
  FiGrid, 
  FiCoffee, 
  FiUsers, 
  FiShoppingBag, 
  FiCalendar,
  FiX 
} from 'react-icons/fi';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    { path: '/', icon: FiHome, label: 'Dashboard' },
    { path: '/categories', icon: FiGrid, label: 'Categories' },
    { path: '/menu-items', icon: FiCoffee, label: 'Menu Items' },
    { path: '/tables', icon: FiGrid, label: 'Tables' },
    { path: '/employees', icon: FiUsers, label: 'Employees' },
    { path: '/orders', icon: FiShoppingBag, label: 'Orders' },
    { path: '/orders/create', icon: FiCalendar, label: 'New Order' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white shadow-lg z-30 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:w-64 w-64`}
      >
        <div className="flex items-center justify-between p-4 border-b md:hidden">
          <span className="font-semibold text-lg">Menu</span>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => onClose()}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;