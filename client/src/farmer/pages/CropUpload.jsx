import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { ClipLoader } from 'react-spinners';

const CropUpload = () => {
  const { user, setUser, logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [cropList, setCropList] = useState([]);
  const [formData, setFormData] = useState({
    cropName: '',
    quantity: '',
    unit: '',
    price: '',
    image: '',
    type: '',
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Debug token and user
  useEffect(() => {
    console.log('AuthContext - User:', user);
    console.log('Token from localStorage:', token);
  }, [user, token]);

   useEffect(() => {
    console.log('AuthContext - User:', user);
    console.log('Token from localStorage:', token);
  }, [user, token]);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setErrors({ general: 'Please log in to continue' });
        toast.error('Please log in to continue');
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
        setErrors({ general: 'Failed to load user data. Please log in again.' });
        toast.error('Failed to load user data. Please log in again.');
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
        setErrors({ general: 'Failed to load crop list. Please try refreshing.' });
        toast.error('Failed to load crop list');
      }
    };
    fetchCropList();
  }, []);

  // Handle crop selection
  const handleCropSelect = (selectedOption) => {
    console.log('Selected crop:', selectedOption);
    const selectedCrop = cropList.find((crop) => crop.name === selectedOption?.value);
    if (selectedCrop) {
      setFormData({
        ...formData,
        cropName: selectedCrop.name,
        image: selectedCrop.image,
        type: selectedCrop.type,
        unit: selectedCrop.unit,
      });
      setErrors((prev) => ({ ...prev, cropName: '' }));
      console.log('Updated formData:', {
        cropName: selectedCrop.name,
        image: selectedCrop.image,
        type: selectedCrop.type,
        unit: selectedCrop.unit,
      });
    } else {
      setFormData({ ...formData, cropName: '', image: '', type: '', unit: '' });
      setErrors((prev) => ({ ...prev, cropName: 'Please select a crop' }));
    }
  };

  // Handle form input changes with validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = ${value}`);
    setFormData({ ...formData, [name]: value });

    // Real-time validation
    const newErrors = { ...errors };
    if (name === 'quantity') {
      if (!value) {
        newErrors.quantity = 'Quantity is required';
      } else if (parseFloat(value) <= 0) {
        newErrors.quantity = 'Quantity must be positive';
      } else {
        delete newErrors.quantity;
      }
    }
    if (name === 'price') {
      if (!value) {
        newErrors.price = 'Price is required';
      } else if (parseFloat(value) <= 0) {
        newErrors.price = 'Price must be positive';
      } else {
        delete newErrors.price;
      }
    }
    setErrors(newErrors);
    console.log('Current errors:', newErrors);
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.cropName &&
      formData.quantity &&
      parseFloat(formData.quantity) > 0 &&
      formData.price &&
      parseFloat(formData.price) > 0 &&
      formData.image &&
      formData.type &&
      formData.unit &&
      user?._id &&
      token
    );
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    setErrors({});
    setSuccess('');

    if (!isFormValid()) {
      const newErrors = {};
      if (!formData.cropName) newErrors.cropName = 'Please select a crop';
      if (!formData.quantity) newErrors.quantity = 'Quantity is required';
      else if (parseFloat(formData.quantity) <= 0) newErrors.quantity = 'Quantity must be positive';
      if (!formData.price) newErrors.price = 'Price is required';
      else if (parseFloat(formData.price) <= 0) newErrors.price = 'Price must be positive';
      if (!formData.image) newErrors.image = 'Image URL is required';
      if (!formData.type) newErrors.type = 'Type is required';
      if (!formData.unit) newErrors.unit = 'Unit is required';
      if (!user?._id) newErrors.general = 'User ID is missing';
      if (!token) newErrors.general = 'Authentication token missing. Please log in again.';
      console.log('Validation errors:', newErrors);
      setErrors(newErrors);
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      console.log('Sending POST request with payload:', { ...formData, farmerId: user._id });
      const res = await axios.post(
        'http://localhost:5000/api/crops/crop',
        { ...formData, farmerId: user._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Post crop response:', res.data);
      setSuccess(res.data.message);
      toast.success(res.data.message);
      setFormData({ cropName: '', quantity: '', unit: '', price: '', image: '', type: '' });
      setErrors({});
    } catch (err) {
      console.error('Error posting crop:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setErrors({ general: 'Session expired or invalid token. Please log in again.' });
        toast.error('Session expired. Please log in again.');
        logout();
        navigate('/login');
      } else {
        const message = err.response?.data?.message || 'Failed to post crop';
        setErrors({ general: message });
        toast.error(message);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <ClipLoader color="#10B981" size={50} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">Upload Crop</h2>
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Post a Crop</h3>
        {errors.general && <p className="text-red-500 mb-4">{errors.general}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Select Crop</label>
            <Select
              options={cropList.map((crop) => ({
                value: crop.name,
                label: `${crop.name} (${crop.type})`,
              }))}
              onChange={handleCropSelect}
              placeholder="Search for a crop..."
              className="w-full"
              isClearable
            />
            {errors.cropName && <p className="text-red-500 text-sm mt-1">{errors.cropName}</p>}
          </div>
          {formData.image && (
            <div className="mb-4">
              <img src={formData.image} alt={formData.cropName} className="w-32 h-32 object-cover rounded mx-auto" />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Quantity ({formData.unit || 'select a crop'})</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              className={`w-full p-2 border rounded ${errors.quantity ? 'border-red-500' : ''}`}
              placeholder={`Enter quantity in ${formData.unit || 'units'}`}
              min="0"
              step="0.01"
            />
            {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Price (per {formData.unit || 'unit'})</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className={`w-full p-2 border rounded ${errors.price ? 'border-red-500' : ''}`}
              placeholder={`Enter price per ${formData.unit || 'unit'}`}
              min="0"
              step="0.01"
            />
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors"
            onClick={() => console.log('Post Crop button clicked', { formData, isValid: isFormValid() })}
          >
            Post Crop
          </button>
        </form>
      </div>
    </div>
  );
};

export default CropUpload;