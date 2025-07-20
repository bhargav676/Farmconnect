import { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import axios from "axios";

const ApprovalWaiting = () => {
  const { user, farmerStatus, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "farmer") {
      navigate("/");
      return;
    }

    if (farmerStatus === "approved") {
      navigate("/farmer/dashboard");
      return;
    }

    if (farmerStatus === "rejected") {
      navigate("/farmer/rejected");
      return;
    }

    const interval = setInterval(async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.data.farmerStatus === "approved") {
          navigate("/farmer/dashboard");
        } else if (response.data.farmerStatus === "rejected") {
          navigate("/farmer/rejected");
        }
      } catch (err) {
        console.error(err);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [user, farmerStatus, navigate]);

  if (!user || user.role !== "farmer") return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-cyan-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-green-100">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-3 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-green-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-11a1 1 0 112 0v4a1 1 0 11-2 0V7zm1 8a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Approval Pending
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Your registration is under review. You will be notified once the admin
          approves or rejects your application.
        </p>

        <button
          onClick={logout}
          className="w-full bg-red-500 text-white p-3 rounded-lg font-medium hover:bg-red-600 transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg"
        >
          Logout
        </button>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-center text-gray-600">
            Back to{" "}
            <Link
              to="/"
              className="font-medium text-green-600 hover:text-green-800 hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApprovalWaiting;
