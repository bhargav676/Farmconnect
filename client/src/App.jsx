import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./Login";
import Register from "./Register";
import RegisterFarmer from "./RegisterFarmer";
import AdminDashboard from "./admin/AdminDashboard";
import FarmerDashboard from "./farmer/FarmerDashboard";
import CustomerDashboard from "./customer/CustomerDashboard";
import ApprovalWaiting from "./admin/ApprovalWaiting";
import Rejected from "./admin/Rejected";
import PrivateRoute from "./PrivateRoute";
import ErrorBoundary from "./ErrorBoundary";

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
              path="/admin/dashboard"
              element={
                <PrivateRoute roles={["admin"]}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/farmer/dashboard"
              element={
                <PrivateRoute roles={["farmer"]} requireApproved={true}>
                  <FarmerDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/customer/dashboard"
              element={
                <PrivateRoute roles={["customer"]}>
                  <CustomerDashboard />
                </PrivateRoute>
              }
            />
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
