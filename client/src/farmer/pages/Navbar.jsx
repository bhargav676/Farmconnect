import { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FiGrid, FiUploadCloud, FiEdit, FiLogOut, FiMenu, FiX } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login'); // Redirect to login page after logout
  };

  // Helper for NavLink classes to avoid repetition
  const getNavLinkClass = ({ isActive }) =>
    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'text-white bg-slate-700'
        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
    }`;
  
  const getMobileNavLinkClass = ({ isActive }) =>
  `flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
    isActive
      ? 'text-white bg-slate-700'
      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
  }`;

  return (
    <nav className="bg-slate-800 shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand Name */}
          <div className="flex-shrink-0">

            <NavLink to="/farmer/dashboard" className="flex items-center space-x-2 text-white">
              <FiGrid size={22} className="text-teal-400" />
              <span className="text-lg font-bold">Farmer Dashboard</span>
            </NavLink>
          </div>
         

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex md:items-center md:space-x-4">
              <NavLink to="/farmer/dashboard/" className={getNavLinkClass}>
              <FiEdit className="mr-2" />
              dashboard
            </NavLink>
            <NavLink to="/farmer/dashboard/upload" className={getNavLinkClass}>
              <FiUploadCloud className="mr-2" />
              Upload Crop
            </NavLink>
            <NavLink to="/farmer/dashboard/update-delete" className={getNavLinkClass}>
              <FiEdit className="mr-2" />
              Manage Crops
            </NavLink>
          </div>
          
          {/* Desktop User Info & Logout */}
          <div className="hidden md:flex items-center space-x-4">
              <span className="text-slate-400 text-sm">
                Welcome, {user?.name || 'Farmer'}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors duration-200"
              >
                <FiLogOut className="mr-2" />
                Logout
              </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLink to="/farmer/dashboard/upload" className={getMobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>
              <FiUploadCloud className="mr-3" />
              Upload Crop
            </NavLink>
            <NavLink to="/farmer/dashboard/update-delete" className={getMobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>
              <FiEdit className="mr-3" />
              Manage Crops
            </NavLink>
          </div>
          <div className="pt-4 pb-3 border-t border-slate-700">
            <div className="flex items-center px-5">
              <div className="ml-3">
                <div className="text-base font-medium text-white">{user?.name || 'Farmer'}</div>
                <div className="text-sm font-medium text-slate-400">{user?.email}</div>
              </div>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                <FiLogOut className="mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;