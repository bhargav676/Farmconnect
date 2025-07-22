import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- Re-usable Icon Components for Clarity ---
const LocationIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>;
const CartIcon = ({ count }) => (
    <div className="relative"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
    {count > 0 && <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow-lg">{count}</span>}</div>
);
const ProfileIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>;
const CheckmarkIcon = () => <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>;


const animationStyles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeInUp {
    animation: fadeInUp 0.5s ease-out forwards;
    opacity: 0;
  }
`;

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
  // *** NEW STATE: To track quantities of items in the cart ***
  const [cartQuantities, setCartQuantities] = useState({});

  const [tabIndicatorStyle, setTabIndicatorStyle] = useState({});
  const tabsRef = useRef([]);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // *** NEW FUNCTION: To read localStorage and update our cart state ***
  const syncCartState = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const quantities = cart.reduce((acc, item) => {
      acc[item.cropId] = item.quantity;
      return acc;
    }, {});
    setCartQuantities(quantities);
    setCartCount(cart.length);
  };

  useEffect(() => {
    const activeTabIndex = activeTab === 'nearby' ? 0 : 1;
    const activeTabEl = tabsRef.current[activeTabIndex];
    if (activeTabEl) {
      setTabIndicatorStyle({ left: activeTabEl.offsetLeft, width: activeTabEl.offsetWidth, });
    }
  }, [activeTab]);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchPurchases();
    syncCartState(); // Sync cart state on initial load
    const storedLocation = JSON.parse(localStorage.getItem('location') || '{}');
    if (storedLocation.latitude && storedLocation.longitude) {
      setLocation(storedLocation);
      fetchNearbyCrops(storedLocation.latitude, storedLocation.longitude);
    } else { fetchLocation(); }
    const handleStorageChange = () => {
      // When storage changes (e.g., in another tab), re-sync the cart state
      syncCartState();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [token, navigate, maxDistance]);

  const flattenedCrops = crops.reduce((acc, farmer) => {
    if (!farmer || !farmer.crops || !farmer.farmerName || !farmer.farmerId || !farmer.farmerDetails) { return acc; }
    farmer.crops.forEach((crop) => {
      acc.push({ ...crop, farmerInfo: { name: farmer.farmerName, id: farmer.farmerId, village: farmer.farmerDetails.villageMandal, district: farmer.farmerDetails.district, }, });
    });
    return acc;
  }, []);

  const fetchLocation = () => {
    setIsLoadingLocation(true); setError(null); setCrops([]);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition( (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude }); localStorage.setItem('location', JSON.stringify({ latitude, longitude }));
          setIsLoadingLocation(false); fetchNearbyCrops(latitude, longitude);
          toast.info('Location updated successfully!', { position: "top-right", autoClose: 3000, icon: '🌍' });
        }, (err) => { setError('Unable to retrieve location. Please allow location access.'); setIsLoadingLocation(false); });
    } else { setError('Geolocation not supported by your browser.'); setIsLoadingLocation(false); }
  };

  const fetchNearbyCrops = async (latitude, longitude) => {
    setIsLoadingCrops(true);
    try {
      const response = await axios.post( 'http://localhost:5000/api/crops/nearby-crops', { latitude, longitude, maxDistance }, { headers: { Authorization: `Bearer ${token}` } } );
      setCrops(response.data.crops); setError(null);
    } catch (err) { setError(err.response?.data?.message || 'Error fetching crops.');
    } finally { setIsLoadingCrops(false); }
  };

  const fetchPurchases = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/purchases', { headers: { Authorization: `Bearer ${token}` } });
      setPurchases(response.data);
    } catch (err) { setError(err.response?.data?.message || 'Error fetching purchases.'); }
  };

  const updateCropQuantity = async (cropId, newQuantity) => {
    try {
      await axios.patch( `http://localhost:5000/api/crops/${cropId}`, { quantity: newQuantity }, { headers: { Authorization: `Bearer ${token}` } } );
    } catch (err) { throw new Error(err.response?.data?.message || 'Error updating crop quantity.'); }
  };

  const handleQuantityChange = (cropId, value) => {
    setQuantityInputs((prev) => ({ ...prev, [cropId]: value }));
  };

    const handleAddToCart = async (crop) => {
    const quantity = parseInt(quantityInputs[crop._id] || 0);
    if (quantity <= 0) { toast.warn(`Please enter a valid quantity.`); return; }
    
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = existingCart.find(item => item.cropId === crop._id);
    
    const currentCropState = flattenedCrops.find(c => c._id === crop._id);
    const availableStock = currentCropState ? currentCropState.quantity : crop.quantity;
    
    if (quantity > availableStock) { toast.error(`Cannot add to cart. Only ${availableStock} available.`); return; }

    try {
      setCrops((prevCrops) => prevCrops.map((farmer) => ({ ...farmer, crops: farmer.crops.map((c) => c._id === crop._id ? { ...c, quantity: c.quantity - quantity } : c ), })) );
      await updateCropQuantity(crop._id, availableStock - quantity);
      let updatedCart;
      if (existingItem) {
        updatedCart = existingCart.map(item => item.cropId === crop._id ? { ...item, quantity: item.quantity + quantity, total: item.price * (item.quantity + quantity), originalQuantity: crop.quantity, } : item );
      } else {
        const newCartItem = { cropId: crop._id, farmerId: crop.farmerInfo.id, cropName: crop.name, unit: crop.unit, quantity, originalQuantity: crop.quantity, price: crop.price, total: crop.price * quantity, farmerName: crop.farmerInfo.name, village: crop.farmerInfo.village, district: crop.farmerInfo.district, image: crop.image, };
        updatedCart = [...existingCart, newCartItem];
      }
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      
      syncCartState(); // *** UPDATE: Re-sync the state to show the badge immediately ***
      setQuantityInputs((prev) => ({ ...prev, [crop._id]: '' }));
      toast.success(`${crop.name} added to cart!`, { icon: '🛒' });
      
    } catch (err) { fetchNearbyCrops(location.latitude, location.longitude); toast.error(err.message); }
  };

  return (
    <div className="bg-gray-50 bg-gradient-to-br from-emerald-50/50 via-white to-sky-50/50 font-sans min-h-screen">
      <style>{animationStyles}</style>
      <ToastContainer position="bottom-right" theme="colored" />
      <header className="bg-white/70 backdrop-blur-xl sticky top-0 z-40 shadow-sm border-b border-gray-200/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8"><div className="flex items-center justify-between h-20">
            <div><h1 className="text-2xl font-bold text-gray-800 tracking-tighter">Farm<span className="text-emerald-500">Direct</span></h1></div>
            <div className="flex items-center bg-gray-100 rounded-full h-11 px-4 shadow-inner space-x-4">
                <button onClick={fetchLocation} disabled={isLoadingLocation} className="flex items-center text-sm font-semibold text-gray-600 hover:text-emerald-600 transition-colors">{isLoadingLocation ? <ClipLoader color="#374151" size={18} /> : <LocationIcon />}<span className="hidden lg:inline ml-2">Update Location</span></button>
                <div className="w-px h-5 bg-gray-300"></div>
                <div className="flex items-center">
                    <label htmlFor="distance" className="text-sm font-semibold text-gray-600 mr-2">Radius:</label>
                    <select id="distance" value={maxDistance} onChange={(e) => setMaxDistance(Number(e.target.value))} className="bg-transparent font-semibold focus:outline-none focus:ring-0 border-0 p-0 pr-6 text-emerald-600"><option value={10}>10 km</option><option value={50}>50 km</option><option value={100}>100 km</option></select>
                </div>
            </div>
            <div className="flex items-center space-x-3">
                 <button onClick={() => navigate('/cart')} className="h-11 w-11 flex items-center justify-center bg-white border border-gray-200 hover:border-gray-300 text-gray-700 rounded-full transition-all hover:shadow-md" aria-label="View Cart"><CartIcon count={cartCount} /></button>
                 <button onClick={() => navigate('/profile')} className="h-11 w-11 flex items-center justify-center bg-white border border-gray-200 hover:border-gray-300 text-gray-700 rounded-full transition-all hover:shadow-md" aria-label="View Profile"><ProfileIcon /></button>
            </div>
        </div></div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {error && (<div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 mb-8 rounded-r-lg shadow-md" role="alert"><p className="font-bold">An Error Occurred</p><p>{error}</p></div>)}
            <div className="relative flex justify-center mb-10">
                <div ref={el => tabsRef.current[0] = el} onClick={() => setActiveTab('nearby')} className="z-10 px-6 py-2.5 text-sm font-semibold cursor-pointer transition-colors" >Nearby Crops</div>
                <div ref={el => tabsRef.current[1] = el} onClick={() => setActiveTab('purchases')} className="z-10 px-6 py-2.5 text-sm font-semibold cursor-pointer transition-colors" >My Purchases</div>
                <div className="absolute h-full p-1 w-full max-w-sm"><div className="bg-gray-200/70 rounded-full h-full w-full"></div></div>
                <div className="absolute h-full p-1 transition-all duration-300 ease-in-out" style={{ left: tabIndicatorStyle.left, width: tabIndicatorStyle.width }}><div className="bg-white rounded-full h-full w-full shadow-md"></div></div>
            </div>
            {activeTab === 'nearby' ? ( <>
                    {isLoadingCrops && <div className="text-center py-20"><ClipLoader color="#10B981" size={50} /><p className="mt-4 text-gray-600 font-semibold">Harvesting local data...</p></div>}
                    {!isLoadingCrops && flattenedCrops.length === 0 && <div className="text-center py-20 bg-white rounded-2xl shadow-sm"><h3 className="text-xl font-semibold text-gray-700">No Fields to Show</h3><p className="mt-2 text-gray-500">No crops were found in your selected area. Try expanding your search radius.</p></div>}
                    {!isLoadingCrops && flattenedCrops.length > 0 && (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {flattenedCrops.map((crop, index) => (
                            <div key={`${crop._id}-${crop.farmerInfo.id}`} className="bg-white rounded-2xl shadow-lg overflow-hidden group transform hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl animate-fadeInUp" style={{ animationDelay: `${index * 75}ms` }}>
                                <div className="relative">
                                    <img src={crop.image || 'https://via.placeholder.com/400'} alt={crop.name} className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-110"/>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>
                                    <div className="absolute bottom-3 left-4"><h3 className="text-xl font-bold text-white tracking-tight shadow-sm">{crop.name}</h3><p className="text-xs text-emerald-200 font-semibold group-hover:text-white transition-colors">by {crop.farmerInfo.name}</p></div>
                                     <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-md">{crop.distance} km</span>
                                </div>
                                <div className="p-5 flex flex-col flex-grow">
                                    <div className="flex items-baseline justify-between mb-4"><p className="text-3xl font-extrabold text-emerald-500">₹{crop.price}<span className="text-sm font-medium text-gray-500">/{crop.unit}</span></p><p className={`text-sm font-bold ${crop.quantity > 0 ? 'text-gray-600' : 'text-red-500'}`}>{crop.quantity > 0 ? `Stock: ${crop.quantity}` : 'Out of Stock'}</p></div>
                                    <div className="mt-auto flex flex-col gap-3">
                                        {/* *** NEW UI ELEMENT: Visual Feedback Badge *** */}
                                        {(cartQuantities[crop._id] || 0) > 0 && (
                                            <div className="flex items-center justify-center text-xs font-bold text-teal-800 bg-teal-100 rounded-full px-3 py-1.5">
                                              <CheckmarkIcon />
                                              {cartQuantities[crop._id]} in your cart
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3">
                                          <input type="number" min="1" max={crop.quantity} value={quantityInputs[crop._id] || ''} onChange={(e) => handleQuantityChange(crop._id, e.target.value)} placeholder="Qty" className="w-24 p-2.5 border-2 border-gray-200 rounded-lg text-center font-semibold focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition" disabled={crop.quantity === 0} />
                                          <button onClick={() => handleAddToCart(crop)} disabled={!quantityInputs[crop._id] || quantityInputs[crop._id] <= 0 || crop.quantity === 0} className="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-lg hover:from-emerald-600 hover:to-green-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg active:scale-95">Add to Cart</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>)}
                </>
            ) : ( <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {purchases.length === 0 ? <div className="text-center py-20"><h3 className="text-xl font-semibold text-gray-700">No Orders Yet</h3><p className="mt-2 text-gray-500">Your past orders will appear here once you make a purchase.</p></div>
                    : ( <div className="overflow-x-auto"><table className="min-w-full"><thead className="bg-gray-50/50"><tr>
                        {['Crop', 'Farmer', 'Quantity', 'Price', 'Status', 'Date'].map(header => (<th key={header} scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{header}</th>))}
                        </tr></thead><tbody className="bg-white divide-y divide-gray-200">
                        {purchases.map((purchase) => (<tr key={purchase._id} className="hover:bg-emerald-50/50 transition-colors duration-200"><td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12"><img className="h-12 w-12 rounded-full object-cover shadow-sm" src={purchase.image || 'https://via.placeholder.com/40'} alt={purchase.cropName} /></div>
                            <div className="ml-4"><div className="text-sm font-semibold text-gray-900">{purchase.cropName}</div></div></div></td>
                            <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-800">{purchase.farmerId.name}</div><div className="text-xs text-gray-500">{purchase.farmerId.district}</div></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">{purchase.quantity} {purchase.unit}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">₹{purchase.totalPrice.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap"><span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full capitalize ${purchase.status === 'delivered' ? 'bg-green-100 text-green-800' : purchase.status === 'confirmed' ? 'bg-sky-100 text-sky-800' : 'bg-yellow-100 text-yellow-800'}`}>{purchase.status}</span></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(purchase.createdAt).toLocaleDateString()}</td></tr>))}
                    </tbody></table></div> )}
                </div>)}
      </main>
      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16 border-t border-gray-200/80 py-8">
        <p className="text-center text-sm text-gray-500">© {new Date().getFullYear()} FarmDirect. All rights reserved. Freshness delivered.</p>
      </footer>
    </div>
  );
};

export default CustomerDashboard;