import { useState, useContext, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import FarmerRegistrations from "./FarmerRegistrations";
import FarmersPanel from "./FarmerPanel";
import CropsPanel from "./CropPanel";
import CustomersPanel from "./CustomersPanel";
import PurchasesPanel from "./PurchasesPanel";
import {
  ClipboardDocumentIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  UserIcon,
  ShoppingCartIcon,
  ArrowLeftOnRectangleIcon,
  ChartBarIcon,
  BellIcon,
  ChevronDownIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckBadgeIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import {
  ClipboardDocumentIcon as ClipboardDocumentSolid,
  UserGroupIcon as UserGroupSolid,
  ShoppingBagIcon as ShoppingBagSolid,
  UserIcon as UserSolid,
  ShoppingCartIcon as ShoppingCartSolid,
  ChartBarIcon as ChartBarSolid,
} from "@heroicons/react/24/solid";

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
    } else {
      fetchDashboardData();
    }
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5000/api/admin/dashboard",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setDashboardData(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      showNotification("Failed to load dashboard data", "error");
      setLoading(false);

      // Set empty data structure to prevent crashes
      setDashboardData({
        totalFarmers: 0,
        totalCustomers: 0,
        totalCrops: 0,
        totalPurchases: 0,
        pendingRegistrations: 0,
        revenue: {
          currentMonth: 0,
          previousMonth: 0,
          change: 0,
        },
        recentActivities: [],
        stats: [
          { name: "Active Farmers", value: "0", change: 0, positive: true },
          { name: "Avg. Order Value", value: "₹0", change: 0, positive: true },
          { name: "Pending Actions", value: "0", change: 0, positive: false },
        ],
      });
    }
  };

  const showNotification = useCallback((message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      3000
    );
  }, []);

  if (!user || user.role !== "admin") return null;

  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: ChartBarIcon,
      activeIcon: ChartBarSolid,
    },
    {
      id: "registrations",
      label: "Registrations",
      icon: ClipboardDocumentIcon,
      activeIcon: ClipboardDocumentSolid,
    },
    {
      id: "farmers",
      label: "Farmers",
      icon: UserGroupIcon,
      activeIcon: UserGroupSolid,
    },
    {
      id: "crops",
      label: "Crops",
      icon: ShoppingBagIcon,
      activeIcon: ShoppingBagSolid,
    },
    {
      id: "customers",
      label: "Customers",
      icon: UserIcon,
      activeIcon: UserSolid,
    },
    {
      id: "purchases",
      label: "Purchases",
      icon: ShoppingCartIcon,
      activeIcon: ShoppingCartSolid,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview data={dashboardData} loading={loading} />;
      case "registrations":
        return <FarmerRegistrations showNotification={showNotification} />;
      case "farmers":
        return <FarmersPanel showNotification={showNotification} />;
      case "crops":
        return <CropsPanel showNotification={showNotification} />;
      case "customers":
        return <CustomersPanel showNotification={showNotification} />;
      case "purchases":
        return <PurchasesPanel showNotification={showNotification} />;
      default:
        return <DashboardOverview data={dashboardData} loading={loading} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-cyan-50 p-4 md:p-6">
      {/* Animated Notification */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg text-white font-medium transition-all duration-300 transform ${
            notification.type === "success" ? "bg-emerald-500" : "bg-rose-500"
          } ${
            notification.show
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0"
          }`}
        >
          <div className="flex items-center">
            <div className="mr-2">
              {notification.type === "success" ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </div>
            {notification.message}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-5 sticky top-0 z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <svg
                    className="w-6 h-6 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  FarmConnect Admin
                </h2>

                <div className="md:hidden flex items-center">
                  <button className="text-white mr-3 relative">
                    <BellIcon className="w-6 h-6" />
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      3
                    </span>
                  </button>
                  <button className="text-white">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16m-7 6h7"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex items-center mt-4 md:mt-0">
                <div className="hidden md:flex items-center mr-6">
                  <button className="text-white mr-4 relative">
                    <BellIcon className="w-6 h-6" />
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      3
                    </span>
                  </button>
                  <div className="relative">
                    <select className="appearance-none bg-teal-700/30 text-teal-100 rounded-lg pl-4 pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-teal-300">
                      <option>Today</option>
                      <option>This Week</option>
                      <option>This Month</option>
                      <option>This Year</option>
                    </select>
                    <ChevronDownIcon className="w-4 h-4 absolute right-3 top-1/2 -mt-2 text-teal-100 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center bg-teal-700/30 backdrop-blur-sm rounded-full py-1 pl-1 pr-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold border-2 border-white/30">
                    {user.name
                      ? user.name.charAt(0)
                      : user.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-white text-sm truncate max-w-[120px]">
                      {user.name || user.email}
                    </p>
                    <p className="text-xs text-teal-100">Administrator</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="ml-4 flex items-center px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 hover:shadow-md transition-all duration-200 group"
                >
                  <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-1 group-hover:scale-110 transition-transform" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="mt-5 flex space-x-1 overflow-x-auto pb-1 scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = activeTab === tab.id ? tab.activeIcon : tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-white text-cyan-700 shadow-md"
                        : "text-teal-100 hover:bg-teal-700/50"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 mr-2 ${
                        activeTab === tab.id ? "text-cyan-600" : "text-teal-200"
                      }`}
                    />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-5 md:p-7 bg-gray-50 min-h-[70vh]">
            <div className="bg-white rounded-xl shadow-sm p-5 md:p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Overview Component
const DashboardOverview = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        <span className="ml-4 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-gray-700 mb-2">
          Failed to load dashboard data
        </h3>
        <p className="text-gray-500">
          Please try again later or contact support
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Farmers"
          value={data.totalFarmers}
          icon={UserGroupSolid}
          iconColor="bg-blue-100 text-blue-600"
          trend={12.5}
        />
        <StatCard
          title="Total Customers"
          value={data.totalCustomers}
          icon={UserSolid}
          iconColor="bg-green-100 text-green-600"
          trend={8.3}
        />
        <StatCard
          title="Total Crops"
          value={data.totalCrops}
          icon={ShoppingBagSolid}
          iconColor="bg-amber-100 text-amber-600"
          trend={4.7}
        />
        <StatCard
          title="Total Purchases"
          value={data.totalPurchases}
          icon={ShoppingCartSolid}
          iconColor="bg-purple-100 text-purple-600"
          trend={18.2}
        />
      </div>

      {/* Revenue and Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Card */}
        <div className="lg:col-span-2 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-xl p-6 border border-cyan-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-700">Revenue</h3>
              <p className="text-sm text-gray-500">Current month</p>
            </div>
            <div className="bg-white rounded-lg px-3 py-1 flex items-center">
              <CalendarIcon className="w-4 h-4 text-gray-500 mr-1" />
              <span className="text-sm text-gray-700">June 2023</span>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline">
              <CurrencyRupeeIcon className="w-6 h-6 text-gray-700" />
              <span className="text-3xl font-bold text-gray-900 ml-1">
                {data.revenue.currentMonth.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="mt-2 flex items-center">
              {data.revenue.change > 0 ? (
                <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
              ) : (
                <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />
              )}
              <span
                className={`ml-1 font-medium ${
                  data.revenue.change > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {data.revenue.change}% from last month
              </span>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-lg p-4 border border-cyan-200">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-medium text-gray-700">
                  Pending Registrations
                </h4>
                <p className="text-xs text-gray-500">Require your approval</p>
              </div>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-gray-900">
                  {data.pendingRegistrations}
                </span>
                <button className="ml-3 bg-cyan-600 text-white rounded-lg px-3 py-1 text-sm font-medium hover:bg-cyan-700 transition-colors">
                  Review
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="space-y-6">
          {data.stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-700">{stat.name}</h3>
                <div className="bg-gray-100 rounded-lg px-2 py-1">
                  {stat.positive ? (
                    <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
              <div className="mt-3 flex items-baseline">
                <span className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </span>
                <span
                  className={`ml-2 text-sm font-medium ${
                    stat.positive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.positive ? "+" : ""}
                  {stat.change}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">Recent Activity</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {data.recentActivities.map((activity) => (
            <div key={activity.id} className="px-6 py-4 flex">
              <div className="flex-shrink-0 mr-4">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-teal-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {activity.user}{" "}
                  <span className="font-normal text-gray-600">
                    {activity.action}
                  </span>
                </p>
                {activity.amount && (
                  <p className="text-sm text-gray-500 mt-1">
                    {activity.amount}
                  </p>
                )}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <ClockIcon className="w-4 h-4 mr-1" />
                {activity.time}
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-gray-200 text-center">
          <button className="text-cyan-600 hover:text-cyan-700 font-medium text-sm">
            View all activity
          </button>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, iconColor, trend }) => {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-gray-700">{title}</h3>
        <div className={`p-2 rounded-lg ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        <span className="ml-2 text-sm font-medium text-green-600 flex items-center">
          <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />+{trend}%
        </span>
      </div>
    </div>
  );
};

export default AdminDashboard;
