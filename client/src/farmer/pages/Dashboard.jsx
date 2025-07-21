import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../../context/AuthContext';
import { ClipLoader } from 'react-spinners';
import {
  HiOutlineChartPie,
  HiOutlineCurrencyRupee,
  HiOutlineCube,
  HiOutlineTag,
  HiOutlineLocationMarker,
  HiOutlineArrowRight,
  HiOutlineShoppingCart,
  HiOutlineCollection,
  HiPlus,
  HiOutlineChartBar,
  HiOutlineTrendingUp,
} from 'react-icons/hi';

import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend);

// --- Reimagined Components ---

// Subtle & Clean Stat Card
const StatCard = ({ icon: Icon, title, value }) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
      <div className="p-3 rounded-full bg-slate-100">
        <Icon className="w-6 h-6 text-slate-600" />
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
};

// Engaging Empty State Card
const EmptyState = ({ icon: Icon, title, message, actionLink, actionText }) => (
    <div className="text-center p-10 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
      <Icon size={48} className="mx-auto text-slate-300 mb-4" />
      <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
      <p className="text-slate-500 mt-2 mb-4">{message}</p>
      {actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center px-4 py-2 bg-teal-600 text-white font-semibold text-sm rounded-lg shadow-sm hover:bg-teal-700 transition-colors"
        >
          {actionText} <HiOutlineArrowRight className="ml-2"/>
        </Link>
      )}
    </div>
);


const Dashboard = () => {
  const { user, setUser, loading: authLoading } = useContext(AuthContext);
  const token = localStorage.getItem('token');
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState('sales'); // 'sales' or 'revenue'
  const [dashboardData, setDashboardData] = useState({
    farmerInfo: { name: '', location: '' },
    crops: [],
    purchases: [],
    summary: [], // This will be sorted by revenue
    stats: {
      totalSales: 0,
      totalRevenue: 0,
      totalQuantitySold: 0,
      cropVarietiesSold: 0,
      cropVarietiesListed: 0,
    },
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (authLoading) return;

      let currentUser = user;
      if (!user && token) {
        try {
          const userRes = await axios.get('http://localhost:5000/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
          currentUser = { _id: userRes.data._id, email: userRes.data.email, name: userRes.data.name, role: userRes.data.role.toLowerCase() };
          setUser(currentUser);
        } catch (err) {
          toast.error('Session expired. Please log in again.'); setLoading(false); return;
        }
      }

      if (!currentUser?._id || !token) {
        toast.error('Please log in to view your dashboard.'); setLoading(false); return;
      }

      try {
        const res = await axios.get(`http://localhost:5000/api/farmer/${currentUser._id}`, { headers: { Authorization: `Bearer ${token}` } });
        
        // --- IMPORTANT: Sort summary by revenue to get "Top Performing" ---
        const sortedSummary = res.data.summary.sort((a, b) => b.totalRevenue - a.totalRevenue);

        setDashboardData({
          farmerInfo: res.data.farmerInfo,
          crops: res.data.crops.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
          purchases: res.data.purchases.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
          summary: sortedSummary,
          stats: res.data.stats,
        });
      } catch (err) {
        toast.error(err.response?.data?.message || 'Could not fetch dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user, setUser, token, authLoading]);

  const onImageError = (e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150/e2e8f0/94a3b8?text=Image"; };
  
  if (authLoading || loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><ClipLoader color="#14b8a6" size={50} /></div>;
  if (!user?._id || !token) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><EmptyState icon={HiOutlineShoppingCart} title="Access Denied" message="Please log in to view your personalized dashboard." actionLink="/login" actionText="Go to Login"/></div>;

  const { farmerInfo, crops, purchases, summary, stats } = dashboardData;

  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } };
  const salesChartData = { labels: summary.map((s) => s.cropName), datasets: [{ label: 'Units Sold', data: summary.map((s) => s.totalQuantity), backgroundColor: 'rgba(20, 184, 166, 0.7)', borderRadius: 5 }] };
  const purchaseChartData = { labels: purchases.map((p) => new Date(p.createdAt).toLocaleDateString()), datasets: [{ label: 'Revenue (₹)', data: purchases.map((p) => p.totalPrice), borderColor: 'rgba(59, 130, 246, 1)', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.3 }] };
  const cropVarietiesChartData = { labels: ['Sold', 'Listed'], datasets: [{ data: [stats.cropVarietiesSold, stats.cropVarietiesListed], backgroundColor: ['#14b8a6', '#e2e8f0'], borderColor: '#fff', borderWidth: 4 }] };

  const statCards = [
    { title: 'Total Revenue', value: stats.totalRevenue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }), icon: HiOutlineCurrencyRupee },
    { title: 'Total Sales', value: stats.totalSales.toLocaleString(), icon: HiOutlineShoppingCart },
    { title: 'Units Sold', value: `${stats.totalQuantitySold.toLocaleString()}`, icon: HiOutlineCube },
    { title: 'Varieties Listed', value: stats.cropVarietiesListed.toLocaleString(), icon: HiOutlineTag },
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 p-4 sm:p-6 lg:p-8">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Dashboard
            </h1>
            <p className="text-slate-500 mt-1 text-base flex items-center">
              <HiOutlineLocationMarker className="mr-1.5 text-slate-400" />
              Welcome back, {farmerInfo.name || user.name}!
            </p>
          </div>
          <Link to="/farmer/dashboard/add" className="mt-4 sm:mt-0 inline-flex items-center gap-2 bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-teal-700 transition-all transform hover:scale-105">
            <HiPlus/> Add New Crop
          </Link>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => <StatCard key={stat.title} {...stat} />)}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- Main Column (Left) --- */}
          <main className="lg:col-span-2 space-y-8">
            {/* Sales & Revenue Charts */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800">Performance Overview</h3>
                    <div className="flex items-center bg-slate-100 p-1 rounded-lg">
                        <button onClick={() => setActiveChart('sales')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${activeChart === 'sales' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Sales Volume</button>
                        <button onClick={() => setActiveChart('revenue')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${activeChart === 'revenue' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Revenue Trend</button>
                    </div>
                </div>
                <div className="h-72">
                    {activeChart === 'sales' ? <Bar data={salesChartData} options={chartOptions} /> : <Line data={purchaseChartData} options={chartOptions} />}
                </div>
            </div>

            {/* Recent Sales Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="p-6 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">Recent Sales</h3>
                    {purchases.length > 5 && <Link to="#" className="text-sm font-semibold text-teal-600 hover:text-teal-700">View All</Link>}
                </div>
                {purchases.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-500"><tr>
                                <th className="text-left font-semibold p-4">Crop</th>
                                <th className="text-left font-semibold p-4">Customer</th>
                                <th className="text-left font-semibold p-4">Revenue</th>
                                <th className="text-left font-semibold p-4">Status</th>
                            </tr></thead>
                            <tbody className="divide-y divide-slate-200/80">
                                {purchases.slice(0, 5).map((p) => (
                                    <tr key={p.purchaseId} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="p-4"><div className="flex items-center space-x-3">
                                            <img src={p.image} alt={p.cropName} className="w-11 h-11 rounded-lg object-cover" onError={onImageError}/>
                                            <div><p className="font-semibold text-slate-800">{p.cropName}</p><p className="text-xs text-slate-500">{p.quantity} {p.unit}</p></div>
                                        </div></td>
                                        <td className="p-4 font-medium text-slate-700">{p.customerName}</td>
                                        <td className="p-4 font-semibold text-teal-600">{p.totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td>
                                        <td className="p-4"><span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${p.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{p.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <EmptyState icon={HiOutlineShoppingCart} title="No Sales Yet" message="When a customer makes a purchase, it will appear here." />}
            </div>
          </main>

          {/* --- Sidebar (Right) --- */}
          <aside className="space-y-8">
            {/* Top Performing Crops */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Top Performing Crops</h3>
                {summary.length > 0 ? (
                    <ul className="space-y-4">
                        {summary.slice(0, 5).map((s, index) => (
                            <li key={s.cropName} className="flex items-center space-x-4">
                                <span className="text-lg font-bold text-slate-400">{index + 1}</span>
                                <img src={s.image} alt={s.cropName} className="w-12 h-12 rounded-lg object-cover" onError={onImageError}/>
                                <div className="flex-1"><p className="font-semibold text-slate-800">{s.cropName}</p><p className="text-sm text-slate-500">{s.totalQuantity} units sold</p></div>
                                <p className="font-semibold text-teal-600">{s.totalRevenue.toLocaleString('en-IN', {style:'currency', currency:'INR'})}</p>
                            </li>
                        ))}
                    </ul>
                ) : <EmptyState icon={HiOutlineChartBar} title="No Sales Data" message="Your top crops will be ranked here after sales." />}
            </div>

            {/* Recent Listings */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800">Recent Listings</h3>
                    {crops.length > 5 && <Link to="/farmer/dashboard/update-delete" className="text-sm font-semibold text-teal-600 hover:text-teal-700">View All</Link>}
                </div>
                {crops.length > 0 ? (
                    <ul className="divide-y divide-slate-200/80">
                        {crops.slice(0, 5).map((crop) => (
                            <li key={crop._id} className="py-3 first:pt-0 last:pb-0">
                                <Link to="/farmer/dashboard/update-delete" className="flex items-center space-x-4 group">
                                    <img src={crop.image} alt={crop.name} className="w-14 h-14 object-cover rounded-lg shadow-sm" onError={onImageError}/>
                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-800 group-hover:text-teal-600 transition-colors">{crop.name}</p>
                                        <p className="text-sm text-slate-500">Qty: {crop.quantity} {crop.unit} at {crop.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}/{crop.unit}</p>
                                    </div>
                                    <HiOutlineArrowRight className="text-slate-400 group-hover:text-teal-600 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : <EmptyState icon={HiOutlineCollection} title="No Crops Listed" message="Add your first crop to see it here." actionLink="/farmer/dashboard/add" actionText="Add Crop" />}
            </div>
            
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;