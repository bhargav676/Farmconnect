import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [isLoadingCrops, setIsLoadingCrops] = useState(false);
  const [activeTab, setActiveTab] = useState('nearby');
  const [cartCount, setCartCount] = useState(0);
  const [maxDistance, setMaxDistance] = useState(50);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.length);
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    fetchPurchases();
    updateCartCount();

    const storedLocation = JSON.parse(localStorage.getItem('location') || '{}');
    if (storedLocation.latitude && storedLocation.longitude) {
      setLocation(storedLocation);
      fetchNearbyCrops(storedLocation.latitude, storedLocation.longitude);
    } else {
      fetchLocation();
    }

    const handleStorageChange = () => {
      if (storedLocation.latitude && storedLocation.longitude) {
        fetchNearbyCrops(storedLocation.latitude, storedLocation.longitude);
      }
      updateCartCount();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [token, navigate]);

  const flattenedCrops = crops.reduce((acc, farmer) => {
    if (
      !farmer ||
      !farmer.crops ||
      !farmer.farmerName ||
      !farmer.farmerId ||
      !farmer.farmerDetails ||
      !farmer.farmerDetails.villageMandal ||
      !farmer.farmerDetails.district
    ) {
      console.warn('Skipping invalid farmer data:', farmer);
      return acc;
    }
    farmer.crops.forEach((crop) => {
      acc.push({
        ...crop,
        farmerInfo: {
          name: farmer.farmerName,
          id: farmer.farmerId,
          village: farmer.farmerDetails.villageMandal,
          district: farmer.farmerDetails.district,
        },
      });
    });
    return acc;
  }, []);

  const fetchLocation = () => {
    setIsLoadingLocation(true);
    setError(null);
    setCrops([]);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          localStorage.setItem('location', JSON.stringify({ latitude, longitude }));
          setIsLoadingLocation(false);
          fetchNearbyCrops(latitude, longitude);
          toast.info('Location fetched successfully!', {
            position: 'top-right',
            autoClose: 3000,
            icon: '📍',
          });
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
    setIsLoadingCrops(true);
    try {
      const response = await axios.post(
        'http://localhost:5000/api/crops/nearby-crops',
        { latitude, longitude, maxDistance },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Fetched crops:', response.data.crops);
      setCrops(response.data.crops);
      setError(null);
    } catch (err) {
      console.error('Fetch crops error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Error fetching crops. Please try again.');
    } finally {
      setIsLoadingCrops(false);
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

  const updateCropQuantity = async (cropId, newQuantity) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/crops/${cropId}`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Update crop quantity error:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || 'Error updating crop quantity.');
    }
  };

  const handleQuantityChange = (cropId, value) => {
    setQuantityInputs((prev) => ({
      ...prev,
      [cropId]: value,
    }));
  };

  const handleAddToCart = async (crop) => {
    if (crop.quantity === 0) {
      toast.error(`${crop.name} is out of stock!`, {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }
    const quantity = parseInt(quantityInputs[crop._id] || 0);
    if (quantity <= 0 || quantity > crop.quantity) {
      setError(`Please enter a valid quantity (1 to ${crop.quantity}).`);
      return;
    }

    try {
      setCrops((prevCrops) =>
        prevCrops.map((farmer) => ({
          ...farmer,
          crops: farmer.crops.map((c) =>
            c._id === crop._id ? { ...c, quantity: c.quantity - quantity } : c
          ),
        }))
      );

      await updateCropQuantity(crop._id, crop.quantity - quantity);

      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const cartItem = {
        cropId: crop._id,
        farmerId: crop.farmerInfo.id,
        cropName: crop.name,
        unit: crop.unit,
        quantity,
        originalQuantity: crop.quantity,
        price: crop.price,
        total: crop.price * quantity,
        farmerName: crop.farmerInfo.name,
        village: crop.farmerInfo.village,
        district: crop.farmerInfo.district,
        image: crop.image,
      };

      const updatedCart = [...existingCart, cartItem];
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      window.dispatchEvent(new Event('storage'));

      setQuantityInputs((prev) => ({ ...prev, [crop._id]: '' }));
      toast.success(`${crop.name} added to cart!`, {
        position: 'top-right',
        autoClose: 3000,
        icon: '🌾',
      });
      navigate('/cart');
    } catch (err) {
      setError(err.message);
      setCrops(crops);
      toast.error(err.message, {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <ToastContainer />
      <header className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 container mx-auto px-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 font-[Playfair Display]">
              FarmDirect <span className="text-emerald-600">Marketplace</span>
            </h1>
            <p className="text-gray-600">Fresh produce directly from local farmers</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <select
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="p-2 border border-emerald-200 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value={10}>10 km</option>
              <option value={50}>50 km</option>
              <option value={100}>100 km</option>
            </select>
            <button
              onClick={fetchLocation}
              disabled={isLoadingLocation}
              className="flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg shadow-md transition-all duration-300"
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
              {isLoadingLocation ? 'Locating...' : 'Update Location'}
            </button>
            <button
              onClick={() => navigate('/cart')}
              className="relative flex items-center bg-amber-500 hover:bg-amber-600 text-white px-4 py-3 rounded-lg shadow-md transition-all duration-300"
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
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg shadow-md transition-all duration-300"
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Profile
            </button>
          </div>
        </div>
        {location.latitude && location.longitude && (
          <div className="container mx-auto px-4 flex justify-center">
            <div className="bg-emerald-50 p-4 rounded-lg shadow-sm inline-flex items-center">
              <svg
                className="w-5 h-5 text-emerald-600 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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
              <span className="text-sm font-medium text-gray-700">
                Your location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </span>
            </div>
          </div>
        )}
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
              onClick={fetchLocation}
              className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Try again
            </button>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 mb-8 border-b border-emerald-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('nearby')}
            className={`py-4 px-1 font-medium text-sm border-b-2 ${
              activeTab === 'nearby'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-emerald-300'
            }`}
          >
            Nearby Crops
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={`py-4 px-1 font-medium text-sm border-b-2 ${
              activeTab === 'purchases'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-emerald-300'
            }`}
          >
            My Purchases
          </button>
        </nav>
      </div>
      <div className="container mx-auto px-4 mb-12">
        {activeTab === 'nearby' ? (
          <>
            {!location.latitude && !location.longitude && !error && (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900 font-[Playfair Display]">
                  Discover local crops
                </h3>
                <p className="mt-1 text-gray-500">
                  Click "Update Location" to see fresh produce available near you.
                </p>
              </div>
            )}
            {flattenedCrops.length === 0 && location.latitude && !error && isLoadingCrops && (
              <div className="text-center py-12">
                <ClipLoader color="#10B981" size={40} />
                <p className="mt-4 text-gray-600">Finding fresh crops near you...</p>
              </div>
            )}
            {flattenedCrops.length === 0 && location.latitude && !error && !isLoadingCrops && (
              <div className="text-center py-12">
                <p className="text-gray-600">No crops found within {maxDistance} km. Try updating your location or increasing the search radius.</p>
              </div>
            )}
            {flattenedCrops.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {flattenedCrops.map((crop) => (
                  <div
                    key={`${crop._id}-${crop.farmerInfo.id}`}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    <div className="p-6">
                      <div className="mb-4">
                        <img
                          src={crop.image || 'https://via.placeholder.com/300'}
                          alt={crop.name}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                      <div className="mb-4">
                        <h3 className="text-xl font-semibold text-gray-900 mb-1 font-[Playfair Display]">
                          {crop.name}
                        </h3>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-bold text-emerald-600">
                            ₹{crop.price}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                            {crop.distance} km away
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {crop.quantity > 0 ? (
                            `Available: ${crop.quantity} ${crop.unit}`
                          ) : (
                            <span className="text-red-600 font-medium">Out of Stock</span>
                          )}
                        </p>
                        {crop.description && (
                          <p className="text-sm text-gray-500 mt-2">{crop.description}</p>
                        )}
                      </div>
                      <div className="border-t border-emerald-100 pt-4">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Sold by:</h4>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                            <span className="text-emerald-600 font-medium">
                              {crop.farmerInfo.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {crop.farmerInfo.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {crop.farmerInfo.village}, {crop.farmerInfo.district}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 flex items-center justify-between">
                        <input
                          type="number"
                          min="1"
                          max={crop.quantity}
                          value={quantityInputs[crop._id] || ''}
                          onChange={(e) => handleQuantityChange(crop._id, e.target.value)}
                          placeholder="Quantity"
                          className="w-24 p-2 border border-emerald-200 rounded-md focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50"
                          disabled={crop.quantity === 0}
                        />
                        <button
                          onClick={() => handleAddToCart(crop)}
                          disabled={!quantityInputs[crop._id] || quantityInputs[crop._id] <= 0 || crop.quantity === 0}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        >
                          Add to Cart
                        </button>
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
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900 font-[Playfair Display]">
                  No purchases yet
                </h3>
                <p className="mt-1 text-gray-500">
                  Buy some fresh crops from local farmers to see them here.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setActiveTab('nearby')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-all duration-300"
                  >
                    Browse crops
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-emerald-100">
                  <thead className="bg-emerald-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Crop
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Farmer
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Quantity
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Price
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-emerald-100">
                    {purchases.map((purchase) => (
                      <tr key={purchase._id} className="hover:bg-emerald-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-full"
                                src={purchase.image || 'https://via.placeholder.com/40'}
                                alt={purchase.cropName}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {purchase.cropName}
                              </div>
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
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              purchase.status === 'delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : purchase.status === 'confirmed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
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
      <footer className="container mx-auto px-4 mt-12 border-t border-emerald-200 pt-8">
        <p className="text-center text-sm text-gray-500">
          © {new Date().getFullYear()} FarmDirect. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default CustomerDashboard;