import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./Login";
import Register from "./Register";
import RegisterFarmer from "./RegisterFarmer";
import AdminDashboard from "./admin/AdminDashboard";
import FarmerDashboard from "./farmer/FarmerDashboard";
import CustomerDashboard from "./customer/CustomerDashboard";
import CustomerProfile  from "./customer/CustomerProfile";
import ApprovalWaiting from "./admin/ApprovalWaiting";
import Rejected from "./admin/Rejected";
import PrivateRoute from "./PrivateRoute";
import ErrorBoundary from "./ErrorBoundary";
import CartPage from './customer/CartPage';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register-farmer" element={<RegisterFarmer />} />
            <Route
              path="/admin/dashboard/*" // It's good practice to add /* here too if AdminDashboard has nested routes
              element={
                <PrivateRoute roles={["admin"]}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/farmer/dashboard/*" // <-- The fix is here
              element={
                <PrivateRoute roles={["farmer"]} requireApproved={true}>
                  <FarmerDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/customer/dashboard/*" // It's good practice to add /* here too if CustomerDashboard has nested routes
              element={
                <PrivateRoute roles={["customer"]}>
                  <CustomerDashboard />
                </PrivateRoute>
              }
            />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/profile" element={<CustomerProfile />} />
            <Route
              path="/farmer/approval-waiting"
              element={
                <PrivateRoute roles={["farmer"]}>
                  <ApprovalWaiting />
                </PrivateRoute>
              }
            />
            <Route
              path="/farmer/rejected"
              element={
                <PrivateRoute roles={["farmer"]}>
                  <Rejected />
                </PrivateRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;