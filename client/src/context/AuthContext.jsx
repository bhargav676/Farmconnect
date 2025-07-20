import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [farmerStatus, setFarmerStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setUser({
            email: response.data.email,
            role: response.data.role.toLowerCase(),
          }); // Normalize role
          setFarmerStatus(response.data.farmerStatus);
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem("token");
          setUser(null);
          setFarmerStatus(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );
      localStorage.setItem("token", response.data.token);
      setUser({ email, role: response.data.role.toLowerCase() }); // Normalize role to lowercase
      setFarmerStatus(response.data.farmerStatus);
      toast.success("Login successful!");
      return { ...response.data, role: response.data.role.toLowerCase() }; // Return normalized role
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name,
    email,
    password,
    role = "customer",
    farmerData = {}
  ) => {
    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          name,
          email,
          password,
          role,
          farmerData,
        }
      );
      localStorage.setItem("token", response.data.token);
      setUser({ email, role: response.data.role.toLowerCase() }); // Normalize role
      setFarmerStatus("pending");
      toast.success("Registration successful!");
      return { ...response.data, role: response.data.role.toLowerCase() }; // Return normalized role
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      console.error("Registration error:", error.response?.data);
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setFarmerStatus(null);
    toast.info("Logged out successfully");
  };
  

  return (
    <AuthContext.Provider
      value={{ user, farmerStatus, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
