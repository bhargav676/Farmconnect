import React, { useEffect, useState, useMemo } from "react";


const ProductCard = ({ item }) => (
  <div
    className="group bg-white rounded-2xl shadow-sm overflow-hidden transform hover:scale-105 hover:shadow-xl transition-all duration-300 ease-in-out"
  >
    <div className="relative">
      <img
        src={item.image}
        alt={item.name}
        className="w-full h-48 object-cover"
      />
      <div
        className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold text-white rounded-full ${
          item.category === "Fruit" ? "bg-red-500" : "bg-green-600"
        }`}
      >
        {item.category}
      </div>
    </div>
    <div className="p-5 text-left">
      <h2 className="text-xl font-bold text-gray-800 truncate">{item.name}</h2>
      <p className="text-lg font-semibold text-green-700 mt-1">${item.price}</p>
    </div>
  </div>
);


const SkeletonCard = () => (
  <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
    <div className="w-full h-48 bg-gray-200"></div>
    <div className="p-5">
      <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
      <div className="h-5 w-1/4 bg-gray-200 rounded mt-2"></div>
    </div>
  </div>
);


// --- Main App Component ---

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    setLoading(true);
    fetch('./api.json')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then((data) => {
        setItems(data);
        setError(null);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setError("Could not fetch the items. Please try again later.");
        setItems([]);
      })
      .finally(() => {
        // Simulate a slightly longer load time to showcase skeleton
        setTimeout(() => setLoading(false), 500);
      });
  }, []);

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => filter === "All" || item.category === filter)
      .filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [items, filter, searchTerm]);

  const renderContent = () => {
    if (loading) {
      return Array.from({ length: 8 }).map((_, index) => (
        <SkeletonCard key={index} />
      ));
    }

    if (error) {
      return <p className="col-span-full text-center text-red-500 text-xl">{error}</p>;
    }

    if (filteredItems.length === 0) {
      return <p className="col-span-full text-center text-gray-500 text-xl">No items found.</p>;
    }
    
    return filteredItems.map((item) => (
      <ProductCard key={item.id} item={item} />
    ));
  };
  
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <main className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-800">
            Fresh Finds
          </h1>
          <p className="text-lg text-gray-500 mt-2">Your daily dose of fruits and vegetables</p>
        </header>

        {/* --- Controls: Search and Filter --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              placeholder="Search for an item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>
          <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded-full">
            {["All", "Fruit", "Vegetable"].map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-6 py-2 text-md font-semibold rounded-full transition-colors duration-300 ${
                  filter === category
                    ? "bg-green-600 text-white shadow"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* --- Items Grid --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {renderContent()}
        </div>
      </main>
    </div>
  ); 
}

export default App; 