// components/CartPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      toast.error('Please log in to view your cart', {
        position: 'top-right',
        autoClose: 3000,
      });
      navigate('/login');
      return;
    }
    const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(storedCart);
  }, [token, navigate]);

  const handleQuantityChange = (cropId, value) => {
    const quantity = parseInt(value || 0);
    if (quantity <= 0) return;
    const updatedCart = cartItems.map((item) =>
      item.cropId === cropId
        ? { ...item, quantity, total: item.price * quantity }
        : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('storage'));
  };

  const updateCropQuantity = async (cropId, quantity) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/crops/${cropId}`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Update crop quantity error:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || 'Error updating crop quantity.');
    }
  };

  const handleRemoveItem = async (cropId) => {
    try {
      const item = cartItems.find((item) => item.cropId === cropId);
      if (item) {
        await updateCropQuantity(cropId, item.originalQuantity);
      }

      const updatedCart = cartItems.filter((item) => item.cropId !== cropId);
      setCartItems(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      window.dispatchEvent(new Event('storage'));

      toast.info('Item removed from cart', {
        position: 'top-right',
        autoClose: 3000,
        icon: '🗑️',
      });
    } catch (err) {
      toast.error(err.message, {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const handleBuyItem = async (item) => {
    console.log('Token:', token);
    console.log('Buy payload:', { cropId: item.cropId, quantity: item.quantity, farmerId: item.farmerId });
    if (!token) {
      toast.error('Please log in to proceed with purchase', {
        position: 'top-right',
        autoClose: 3000,
      });
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:5000/api/purchases',
        {
          cropId: item.cropId,
          quantity: item.quantity,
          farmerId: item.farmerId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Purchase response:', response.data);

      const updatedCart = cartItems.filter((cartItem) => cartItem.cropId !== item.cropId);
      setCartItems(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      window.dispatchEvent(new Event('storage'));

      toast.success(`Successfully purchased ${item.cropName}!`, {
        position: 'top-right',
        autoClose: 3000,
        icon: '🌾',
      });
      navigate('/customer/dashboard');
    } catch (err) {
      console.error('Buy item error:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Error purchasing item. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.total, 0).toFixed(2);
  };

  const handleCheckout = async () => {
    if (!token) {
      toast.error('Please log in to proceed with checkout', {
        position: 'top-right',
        autoClose: 3000,
      });
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      for (const item of cartItems) {
        await axios.post(
          'http://localhost:5000/api/purchases',
          {
            cropId: item.cropId,
            quantity: item.quantity,
            farmerId: item.farmerId,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      localStorage.removeItem('cart');
      setCartItems([]);
      window.dispatchEvent(new Event('storage'));
      toast.success('Purchase successful! Thank you for shopping with FarmDirect.', {
        position: 'top-right',
        autoClose: 3000,
        icon: '🌾',
      });
      navigate('/customer/dashboard');
    } catch (err) {
      console.error('Checkout error:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Error during checkout. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <ToastContainer />
      <header className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 font-[Playfair Display]">
              Your Cart
            </h1>
            <p className="text-gray-600">Review your selected fresh produce</p>
          </div>
          <button
            onClick={() => navigate('/customer/dashboard')}
            className="flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg shadow-md transition-all duration-300 mt-4 md:mt-0"
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
        </div>
      </header>
      <div className="container mx-auto px-4 mb-12">
        {cartItems.length === 0 ? (
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
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900 font-[Playfair Display]">
              Your cart is empty
            </h3>
            <p className="mt-1 text-gray-500">
              Add some fresh crops from local farmers to get started.
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/customer/dashboard')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-all duration-300"
              >
                Browse Crops
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-emerald-800 mb-6 font-[Playfair Display]">
                Cart Items
              </h2>
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div
                    key={item.cropId}
                    className="bg-white rounded-xl shadow-md p-6 flex items-start space-x-4 hover:shadow-lg transition-all duration-300"
                  >
                    <img
                      src={item.image || 'https://via.placeholder.com/100'}
                      alt={item.cropName}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 font-[Playfair Display]">
                        {item.cropName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {item.quantity} {item.unit} at ₹{item.price}/unit
                      </p>
                      <p className="text-sm text-gray-600">
                        Sold by: {item.farmerName} ({item.village}, {item.district})
                      </p>
                      <p className="text-lg font-bold text-emerald-600 mt-2">
                        Total: ₹{item.total.toFixed(2)}
                      </p>
                      <div className="mt-4 flex items-center space-x-4">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.cropId, e.target.value)}
                          className="w-20 p-2 border border-emerald-200 rounded-md focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50"
                        />
                        <button
                          onClick={() => handleBuyItem(item)}
                          disabled={isLoading}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                          aria-label={`Buy ${item.cropName}`}
                        >
                          Buy
                        </button>
                        <button
                          onClick={() => handleRemoveItem(item.cropId)}
                          disabled={isLoading}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
                <h2 className="text-2xl font-bold text-emerald-800 mb-4 font-[Playfair Display]">
                  Order Summary
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>₹{calculateTotal()}</span>
                  </div>
                  <div className="border-t border-emerald-100 pt-4">
                    <div className="flex justify-between text-lg font-semibold text-gray-900">
                      <span>Total</span>
                      <span>₹{calculateTotal()}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={isLoading || cartItems.length === 0}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white px-4 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
                  >
                    {isLoading ? (
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
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    )}
                    {isLoading ? 'Processing...' : 'Proceed to Checkout'}
                  </button>
                </div>
              </div>
            </div>
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

export default CartPage;