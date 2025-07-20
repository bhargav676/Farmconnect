import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const FarmerDashboard = () => {
  const { user, setUser, logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [cropList, setCropList] = useState([]);
  const [formData, setFormData] = useState({
    cropName: '',
    quantity: '',
    price: '',
    imageUrl: '',
    type: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Get token from localStorage
  const token = localStorage.getItem('token');

  // Debug token and user
  useEffect(() => {
    console.log('AuthContext - User:', user);
    console.log('Token from localStorage:', token);
  }, [user, token]);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        console.error('No token available, redirecting to login');
        setError('Please log in to continue');
        logout();
        navigate('/login');
        return;
      }

      try {
        const res = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Fetched user data:', res.data);
        setUser(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch user:', err.response?.data || err.message);
        setError('Failed to load user data. Please log in again.');
        logout();
        navigate('/login');
      }
    };

    if (!user) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [user, setUser, navigate, logout, token]);

  // Fetch crop list from api.json
  useEffect(() => {
    const fetchCropList = async () => {
      try {
        const response = await fetch('/api.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched crop list:', data);
        setCropList(data);
      } catch (err) {
        console.error('Failed to fetch crop list:', err.message);
        setError('Failed to load crop list');
      }
    };
    fetchCropList();
  }, []);

  // Handle crop selection
  const handleCropSelect = (e) => {
    const selectedCrop = cropList.find((crop) => crop.name === e.target.value);
    if (selectedCrop) {
      setFormData({
        ...formData,
        cropName: selectedCrop.name,
        imageUrl: selectedCrop.image,
        type: selectedCrop.type,
      });
    } else {
      setFormData({ ...formData, cropName: '', imageUrl: '', type: '' });
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.cropName || !formData.quantity || !formData.price || !formData.imageUrl || !formData.type || !user?._id) {
      setError('All fields are required');
      toast.error('All fields are required');
      return;
    }

    if (!token) {
      setError('Authentication token missing. Please log in again.');
      toast.error('Authentication token missing. Please log in again.');
      logout();
      navigate('/login');
      return;
    }

    try {
      console.log('Posting crop with payload:', { ...formData, farmerId: user._id });
      const res = await axios.post(
        'http://localhost:5000/api/auth/crop',
        { ...formData, farmerId: user._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Post crop response:', res.data);
      setSuccess(res.data.message);
      toast.success(res.data.message);
      setFormData({ cropName: '', quantity: '', price: '', imageUrl: '', type: '' });
    } catch (err) {
      console.error('Error posting crop:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setError('Session expired or invalid token. Please log in again.');
        toast.error('Session expired. Please log in again.');
        logout();
        navigate('/login');
      } else {
        const message = err.response?.data?.message || 'Failed to post crop';
        setError(message);
        toast.error(message);
      }
    }
  };

  if (loading) {
    return <p className="text-center mt-4">Loading user info...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h2 className="text-3xl font-bold text-center mb-6">Farmer Dashboard</h2>
      <p className="text-center mb-4">Welcome, {user?.name}! Manage your farm products here.</p>

      <div className="mt-6 text-center bg-white p-4 rounded shadow-md">
        <p>User ID: {user?._id}</p>
      </div>

      {/* Crop Posting Form */}
      <div className="mt-8 max-w-md mx-auto bg-white p-6 rounded shadow-md">
        <h3 className="text-xl font-semibold mb-4">Post a Crop</h3>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Select Crop</label>
            <select
              name="cropName"
              value={formData.cropName}
              onChange={handleCropSelect}
              className="w-full p-2 border rounded"
            >
              <option value="">Select a crop</option>
              {cropList.map((crop) => (
                <option key={crop.name} value={crop.name}>
                  {crop.name} ({crop.type})
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Quantity (kg)</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              placeholder="Enter quantity"
              min="0"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Price (per kg)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              placeholder="Enter price"
              min="0"
              step="0.01"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
          >
            Post Crop
          </button>
        </form>
      </div>

      <div className="text-center mt-6">
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default FarmerDashboard;