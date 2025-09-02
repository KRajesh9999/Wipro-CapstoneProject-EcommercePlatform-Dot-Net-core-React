import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { productService } from "../services/productService";
import { setProducts, setLoading } from "../redux/slices/productSlice";
import ProductCard from "../components/ProductCard";
import Loading from "../components/Loading";

const Home = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.products);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      dispatch(setLoading(true));
      try {
        const data = await productService.getAllProducts();
        dispatch(setProducts(data));
        setFilteredProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        dispatch(setProducts([]));
        setFilteredProducts([]);
        dispatch(setLoading(false));
      }
    };

    fetchProducts();
  }, [dispatch]);

  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(
        (product) =>
          product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by price range
    if (priceRange.min !== "") {
      filtered = filtered.filter(
        (product) => product.price >= parseFloat(priceRange.min)
      );
    }
    if (priceRange.max !== "") {
      filtered = filtered.filter(
        (product) => product.price <= parseFloat(priceRange.max)
      );
    }

    // Sort products
    if (sortBy) {
      filtered = [...filtered].sort((a, b) => {
        switch (sortBy) {
          case "price-low":
            return a.price - b.price;
          case "price-high":
            return b.price - a.price;
          case "name-asc":
            return a.name.localeCompare(b.name);
          case "name-desc":
            return b.name.localeCompare(a.name);
          case "newest":
            return new Date(b.createdAt) - new Date(a.createdAt);
          default:
            return 0;
        }
      });
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, priceRange, sortBy, products]);

  // Get unique categories
  const categories = [...new Set(products.map((product) => product.category))];

  if (loading) return <Loading />;

  return (
    <div>
      {/* Hero Section */}
      <div className="home-wrapper">
        <div className="hero-section bg-gradient text-white py-5 mb-5">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6">
                <h1 className="display-4 fw-bold mb-3">The Z-Mart</h1>
                <p className="lead mb-4">
                  Shop Z-Mart today – amazing products, unbeatable prices, zero
                  hassle
                </p>
                <div className="d-flex gap-3">
                  <span className="badge bg-light text-dark px-3 py-2">
                    <i className="fas fa-shipping-fast me-2"></i>Fast Delivery
                  </span>
                  <span className="badge bg-light text-dark px-3 py-2">
                    <i className="fas fa-undo me-2"></i>Fast Returns
                  </span>
                  <span className="badge bg-light text-dark px-3 py-2">
                    <i className="fas fa-headset me-2"></i>24/7 Support
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          {/* Search and Filter Bar */}
          <div className="search-filter-section bg-white rounded-3 shadow-sm p-4 mb-5">
            <div className="row g-3">
              {/* First Row */}
              <div className="col-lg-3 col-md-4">
                <label className="form-label fw-semibold">Category</label>
                <select
                  className="form-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-lg-6 col-md-6">
                <label className="form-label fw-semibold">
                  Search Products
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="fas fa-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search by name, description, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setSearchTerm("")}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
              </div>
              <div className="col-lg-3 col-md-2">
                <label className="form-label fw-semibold">Sort By</label>
                <select
                  className="form-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="">Default</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>

              {/* Second Row */}
              <div className="col-lg-4 col-md-6">
                <label className="form-label fw-semibold">Price Range</label>
                <div className="row g-2">
                  <div className="col-6">
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) =>
                          setPriceRange({ ...priceRange, min: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) =>
                          setPriceRange({ ...priceRange, max: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-md-3">
                <label className="form-label fw-semibold">Quick Filters</label>
                <div className="d-flex gap-2 flex-wrap">
                  <button
                    className={`btn btn-sm ${
                      priceRange.min === "" && priceRange.max === "50"
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => setPriceRange({ min: "", max: "50" })}
                  >
                    Under $50
                  </button>
                  <button
                    className={`btn btn-sm ${
                      priceRange.min === "50" && priceRange.max === "200"
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => setPriceRange({ min: "50", max: "200" })}
                  >
                    $50-$200
                  </button>
                  <button
                    className={`btn btn-sm ${
                      priceRange.min === "200" && priceRange.max === ""
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => setPriceRange({ min: "200", max: "" })}
                  >
                    Over $200
                  </button>
                </div>
              </div>
              <div className="col-lg-4 col-md-3 d-flex align-items-end">
                <button
                  className="btn btn-outline-danger w-100"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("");
                    setPriceRange({ min: "", max: "" });
                    setSortBy("");
                  }}
                >
                  <i className="fas fa-times me-2"></i>Clear All Filters
                </button>
              </div>
            </div>
          </div>

          {/* Results Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold mb-0">
              {searchTerm || selectedCategory ? (
                <>
                  <i className="fas fa-filter me-2 text-primary"></i>
                  {selectedCategory ? selectedCategory + " " : ""}Results
                  <span className="badge bg-primary ms-2">
                    {filteredProducts.length}
                  </span>
                </>
              ) : (
                <>
                Trending Products
                </>
              )}
            </h3>

            {filteredProducts.length > 0 && (
              <div className="text-muted">
                <i className="fas fa-th-large me-2"></i>
                Showing {filteredProducts.length} products
              </div>
            )}
          </div>

          {/* Products Grid */}
          <div className="row">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-12">
                <div className="text-center py-5">
                  <div className="mb-4">
                    <i className="fas fa-search fa-3x text-muted mb-3"></i>
                    <h4 className="text-muted">
                      {searchTerm || selectedCategory
                        ? "No products found"
                        : "No products available"}
                    </h4>
                    <p className="text-muted">
                      {searchTerm || selectedCategory
                        ? "Try adjusting your search criteria or browse all products."
                        : "Check back later for new products."}
                    </p>
                  </div>
                  {(searchTerm || selectedCategory) && (
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategory("");
                      }}
                    >
                      <i className="fas fa-th me-2"></i>Explore All Products
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
        .home-wrapper {
          margin-left: 1px; /* default sidebar width */
          transition: margin-left 0.6s ease;
          padding: 30px;
        }

        /* When sidebar is collapsed */
        .sidebar-collapsed ~ .home-wrapper {
          margin-left: 70px;
        }

        .hero-section {
          background: radial-gradient(
              circle at top left,
              rgba(0, 0, 0, 0.95),
              rgba(15, 15, 30, 0.98)
            ),
            url("https://www.transparenttextures.com/patterns/stardust.png");
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          position: relative;
          border-radius: 0 0 50px 50px;
          margin-bottom: 3rem;
          color: #f5f5f5;
        }

        .hero-section::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg,
            rgba(0, 0, 0, 0.85),
            rgba(25, 25, 50, 0.85)
          );
          border-radius: 0 0 50px 50px;
          z-index: 1;
        }

        .hero-section .container {
          position: relative;
          z-index: 2;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
          border: 1.5px solid rgba(255, 255, 255, 0.2);
          min-height: 100px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          text-align: center;
          transition: all 0.3s ease;
          cursor: pointer;
          color: #eaeaea;
        }

        .stat-card:hover {
          transform: rotate(-5deg) scale(1.05);
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.4);
          box-shadow: 0 10px 25px rgba(255, 255, 255, 0.2);
        }

        .stat-card h3 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          color: #ffffff;
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
        }

        .stat-card p {
          font-size: 0.9rem;
          opacity: 0.85;
          color: #d1d1d1;
        }

        .search-filter-section {
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(20, 20, 35, 0.6);
        }

        .hero-section h1 {
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.6),
            2px 2px 8px rgba(0, 0, 0, 0.7);
          color: #ffffff;
        }

        .hero-section .lead {
          text-shadow: 0 0 6px rgba(255, 255, 255, 0.5);
          color: #cfcfcf;
        }
      `}</style>
    </div>
  );
};

export default Home;
