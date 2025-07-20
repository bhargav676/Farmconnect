import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './Login';
import Register from './Register';
import RegisterFarmer from './RegisterFarmer';
import AdminDashboard from './admin/AdminDashboard';
import FarmerDashboard from './farmer/FarmerDashboard';
import CustomerDashboard from './customer/CustomerDashboard';
import PrivateRoute from './PrivateRoute';
import ErrorBoundary from './ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register-farmer" element={<RegisterFarmer />} />
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute roles={['Admin']}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/farmer/dashboard"
              element={
                <PrivateRoute roles={['Farmer']}>
                  <FarmerDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/customer/dashboard"
              element={
                <PrivateRoute roles={['Customer']}>
                  <CustomerDashboard />
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;