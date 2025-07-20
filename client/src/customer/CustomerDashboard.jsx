// components/CustomerDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CustomerDashboard = () => {
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [crops, setCrops] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [error, setError] = useState(null);
  const [quantityInputs, setQuantityInputs] = useState({});
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [activeTab, setActiveTab] = useState('nearby');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      fetchPurchases();
    }
  }, [token]);

  const fetchLocation = () => {
    setIsLoadingLocation(true);
    setError(null);
    setCrops([]);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          setIsLoadingLocation(false);
          fetchNearbyCrops(latitude, longitude);
        },
        (err) => {
          setError('Unable to retrieve location. Please allow location access or try again.');
          setIsLoadingLocation(false);
          console.error('Geolocation error:', err);
        }
      );
    } else {
      setError('Geolocation not supported by your browser.');
      setIsLoadingLocation(false);
    }
  };

  const fetchNearbyCrops = async (latitude, longitude) => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/crops/nearby-crops',
        {
          latitude,
          longitude,
          maxDistance: 50,
        }
      );
      setCrops(response.data.crops);
      setError(null);
    } catch (err) {
      console.error('Fetch crops error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Error fetching crops. Please try again.');
    }
  };

  const fetchPurchases = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/purchases', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPurchases(response.data);
    } catch (err) {
      console.error('Fetch purchases error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Error fetching purchases. Please try again.');
    }
  };

  const handleQuantityChange = (cropId, value) => {
    setQuantityInputs((prev) => ({
      ...prev,
      [cropId]: value,
    }));
  };

  const handlePurchase = async (cropId, farmerId, availableQuantity) => {
    const quantity = parseInt(quantityInputs[cropId] || 0);
    if (quantity <= 0 || quantity > availableQuantity) {
      setError(`Please enter a valid quantity (1 to ${availableQuantity}).`);
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/purchases',
        { cropId, quantity, farmerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setError(null);
      toast.success(response.data.message, {
        position: 'top-right',
        autoClose: 3000,
      });
      if (location.latitude && location.longitude) {
        await fetchNearbyCrops(location.latitude, location.longitude);
      }
      await fetchPurchases();
      setQuantityInputs((prev) => ({ ...prev, [cropId]: '' }));
    } catch (err) {
      console.error('Purchase error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Error making purchase.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <ToastContainer />

      {/* Header with Navigation */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              FarmDirect <span className="text-green-600">Marketplace</span>
            </h1>
            <p className="text-gray-600">Fresh produce directly from local farmers</p>
          </div>
          
          <button
            onClick={fetchLocation}
            disabled={isLoadingLocation}
            className="flex items-center bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-md transition-all duration-300 mt-4 md:mt-0"
          >
            {isLoadingLocation ? (
              <ClipLoader color="#fff" size={20} className="mr-2" />
            ) : (
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
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            )}
            {isLoadingLocation ? 'Locating...' : 'Find Nearby Crops'}
          </button>
        </div>

        {/* Location Display */}
        {location.latitude && location.longitude && (
          <div className="bg-white p-4 rounded-lg shadow-sm inline-flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">
              Your location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </span>
          </div>
        )}
      </header>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-lg flex items-start">
          <svg className="w-5 h-5 text-red-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-red-800">{error}</p>
            <button 
              onClick={fetchLocation}
              className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('nearby')}
            className={`py-4 px-1 font-medium text-sm border-b-2 ${activeTab === 'nearby' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Nearby Crops
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={`py-4 px-1 font-medium text-sm border-b-2 ${activeTab === 'purchases' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            My Purchases
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mb-12">
        {activeTab === 'nearby' ? (
          <>
            {!location.latitude && !location.longitude && !error && (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">Discover local crops</h3>
                <p className="mt-1 text-gray-500">Click "Find Nearby Crops" to see fresh produce available near you.</p>
              </div>
            )}

            {crops.length === 0 && location.latitude && !error && (
              <div className="text-center py-12">
                <ClipLoader color="#10B981" size={40} />
                <p className="mt-4 text-gray-600">Finding fresh crops near you...</p>
              </div>
            )}

            {crops.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {crops.map((farmer) => (
                  <div key={farmer.farmerId} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-green-600 font-medium text-lg">
                            {farmer.farmerName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">{farmer.farmerName}</h3>
                          <p className="text-sm text-gray-500">
                            {farmer.farmerDetails.villageMandal}, {farmer.farmerDetails.district}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {farmer.crops.map((crop) => (
                          <div key={crop._id} className="border-t border-gray-100 pt-4">
                            <div className="flex">
                              <img
                                src={crop.image || 'https://via.placeholder.com/100'}
                                alt={crop.name}
                                className="h-20 w-20 rounded-md object-cover"
                              />
                              <div className="ml-4 flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-lg font-medium text-gray-900">{crop.name}</h4>
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    {crop.distance} km
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500">
                                  Available: {crop.quantity} {crop.unit}
                                </p>
                                <div className="mt-2 flex items-center justify-between">
                                  <span className="text-lg font-bold text-green-600">₹{crop.price}</span>
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="number"
                                      min="1"
                                      max={crop.quantity}
                                      value={quantityInputs[crop._id] || ''}
                                      onChange={(e) => handleQuantityChange(crop._id, e.target.value)}
                                      placeholder="Qty"
                                      className="w-16 p-1 border border-gray-300 rounded-md text-center focus:ring-green-500 focus:border-green-500"
                                    />
                                    <button
                                      onClick={() => handlePurchase(crop._id, farmer.farmerId, crop.quantity)}
                                      disabled={!quantityInputs[crop._id] || quantityInputs[crop._id] <= 0}
                                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      Buy
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="bg-white shadow overflow-hidden rounded-xl">
            {purchases.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No purchases yet</h3>
                <p className="mt-1 text-gray-500">Buy some fresh crops from local farmers to see them here.</p>
                <div className="mt-6">
                  <button
                    onClick={() => setActiveTab('nearby')}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                  >
                    Browse crops
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Crop
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Farmer
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {purchases.map((purchase) => (
                      <tr key={purchase._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img className="h-10 w-10 rounded-full" src={purchase.cropImage || 'https://via.placeholder.com/40'} alt={purchase.cropName} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{purchase.cropName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{purchase.farmerId.name}</div>
                          <div className="text-sm text-gray-500">{purchase.farmerId.district}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {purchase.quantity} {purchase.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{purchase.totalPrice}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            purchase.status === 'delivered' 
                              ? 'bg-green-100 text-green-800' 
                              : purchase.status === 'confirmed' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {purchase.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(purchase.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 pt-8">
        <p className="text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} FarmDirect. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default CustomerDashboard;