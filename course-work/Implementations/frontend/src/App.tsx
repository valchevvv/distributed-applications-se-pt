import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { CategoryProvider } from './contexts/CategoryContext';
import { MenuItemProvider } from './contexts/MenuItemContext';
import { TableProvider } from './contexts/TableContext';
import { EmployeeProvider } from './contexts/EmployeeContext';
import { OrderProvider } from './contexts/OrderContext';
import { useAuth } from './hooks/useAuth';

import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import CategoryDetails from './pages/CategoryDetails';
import CategoryForm from './pages/CategoryForm';
import MenuItems from './pages/MenuItems';
import MenuItemDetails from './pages/MenuItemDetails';
import MenuItemForm from './pages/MenuItemForm';
import Tables from './pages/Tables';
import TableDetails from './pages/TableDetails';
import TableForm from './pages/TableForm';
import Employees from './pages/Employees';
import EmployeeDetails from './pages/EmployeeDetails';
import EmployeeForm from './pages/EmployeeForm';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import CreateOrder from './pages/CreateOrder';

const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? element : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<PrivateRoute element={<Layout />} />}>
        <Route index element={<Dashboard />} />
        
        <Route path="categories">
          <Route index element={<Categories />} />
          <Route path="create" element={<CategoryForm />} />
          <Route path=":id" element={<CategoryDetails />} />
          <Route path=":id/edit" element={<CategoryForm />} />
        </Route>

        <Route path="menu-items">
          <Route index element={<MenuItems />} />
          <Route path="create" element={<MenuItemForm />} />
          <Route path=":id" element={<MenuItemDetails />} />
          <Route path=":id/edit" element={<MenuItemForm />} />
        </Route>

        <Route path="tables">
          <Route index element={<Tables />} />
          <Route path="create" element={<TableForm />} />
          <Route path=":id" element={<TableDetails />} />
          <Route path=":id/edit" element={<TableForm />} />
        </Route>

        <Route path="employees">
          <Route index element={<Employees />} />
          <Route path="create" element={<EmployeeForm />} />
          <Route path=":id" element={<EmployeeDetails />} />
          <Route path=":id/edit" element={<EmployeeForm />} />
        </Route>

        <Route path="orders">
          <Route index element={<Orders />} />
          <Route path="create" element={<CreateOrder />} />
          <Route path=":id" element={<OrderDetails />} />
        </Route>
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CategoryProvider>
          <MenuItemProvider>
            <TableProvider>
              <EmployeeProvider>
                <OrderProvider>
                  <AppRoutes />
                  <Toaster 
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: '#363636',
                        color: '#fff',
                      },
                    }}
                  />
                </OrderProvider>
              </EmployeeProvider>
            </TableProvider>
          </MenuItemProvider>
        </CategoryProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;