import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CustomerProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
    role: '',
    farmerStatus: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [token, navigate]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Fetched profile data:', response.data); // Debug log
      setProfile({
        name: response.data.name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        address: {
          street: response.data.address?.street || '',
          city: response.data.address?.city || '',
          state: response.data.address?.state || '',
          postalCode: response.data.address?.postalCode || '',
          country: response.data.address?.country || '',
        },
        role: response.data.role || '',
        farmerStatus: response.data.farmerStatus || null,
      });
      setError(null);
    } catch (err) {
      console.error('Fetch profile error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Error fetching profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('address.')) {
      const field = name.split('.')[1];
      setProfile((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      setError('Please enter a valid email address.');
      toast.error('Invalid email format.', { position: 'top-right', autoClose: 3000 });
      return;
    }
    if (profile.phone && !/^\d{10}$/.test(profile.phone)) {
      setError('Phone number must be 10 digits.');
      toast.error('Phone number must be 10 digits.', { position: 'top-right', autoClose: 3000 });
      return;
    }
    if (profile.address.postalCode && !/^\d{6}$/.test(profile.address.postalCode)) {
      setError('Postal code must be 6 digits.');
      toast.error('Postal code must be 6 digits.', { position: 'top-right', autoClose: 3000 });
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.put(
        'http://localhost:5000/api/auth/profile',
        profile,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Updated profile response:', response.data);
      setProfile({
        name: response.data.name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        address: {
          street: response.data.address?.street || '',
          city: response.data.address?.city || '',
          state: response.data.address?.state || '',
          postalCode: response.data.address?.postalCode || '',
          country: response.data.address?.country || '',
        },
        role: response.data.role || '',
        farmerStatus: response.data.farmerStatus || null,
      });
      setIsEditing(false);
      toast.success('Profile updated successfully!', {
        position: 'top-right',
        autoClose: 3000,
        icon: '✅',
      });
    } catch (err) {
      console.error('Update profile error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Error updating profile. Please try again.');
      toast.error(err.response?.data?.message || 'Error updating profile.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('cart');
    localStorage.removeItem('location');
    navigate('/login');
    toast.info('Logged out successfully!', {
      position: 'top-right',
      autoClose: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <ToastContainer />
      <header className="mb-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900 font-[Playfair Display]">
              Your Profile
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-300"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-300"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      {error && (
        <div className="container mx-auto px-4 bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-lg flex items-start">
          <svg
            className="w-5 h-5 text-red-500 mr-3 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1">
            <p className="text-red-800">{error}</p>
            <button
              onClick={fetchProfile}
              className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Try again
            </button>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 mb-12">
        {isLoading ? (
          <div className="text-center py-12">
            <ClipLoader color="#10B981" size={40} />
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-6 max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0 h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mr-4">
                <span className="text-2xl text-emerald-600 font-medium">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 font-[Playfair Display]">
                  {profile.name || 'User Profile'}
                </h2>
                <p className="text-sm text-gray-500">
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                  {profile.role === 'farmer' && profile.farmerStatus
                    ? ` (${profile.farmerStatus.charAt(0).toUpperCase() + profile.farmerStatus.slice(1)})`
                    : ''}
                </p>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="ml-auto px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-all duration-300"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border border-emerald-200 rounded-md focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border border-emerald-200 rounded-md focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border border-emerald-200 rounded-md focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50"
                    placeholder="10-digit phone number"
                  />
                </div>
                <div>
                  <label htmlFor="address.street" className="block text-sm font-medium text-gray-700">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={profile.address.street}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border border-emerald-200 rounded-md focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50"
                  />
                </div>
                <div>
                  <label htmlFor="address.city" className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    name="address.city"
                    value={profile.address.city}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border border-emerald-200 rounded-md focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50"
                  />
                </div>
                <div>
                  <label htmlFor="address.state" className="block text-sm font-medium text-gray-700">
                    State
                  </label>
                  <input
                    type="text"
                    name="address.state"
                    value={profile.address.state}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border border-emerald-200 rounded-md focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50"
                  />
                </div>
                <div>
                  <label htmlFor="address.postalCode" className="block text-sm font-medium text-gray-700">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="address.postalCode"
                    value={profile.address.postalCode}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border border-emerald-200 rounded-md focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50"
                    placeholder="6-digit postal code"
                  />
                </div>
                <div>
                  <label htmlFor="address.country" className="block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <input
                    type="text"
                    name="address.country"
                    value={profile.address.country}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border border-emerald-200 rounded-md focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50"
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    {isLoading ? <ClipLoader color="#fff" size={20} /> : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p className="mt-1 text-gray-900">{profile.name || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1 text-gray-900">{profile.email || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                  <p className="mt-1 text-gray-900">{profile.phone || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Address</h3>
                  <p className="mt-1 text-gray-900">
                    {profile.address.street && profile.address.city && profile.address.state ? (
                      <>
                        {profile.address.street}, {profile.address.city}, {profile.address.state}
                        {profile.address.postalCode ? `, ${profile.address.postalCode}` : ''},{' '}
                        {profile.address.country || 'Not provided'}
                      </>
                    ) : (
                      'Not provided'
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Role</h3>
                  <p className="mt-1 text-gray-900">
                    {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                    {profile.role === 'farmer' && profile.farmerStatus
                      ? ` (${profile.farmerStatus.charAt(0).toUpperCase() + profile.farmerStatus.slice(1)})`
                      : ''}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <footer className="container mx-auto px-4 mt-12 border-t border-emerald-200 pt-8">
        <p className="text-center text-sm text-gray-500">
          © {new Date().getFullYear()} FarmDirect. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default CustomerProfile;