// src/components/HomePage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [cartItems] = useState(3); // Sample cart count

  // Smooth scroll function
  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const offsetTop = targetElement.offsetTop - 64; // Account for fixed navbar height
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
      setIsMenuOpen(false);
    }
  };

  // Close mobile menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMenuOpen]);

  const features = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      title: "Verified Farmers",
      description:
        "Directly connect with trusted local farmers. View profiles, farming practices, and certifications.",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ),
      title: "Farm-Fresh Produce",
      description:
        "Harvested daily and delivered straight from the farm to your doorstep. 100% organic guaranteed.",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
          />
        </svg>
      ),
      title: "Direct Communication",
      description:
        "Chat directly with farmers, ask questions, and customize your orders according to your needs.",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      title: "Local Delivery",
      description:
        "Get your fresh produce delivered within 24 hours. Support local farmers and reduce food miles.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Regular Customer",
      content:
        "I've been buying directly from Farmer Raj for 6 months now. The quality is amazing and I love knowing exactly where my food comes from!",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80",
    },
    {
      name: "Michael Rodriguez",
      role: "Restaurant Owner",
      content:
        "FarmDirect connects us with amazing local producers. Our customers can taste the difference in freshness compared to supermarket produce.",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80",
    },
    {
      name: "Raj Patel",
      role: "Farmer Partner",
      content:
        "This platform has transformed my business. I get fair prices, build relationships with customers, and reduce waste through direct orders.",
      image:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80",
    },
  ];

  const farmers = [
    {
      name: "Raj's Organic Farm",
      specialty: "Seasonal Vegetables & Herbs",
      distance: "8 miles away",
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1560493676-04071c5f467b?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80",
    },
    {
      name: "Green Valley Orchards",
      specialty: "Fruits & Berries",
      distance: "12 miles away",
      rating: 4.8,
      image:
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80",
    },
    {
      name: "Sunrise Dairy Farm",
      specialty: "Milk, Cheese & Eggs",
      distance: "15 miles away",
      rating: 4.7,
      image:
        "https://images.unsplash.com/photo-1549318061-1d5b156f2ffd?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80",
    },
    {
      name: "Heritage Grain Co.",
      specialty: "Wheat, Oats & Flour",
      distance: "20 miles away",
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1554692918-08fa0fdc9db3?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200 fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
                  Farm<span className="text-emerald-500">Connect</span>
                </h1>
              </div>
              <div className="hidden md:block ml-10">
                <div className="flex space-x-4">
                  <a
                    href="#home"
                    onClick={(e) => handleSmoothScroll(e, "home")}
                    className="text-emerald-600 font-medium px-3 py-2 rounded-md hover:bg-emerald-50 transition cursor-pointer"
                  >
                    Home
                  </a>
                  <a
                    href="#farmers"
                    onClick={(e) => handleSmoothScroll(e, "farmers")}
                    className="text-gray-700 hover:text-emerald-600 font-medium px-3 py-2 rounded-md hover:bg-emerald-50 transition cursor-pointer"
                  >
                    Farmers
                  </a>
                  <a
                    href="#features"
                    onClick={(e) => handleSmoothScroll(e, "features")}
                    className="text-gray-700 hover:text-emerald-600 font-medium px-3 py-2 rounded-md hover:bg-emerald-50 transition cursor-pointer"
                  >
                    How It Works
                  </a>
                  <a
                    href="#testimonials"
                    onClick={(e) => handleSmoothScroll(e, "testimonials")}
                    className="text-gray-700 hover:text-emerald-600 font-medium px-3 py-2 rounded-md hover:bg-emerald-50 transition cursor-pointer"
                  >
                    Reviews
                  </a>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <Link
                to="/cart"
                className="p-2 rounded-full hover:bg-gray-100 relative"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {cartItems > 0 && (
                  <span className="absolute top-0 right-0 bg-emerald-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItems}
                  </span>
                )}
              </Link>
              <Link
                to="/profile"
                className="ml-4 p-2 rounded-full hover:bg-gray-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </Link>
            </div>
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-green-600 focus:outline-none"
              >
                {isMenuOpen ? (
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
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
                ) : (
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a
                href="#home"
                onClick={(e) => handleSmoothScroll(e, "home")}
                className="text-emerald-600 block px-3 py-2 rounded-md font-medium cursor-pointer"
              >
                Home
              </a>
              <a
                href="#farmers"
                onClick={(e) => handleSmoothScroll(e, "farmers")}
                className="text-gray-700 hover:text-emerald-600 block px-3 py-2 rounded-md font-medium cursor-pointer"
              >
                Farmers
              </a>
              <a
                href="#features"
                onClick={(e) => handleSmoothScroll(e, "features")}
                className="text-gray-700 hover:text-emerald-600 block px-3 py-2 rounded-md font-medium cursor-pointer"
              >
                How It Works
              </a>
              <a
                href="#testimonials"
                onClick={(e) => handleSmoothScroll(e, "testimonials")}
                className="text-gray-700 hover:text-emerald-600 block px-3 py-2 rounded-md font-medium cursor-pointer"
              >
                Reviews
              </a>
              <div className="pt-2 mt-2 flex justify-center space-x-4">
                <Link
                  to="/cart"
                  className="p-2 rounded-full hover:bg-gray-100 relative"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  {cartItems > 0 && (
                    <span className="absolute top-0 right-0 bg-emerald-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItems}
                    </span>
                  )}
                </Link>
                <Link
                  to="/profile"
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div
        id="home"
        className="relative pt-16 pb-32 flex content-center items-center justify-center"
        style={{
          minHeight: "90vh",
          backgroundImage:
            "url('https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute top-0 w-full h-full bg-black opacity-40"></div>
        <div className="container relative mx-auto px-4">
          <div className="items-center flex flex-wrap">
            <div className="w-full lg:w-8/12 px-4 ml-auto mr-auto text-center">
              <div className="text-white">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in-down">
                  Buy Directly From Local Farmers
                </h1>
                <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto">
                  Connect with farmers in your community. Get fresh, seasonal produce straight from the source.
                </p>
                <Link
                  to="/customer/dashboard"
                  className="inline-block bg-emerald-600 text-white font-bold py-3 px-8 rounded-full hover:bg-emerald-700 transition transform hover:scale-105 shadow-lg"
                >
                  Browse Local Farmers
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Farmers Section */}
      <section id="farmers" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="w-full md:w-5/12 px-4 mr-auto ml-auto">
              <div className="md:pr-12">
                <div className="text-emerald-600 p-3 text-center inline-flex items-center justify-center w-16 h-16 mb-6 shadow-lg rounded-full bg-emerald-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-3xl font-semibold text-gray-800">
                  Our Mission
                </h3>
                <p className="mt-4 text-lg leading-relaxed text-gray-600">
                  FarmDirect was founded with a simple mission: to create a
                  direct connection between local farmers and consumers. We
                  eliminate the middlemen, ensuring farmers get fair prices
                  while customers receive the freshest produce at competitive
                  rates.
                </p>
                <p className="mt-4 text-lg leading-relaxed text-gray-600">
                  Our platform supports sustainable farming practices and helps
                  build stronger local food systems. By choosing FarmDirect,
                  you're investing in your community's health and economy.
                </p>
                <a
                  href="#"
                  className="mt-6 inline-block text-green-600 font-semibold hover:underline"
                >
                  Learn more about our story
                </a>
              </div>
            </div>
          <div className="text-center mt-8">
            <Link
              to="/farmers"
              className="inline-block bg-emerald-600 text-white font-medium py-3 px-8 rounded-full hover:bg-emerald-700 transition"
            >
              View All Farmers
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center text-center mb-16">
            <div className="w-full lg:w-6/12 px-4">
              <h2 className="text-4xl font-semibold text-gray-800">
                How FarmConnect Works
              </h2>
              <p className="text-lg leading-relaxed m-4 text-gray-600">
                Simple steps to get fresh produce directly from farms
              </p>
            </div>
          </div>
          <div className="flex flex-wrap">
            {features.map((feature, index) => (
              <div key={index} className="w-full md:w-1/2 lg:w-1/4 px-4 mb-8">
                <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition duration-300 h-full flex flex-col items-center text-center">
                  <div className="text-emerald-600 mb-4">{feature.icon}</div>
                  <div className="bg-emerald-100 text-emerald-800 rounded-full h-8 w-8 flex items-center justify-center mb-4">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-20"
        style={{
          background: "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Experience Farm-Fresh Produce?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of customers buying directly from local farmers. 
              Fresh, sustainable, and community-focused.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/signup"
                className="bg-white text-emerald-700 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition transform hover:scale-105 shadow-lg"
              >
                Create Account
              </Link>
              <Link
                to="/customer/dashboard"
                className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-full hover:bg-white/10 transition"
              >
                Browse Farmers
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-12 pb-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap">
            <div className="w-full md:w-4/12 px-4 mb-8 md:mb-0">
              <h4 className="text-xl font-semibold mb-4">FarmConnect</h4>
              <p className="text-gray-400 mb-4">
                Connecting consumers directly with local farmers for fresher produce and stronger communities.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="w-full md:w-4/12 px-4 mb-8 md:mb-0">
              <h4 className="text-xl font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#home"
                    onClick={(e) => handleSmoothScroll(e, "home")}
                    className="text-gray-400 hover:text-white transition"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="#farmers"
                    onClick={(e) => handleSmoothScroll(e, "farmers")}
                    className="text-gray-400 hover:text-white transition"
                  >
                    Farmers
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    onClick={(e) => handleSmoothScroll(e, "features")}
                    className="text-gray-400 hover:text-white transition"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#testimonials"
                    onClick={(e) => handleSmoothScroll(e, "testimonials")}
                    className="text-gray-400 hover:text-white transition"
                  >
                    Reviews
                  </a>
                </li>
                <li>
                  <Link
                    to="/faq"
                    className="text-gray-400 hover:text-white transition"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div className="w-full md:w-4/12 px-4">
              <h4 className="text-xl font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 mr-2 mt-1 text-emerald-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-gray-400">
                    123 Farm Road
                    <br />
                    Agriculture City, FC 12345
                  </span>
                </li>
                <li className="flex items-center">
                  <svg
                    className="h-5 w-5 mr-2 text-emerald-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span className="text-gray-400">+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center">
                  <svg
                    className="h-5 w-5 mr-2 text-emerald-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-gray-400">hello@farmconnect.com</span>
                </li>
              </ul>
            </div>
          </div>
          <hr className="my-6 border-gray-800" />
          <div className="flex flex-wrap items-center justify-center">
            <div className="w-full px-4 text-center">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} FarmConnect. All rights
                reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;