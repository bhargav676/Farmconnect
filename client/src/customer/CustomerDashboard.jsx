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
  const token = localStorage.getItem('token');

  // Fetch customer's purchases on mount
  useEffect(() => {
    if (token) {
      fetchPurchases();
    }
  }, [token]);

  const fetchLocation = () => {
    setIsLoadingLocation(true);
    setError(null);
    setCrops([]); // Clear previous crops
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
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 p-6">
      {/* Toast Container for Notifications */}
      <ToastContainer />

      {/* Header */}
      <h2 className="text-4xl font-extrabold text-center text-green-800 mb-8 font-serif">
        FarmDirect Dashboard
      </h2>

      {/* Fetch Location Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={fetchLocation}
          disabled={isLoadingLocation}
          className="flex items-center bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 disabled:bg-gray-400 transition-all duration-300 shadow-lg"
        >
          {isLoadingLocation ? (
            <ClipLoader color="#fff" size={24} className="mr-2" />
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
          {isLoadingLocation ? 'Fetching Location...' : 'Fetch My Location'}
        </button>
      </div>

      {/* Current Location Display */}
      {location.latitude && location.longitude && (
        <div className="text-center mb-6 bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-md inline-block">
          <p className="text-gray-700 font-medium">
            Your Location: <span className="font-bold">Lat {location.latitude.toFixed(4)}</span>,{' '}
            <span className="font-bold">Lon {location.longitude.toFixed(4)}</span>
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-600 text-red-800 p-4 mb-6 rounded-lg flex justify-between items-center max-w-3xl mx-auto">
          <span>{error}</span>
          <button
            onClick={fetchLocation}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Nearby Crops Section */}
      <h3 className="text-2xl font-semibold text-green-800 mb-6 font-serif">Fresh Crops Near You</h3>
      {!location.latitude && !location.longitude && !error && (
        <p className="text-gray-600 text-center text-lg">
          Click "Fetch My Location" to discover fresh crops from local farmers!
        </p>
      )}
      {crops.length === 0 && location.latitude && !error && (
        <p className="text-gray-600 text-center text-lg">Loading crops...</p>
      )}
      {crops.length === 0 && error && (
        <p className="text-gray-600 text-center text-lg">No crops found near your location.</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {crops.map((farmer) => (
          <div
            key={farmer.farmerId}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-green-100"
          >
            <h4 className="text-xl font-semibold text-green-800 mb-3 font-serif">
              {farmer.farmerName}
              <span className="text-sm font-normal text-gray-600">
                {' '}
                ({farmer.farmerDetails.villageMandal}, {farmer.farmerDetails.district})
              </span>
            </h4>
            {farmer.crops.map((crop) => (
              <div key={crop._id} className="mb-4 border-t border-green-100 pt-4">
                <img
                  src={crop.image}
                  alt={crop.name}
                  className="w-32 h-32 object-cover rounded-lg mb-3 mx-auto"
                />
                <p className="text-gray-800 font-medium">
                  <span className="text-green-700">{crop.name}</span> - {crop.quantity} {crop.unit}{' '}
                  at <span className="font-bold">₹{crop.price}</span>
                </p>
                <p className="text-gray-600 text-sm">({crop.distance} km away)</p>
                <div className="flex items-center mt-3 space-x-3">
                  <input
                    type="number"
                    min="1"
                    max={crop.quantity}
                    value={quantityInputs[crop._id] || ''}
                    onChange={(e) => handleQuantityChange(crop._id, e.target.value)}
                    placeholder="Qty"
                    className="w-20 p-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-50"
                  />
                  <button
                    onClick={() => handlePurchase(crop._id, farmer.farmerId, crop.quantity)}
                    disabled={!quantityInputs[crop._id] || quantityInputs[crop._id] <= 0}
                    className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 disabled:bg-gray-300 transition-all duration-300"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Purchase History Section */}
      <h3 className="text-2xl font-semibold text-green-800 mt-10 mb-6 font-serif">
        Your Purchase History
      </h3>
      {purchases.length === 0 && (
        <p className="text-gray-600 text-center text-lg">No purchases yet. Start shopping!</p>
      )}
      {purchases.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-xl shadow-md">
          <table className="w-full">
            <thead>
              <tr className="bg-green-700 text-white">
                <th className="p-4 text-left text-sm font-semibold">Crop</th>
                <th className="p-4 text-left text-sm font-semibold">Farmer</th>
                <th className="p-4 text-left text-sm font-semibold">Total Price</th>
                <th className="p-4 text-left text-sm font-semibold">Status</th>
                <th className="p-4 text-left text-sm font-semibold">Purchased On</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((purchase, index) => (
                <tr
                  key={purchase._id}
                  className={`border-b border-green-100 ${
                    index % 2 === 0 ? 'bg-green-50/50' : 'bg-white'
                  } hover:bg-green-100 transition-colors`}
                >
                  <td className="p-4 text-gray-800">
                    {purchase.cropName} ({purchase.quantity} {purchase.unit})
                  </td>
                  <td className="p-4 text-gray-800">{purchase.farmerId.name}</td>
                  <td className="p-4 text-gray-800">₹{purchase.totalPrice}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        purchase.status === 'delivered'
                          ? 'bg-green-200 text-green-800'
                          : purchase.status === 'confirmed'
                          ? 'bg-blue-200 text-blue-800'
                          : 'bg-yellow-200 text-yellow-800'
                      }`}
                    >
                      {purchase.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-800">
                    {new Date(purchase.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;