import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import RegisterFarmer from './components/RegisterFarmer';
import AdminDashboard from './components/AdminDashboard';
import FarmerDashboard from './components/FarmerDashboard';
import CustomerDashboard from './components/CustomerDashboard';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
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
  );
}

export default App;