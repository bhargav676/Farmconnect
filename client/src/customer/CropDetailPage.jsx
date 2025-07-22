import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// You can re-use your icons here
const LocationIcon = () => <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>;
const FarmerIcon = () => <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 11a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1v-1z"></path></svg>;
const BackIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>;


const CropDetailPage = () => {
    const { cropId } = useParams(); // Gets the ':cropId' from the URL
    const navigate = useNavigate();
    const [crop, setCrop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) navigate('/login');

        const fetchCropDetails = async () => {
            setLoading(true);
            try {
                // --- IMPORTANT: You need to create this API endpoint on your server ---
                // It should fetch a single crop and also include farmer details.
                const response = await axios.get(`http://localhost:5000/api/crops/${cropId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCrop(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch crop details.');
                toast.error('Could not load crop details.');
            } finally {
                setLoading(false);
            }
        };

        fetchCropDetails();
    }, [cropId, token, navigate]);

    const handleAddToCart = () => {
        if (!crop) return;
        if (quantity <= 0) {
            toast.warn('Please enter a valid quantity.');
            return;
        }
        if (quantity > crop.quantity) {
            toast.error(`Only ${crop.quantity} available in stock.`);
            return;
        }

        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItemIndex = cart.findIndex(item => item.cropId === crop._id);

        if (existingItemIndex > -1) {
            // Update quantity if item already in cart
            cart[existingItemIndex].quantity += quantity;
            cart[existingItemIndex].total = cart[existingItemIndex].price * cart[existingItemIndex].quantity;
        } else {
            // Add new item to cart
            const newCartItem = {
                cropId: crop._id,
                farmerId: crop.farmerInfo.id,
                cropName: crop.name,
                unit: crop.unit,
                quantity: quantity,
                price: crop.price,
                total: crop.price * quantity,
                farmerName: crop.farmerInfo.name,
                village: crop.farmerInfo.village,
                district: crop.farmerInfo.district,
                image: crop.image,
            };
            cart.push(newCartItem);
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('storage')); // Notify other components of cart change
        toast.success(`${crop.name} added to cart!`, { icon: '🛒' });
        navigate('/cart'); // Optional: navigate to cart after adding
    };


    if (loading) {
        return <div className="flex justify-center items-center h-screen"><ClipLoader color="#10B981" size={60} /></div>;
    }

    if (error) {
        return <div className="container mx-auto text-center py-20">
            <h2 className="text-2xl font-bold text-red-600">Error</h2>
            <p className="text-gray-600 mt-2">{error}</p>
            <button onClick={() => navigate(-1)} className="mt-6 px-6 py-2 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600">Go Back</button>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <ToastContainer position="bottom-right" theme="colored" />
            <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                 <button onClick={() => navigate(-1)} className="flex items-center text-sm font-semibold text-gray-600 hover:text-emerald-600 transition-colors">
                    <BackIcon /> Go Back
                </button>
            </header>
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                {crop && (
                    <div className="bg-white p-8 rounded-3xl shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        {/* Left Side: Image */}
                        <div className="w-full h-96 rounded-2xl overflow-hidden shadow-lg">
                            <img src={crop.image || 'https://via.placeholder.com/600'} alt={crop.name} className="w-full h-full object-cover" />
                        </div>

                        {/* Right Side: Details */}
                        <div className="flex flex-col h-full">
                            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">{crop.name}</h1>
                            <p className="text-lg text-gray-500 mt-2">A fresh selection of hand-picked {crop.name}.</p>

                            <div className="my-6 space-y-3">
                                <div className="flex items-center text-gray-700">
                                    <FarmerIcon />
                                    <span>Sold by <span className="font-bold text-emerald-600">{crop.farmerInfo.name}</span></span>
                                </div>
                                <div className="flex items-center text-gray-700">
                                    <LocationIcon />
                                    <span>From <span className="font-bold">{crop.farmerInfo.village}, {crop.farmerInfo.district}</span></span>
                                </div>
                            </div>

                            <div className="text-5xl font-bold text-emerald-500 my-4">
                                ₹{crop.price}<span className="text-xl font-medium text-gray-500">/{crop.unit}</span>
                            </div>

                            <div className={`text-md font-bold mb-6 ${crop.quantity > 10 ? 'text-green-600' : 'text-yellow-600'}`}>
                                {crop.quantity > 0 ? `Stock: ${crop.quantity} ${crop.unit} available` : 'Out of Stock'}
                            </div>
                            
                            {/* Spacer */}
                            <div className="flex-grow"></div>

                            {/* Action Area */}
                            {crop.quantity > 0 && (
                                <div className="flex items-stretch gap-4">
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                        min="1"
                                        max={crop.quantity}
                                        className="w-28 p-3 border-2 border-gray-300 rounded-xl text-center font-bold text-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition"
                                    />
                                    <button
                                        onClick={handleAddToCart}
                                        className="w-full flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold text-lg rounded-xl hover:from-emerald-600 hover:to-green-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CropDetailPage;