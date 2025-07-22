import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- Re-usable Icon Components for Readability ---
const LocationIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
  </svg>
);

const CartIcon = ({ count }) => (
    <div className="relative">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
        {count > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {count}
            </span>
        )}
    </div>
);


const ProfileIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
);


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
    <div className="min-h-screen bg-gray-50 font-sans">
      <ToastContainer />
      <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
                {/* Left Section: Title */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Farm<span className="text-emerald-600">Direct</span>
                    </h1>
                    <p className="text-xs text-gray-500 hidden sm:block">Fresh from Local Farms</p>
                </div>

                {/* Center Section: Location and Radius */}
                <div className="flex-1 flex justify-center items-center space-x-4 px-4">
                    <button
                        onClick={fetchLocation}
                        disabled={isLoadingLocation}
                        className="flex items-center justify-center h-10 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-full shadow-sm transition-all duration-300"
                    >
                        {isLoadingLocation ? <ClipLoader color="#374151" size={20} /> : <LocationIcon />}
                        <span className="hidden lg:inline ml-2">Update Location</span>
                    </button>
                     <div className="flex items-center bg-gray-100 rounded-full h-10 px-4 shadow-sm">
                        <label htmlFor="distance" className="text-sm font-semibold text-gray-600 mr-2 hidden md:inline">Radius:</label>
                        <select
                            id="distance"
                            value={maxDistance}
                            onChange={(e) => setMaxDistance(Number(e.target.value))}
                            className="bg-transparent text-gray-800 font-semibold focus:outline-none focus:ring-0 border-0"
                        >
                            <option value={10}>10 km</option>
                            <option value={50}>50 km</option>
                            <option value={100}>100 km</option>
                        </select>
                    </div>
                </div>

                {/* Right Section: Actions */}
                <div className="flex items-center space-x-2 sm:space-x-4">
                     <button
                        onClick={() => navigate('/cart')}
                        className="h-10 w-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors duration-300"
                        aria-label="View Cart"
                    >
                        <CartIcon count={cartCount} />
                    </button>
                    <button
                        onClick={() => navigate('/profile')}
                         className="h-10 w-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors duration-300"
                         aria-label="View Profile"
                    >
                        <ProfileIcon />
                    </button>
                </div>
            </div>
        </div>
        
        {location.latitude && (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-3 text-center text-xs text-gray-500">
                Showing crops near: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </div>
        )}
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-8 rounded-r-lg" role="alert">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            )}
            <div className="flex justify-center mb-8">
                <div className="flex space-x-2 bg-gray-200 p-1 rounded-full">
                    <button
                        onClick={() => setActiveTab('nearby')}
                        className={`px-6 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${activeTab === 'nearby' ? 'bg-white text-emerald-600 shadow' : 'text-gray-600 hover:bg-gray-300/50'}`}
                    >
                        Nearby Crops
                    </button>
                    <button
                        onClick={() => setActiveTab('purchases')}
                        className={`px-6 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${activeTab === 'purchases' ? 'bg-white text-emerald-600 shadow' : 'text-gray-600 hover:bg-gray-300/50'}`}
                    >
                        My Purchases
                    </button>
                </div>
            </div>

            {activeTab === 'nearby' ? (
                <>
                    {isLoadingCrops && (
                         <div className="text-center py-20">
                            <ClipLoader color="#10B981" size={40} />
                            <p className="mt-4 text-gray-600 font-semibold">Finding fresh crops near you...</p>
                        </div>
                    )}
                    {!isLoadingCrops && flattenedCrops.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                            <p className="text-lg font-semibold text-gray-700">No Crops Found</p>
                            <p className="mt-2 text-gray-500">Try updating your location or increasing the search radius.</p>
                        </div>
                    )}
                    {!isLoadingCrops && flattenedCrops.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {flattenedCrops.map((crop) => (
                                <div key={`${crop._id}-${crop.farmerInfo.id}`} className="bg-white rounded-2xl shadow-md overflow-hidden group transform hover:-translate-y-1 transition-all duration-300 flex flex-col">
                                    <div className="relative">
                                        <img src={crop.image || 'https://via.placeholder.com/400'} alt={crop.name} className="w-full h-48 object-cover"/>
                                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <span className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
                                            {crop.distance} km away
                                        </span>
                                    </div>
                                    <div className="p-5 flex flex-col flex-grow">
                                        <h3 className="text-lg font-bold text-gray-800 truncate">{crop.name}</h3>
                                        <p className="text-sm text-gray-500 mb-3">
                                            Sold by <span className="font-semibold">{crop.farmerInfo.name}</span>
                                        </p>
                                        <div className="flex items-baseline mb-4">
                                            <p className="text-2xl font-extrabold text-emerald-600">₹{crop.price}</p>
                                            <p className="text-sm text-gray-500 ml-1.5">/ {crop.unit}</p>
                                        </div>
                                        
                                        <div className="mt-auto pt-4 border-t border-gray-100">
                                            <p className="text-sm text-gray-600 mb-3">
                                                {crop.quantity > 0 ? (
                                                    `Available: ${crop.quantity} ${crop.unit}`
                                                ) : (
                                                    <span className="text-red-500 font-bold">Out of Stock</span>
                                                )}
                                            </p>
                                             <div className="flex items-center space-x-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={crop.quantity}
                                                    value={quantityInputs[crop._id] || ''}
                                                    onChange={(e) => handleQuantityChange(crop._id, e.target.value)}
                                                    placeholder="Qty"
                                                    className="w-20 p-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                                                    disabled={crop.quantity === 0}
                                                />
                                                <button
                                                    onClick={() => handleAddToCart(crop)}
                                                    disabled={!quantityInputs[crop._id] || quantityInputs[crop._id] <= 0 || crop.quantity === 0}
                                                    className="flex-1 px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow-md"
                                                >
                                                    Add to Cart
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                 <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {purchases.length === 0 ? (
                        <div className="text-center py-20">
                            <h3 className="text-xl font-semibold text-gray-700">No Purchase History</h3>
                            <p className="mt-2 text-gray-500">Your past orders will appear here.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {['Crop', 'Farmer', 'Quantity', 'Price', 'Status', 'Date'].map(header => (
                                            <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {purchases.map((purchase) => (
                                        <tr key={purchase._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-11 w-11">
                                                        <img className="h-11 w-11 rounded-full object-cover" src={purchase.image || 'https://via.placeholder.com/40'} alt={purchase.cropName} />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-semibold text-gray-900">{purchase.cropName}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{purchase.farmerId.name}</div>
                                                <div className="text-xs text-gray-500">{purchase.farmerId.district}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {purchase.quantity} {purchase.unit}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                                                ₹{purchase.totalPrice.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    purchase.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                    purchase.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-yellow-100 text-yellow-800'
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
      </main>
      
      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12 border-t border-gray-200 py-8">
        <p className="text-center text-sm text-gray-500">
          © {new Date().getFullYear()} FarmDirect. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default CustomerDashboard;