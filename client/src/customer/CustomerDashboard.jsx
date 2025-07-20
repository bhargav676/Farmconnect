import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const CustomerDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user || user.role !== 'Customer') {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h2 className="text-3xl font-bold text-center mb-6">Customer Dashboard</h2>
      <p className="text-center">Welcome, Customer! Browse farm products here.</p>
      <button
        onClick={logout}
        className="mt-4 bg-red-500 text-white p-2 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
};

export default CustomerDashboard;