import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import AuthContext from '../../context/AuthContext';

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { FiBox, FiList, FiMapPin, FiPackage, FiRefreshCw, FiArrowRight } from 'react-icons/fi';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const StatCard = ({ icon, title, value, colorClass }) => (
    <div className="bg-white p-6 rounded-xl shadow-md shadow-slate-200/50 flex items-start justify-between">
        <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClass}`}>{icon}</div>
    </div>
);

const Dashboard = () => {
    const { user, token } = useContext(AuthContext);
    const [farmerInfo, setFarmerInfo] = useState(null);
    const [crops, setCrops] = useState([]);
    const [stats, setStats] = useState({ totalCrops: 0, totalQuantity: 0, cropVarieties: 0, recentlyUpdated: 0 });
    const [chartData, setChartData] = useState({ doughnut: null, bar: null });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user?._id || !token) {
                setLoading(false);
                return;
            }
            try {
                const res = await axios.get('http://localhost:5000/api/auth/cropdata', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // --- THIS IS THE KEY FIX ---
                // The crops are in res.data.crops, not res.data itself
                const fetchedCrops = res.data.crops || []; 
                const sortedCrops = fetchedCrops.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                
                // Set farmer-specific info from the API response
                setFarmerInfo({
                    name: res.data.farmerName,
                    location: res.data.farmerDetails.address || res.data.farmerDetails.villageMandal
                });

                setCrops(sortedCrops);
                calculateStatsAndCharts(sortedCrops);

            } catch (err) {
                toast.error('Could not fetch dashboard data.');
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        const calculateStatsAndCharts = (cropsData) => {
            if (!cropsData || cropsData.length === 0) {
                return;
            }
            
            const totalCrops = cropsData.length;
            const totalQuantity = cropsData.reduce((sum, crop) => sum + Number(crop.quantity), 0);
            const cropVarieties = new Set(cropsData.map(crop => crop.name.toLowerCase())).size;
            
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const recentlyUpdated = cropsData.filter(crop => new Date(crop.updatedAt) > sevenDaysAgo).length;

            setStats({ totalCrops, totalQuantity, cropVarieties, recentlyUpdated });

            const cropTypeCounts = cropsData.reduce((acc, crop) => {
                const type = crop.type.charAt(0).toUpperCase() + crop.type.slice(1); // Capitalize
                acc[type] = (acc[type] || 0) + 1;
                return acc;
            }, {});

            setChartData({
                doughnut: {
                    labels: Object.keys(cropTypeCounts),
                    datasets: [{
                        label: '# of Listings',
                        data: Object.values(cropTypeCounts),
                        backgroundColor: ['#14B8A6', '#38BDF8', '#F472B6', '#FBBF24', '#8B5CF6'],
                        borderColor: ['#fff'],
                        borderWidth: 4,
                    }],
                },
                bar: {
                    labels: cropsData.slice(0, 7).map(c => c.name),
                    datasets: [{
                        label: 'Quantity',
                        data: cropsData.slice(0, 7).map(c => c.quantity),
                        backgroundColor: '#14B8A6',
                        borderRadius: 4,
                    }],
                }
            });
        };

        fetchDashboardData();
    }, [user, token]);

    // ... (The rest of the component remains the same)

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <ClipLoader color="#334155" size={50} />
            </div>
        );
    }
    
    const doughnutOptions = {
        responsive: true,
        cutout: '70%',
        plugins: { legend: { position: 'bottom', labels: { padding: 20, boxWidth: 12, font: { size: 14 } } } },
    };
    
    const barOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Inventory Quantity of Recent Listings', font: {size: 16}, padding: { bottom: 20 } },
        },
        scales: { y: { beginAtZero: true } }
    };

    return (
        <div className="bg-slate-50 min-h-screen p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-slate-800">Welcome back, {farmerInfo?.name || user?.name}!</h1>
                    <p className="text-slate-500 mt-2 text-lg flex items-center">
                        <FiMapPin className="mr-2" />
                        {farmerInfo?.location || 'Your Location'}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatCard icon={<FiList size={22} />} title="Total Listings" value={stats.totalCrops} colorClass="bg-sky-100 text-sky-600" />
                    <StatCard icon={<FiPackage size={22} />} title="Total Quantity (Est.)" value={stats.totalQuantity} colorClass="bg-teal-100 text-teal-600" />
                    <StatCard icon={<FiBox size={22} />} title="Crop Varieties" value={stats.cropVarieties} colorClass="bg-rose-100 text-rose-600" />
                    <StatCard icon={<FiRefreshCw size={22} />} title="Updated This Week" value={stats.recentlyUpdated} colorClass="bg-amber-100 text-amber-600" />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-md shadow-slate-200/50">
                        {crops.length > 0 && chartData.bar ? (
                            <Bar options={barOptions} data={chartData.bar} />
                        ) : (
                            <div className="text-center py-16">
                                <h3 className="text-lg font-semibold text-slate-600">No data to display</h3>
                                <p className="text-slate-400 mt-1">Add a crop to see inventory stats.</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-6 rounded-xl shadow-md shadow-slate-200/50">
                            <h3 className="text-lg font-bold text-slate-800 mb-4">Crop Type Distribution</h3>
                            {crops.length > 0 && chartData.doughnut ? (
                                <Doughnut data={chartData.doughnut} options={doughnutOptions} />
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-slate-400">No crop types to show.</p>
                                </div>
                            )}
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md shadow-slate-200/50">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-slate-800">Recent Listings</h3>
                                <Link to="/farmer/dashboard/update-delete" className="text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center">
                                    View All <FiArrowRight className="ml-1" />
                                </Link>
                            </div>
                            <div className="space-y-4">
                                {crops.slice(0, 3).map(crop => (
                                    <Link to="/farmer/dashboard/update-delete" key={crop._id} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                        <img src={crop.image} alt={crop.name} className="w-12 h-12 rounded-md object-cover" />
                                        <div>
                                            <p className="font-semibold text-slate-700">{crop.name}</p>
                                            <p className="text-sm text-slate-500">Qty: {crop.quantity} {crop.unit}</p>
                                        </div>
                                    </Link>
                                ))}
                                {crops.length === 0 && (
                                     <p className="text-center text-slate-400 py-4">Your new listings will appear here.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;