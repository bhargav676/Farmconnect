import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import axios from "axios";

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }

    const fetchFarmers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/admin/farmers",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setFarmers(response.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchFarmers();
  }, [user, navigate]);

  const handleApprove = async (id) => {
    try {
      await axios.post(
        `http://localhost:5000/api/admin/farmer/${id}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setFarmers(
        farmers.map((farmer) =>
          farmer._id === id ? { ...farmer, status: "approved" } : farmer
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.post(
        `http://localhost:5000/api/admin/farmer/${id}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setFarmers(
        farmers.map((farmer) =>
          farmer._id === id ? { ...farmer, status: "rejected" } : farmer
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h2 className="text-3xl font-bold text-center mb-6">Admin Dashboard</h2>
      <p className="text-center mb-6">
        Welcome, Admin! Manage farmer registrations below.
      </p>
      <button
        onClick={logout}
        className="mb-6 bg-red-500 text-white p-2 rounded hover:bg-red-600"
      >
        Logout
      </button>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farmers.map((farmer) => (
            <div key={farmer._id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">{farmer.userId.name}</h3>
              <p className="text-gray-600">Email: {farmer.userId.email}</p>
              <p className="text-gray-600">Aadhaar: {farmer.aadhaarNumber}</p>
              <p className="text-gray-600">
                Address: {farmer.address}, {farmer.villageMandal},{" "}
                {farmer.district}, {farmer.state} - {farmer.pincode}
              </p>
              <p className="text-gray-600">
                Crops: {farmer.cropsGrown.join(", ")}
              </p>
              <p className="text-gray-600">Status: {farmer.status}</p>
              {farmer.status === "pending" && (
                <div className="mt-4 flex space-x-4">
                  <button
                    onClick={() => handleApprove(farmer._id)}
                    className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(farmer._id)}
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
