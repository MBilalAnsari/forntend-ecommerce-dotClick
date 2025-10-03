import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { productService } from '../services/productService'
import { authService } from '../services/authService'
import ProductCard from '../components/ProductCard'
import Toast from '../components/Toast'
import { useCart } from '../context/CartContext'
import './Products.css'

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [debounceTimer, setDebounceTimer] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [filters, setFilters] = useState(productService.getProductFilters())
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' })
  const { updateCartCount } = useCart()

  // Optimized fetch function with useCallback
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const response = await productService.getProducts(filters)
      setProducts(response.products || [])
      setHasSearched(true)
    } catch (err) {
      setError('Failed to fetch products')
      console.error('Products fetch error:', err)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Initial load and filter changes
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Debounced search effect
  useEffect(() => {
    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    // Set new timer for search input
    const timer = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        search: searchInput.trim(),
        page: 1 // Reset to first page when searching
      }))
    }, 300) // 300ms debounce delay

    setDebounceTimer(timer)

    // Cleanup timer on unmount
    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [searchInput])

  // Handle filter changes (immediate for non-search filters)
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }))
  }, [])

  // Handle search input change
  const handleSearchChange = useCallback((e) => {
    setSearchInput(e.target.value)
  }, [])

  // Handle add to cart from ProductCard
 
 
  const handleAddToCart = useCallback(async (product) => {
    if (!authService.isAuthenticated()) {
      setToast({
        isVisible: true,
        message: 'Please login to add items to cart',
        type: 'error'
      });
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
      return;
    }

    try {
      const cartData = {
        productId: product._id,
        quantity: 1,
        size: product.size?.[0] || 'md',
        colour: (product.colours && product.colours.length > 0) ? product.colours[0] : 'default',
      };

      // console.log('Adding to cart:', cartData);

      await productService.addToCart(cartData);

      updateCartCount(1);

      setToast({
        isVisible: true,
        message: `${product.name} added to cart! 🛒`,
        type: 'success',
      });
    } catch (err) {
      console.error('Error adding to cart:', err);
      console.error('Error response:', err.response?.data);
      setToast({
        isVisible: true,
        message: `Failed to add product to cart: ${err.response?.data?.message || err.message}`,
        type: 'error',
      });
    }
  }, [updateCartCount]);


  
  // Handle navigation to product detail
  const handleNavigateToDetail = useCallback((product) => {
    // Navigation is handled by Link component in ProductCard
    // You could add analytics tracking here if needed
  }, [])

  // Handle add to wishlist
  const handleAddToWishlist = useCallback(async (product) => {
    if (!authService.isAuthenticated()) {
      setToast({
        isVisible: true,
        message: 'Please login to add to wishlist',
        type: 'error'
      })
      return
    }

    setToast({
      isVisible: true,
      message: 'Added to wishlist! ❤️',
      type: 'success'
    })
  }, [])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(productService.getProductFilters())
    setSearchInput('')
  }, [])
  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.search ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.category ||
      filters.tag ||
      filters.sortBy !== 'createdAt' ||
      filters.order !== 'desc'
    )
  }, [filters])

  // Loading and error states
  if (loading && !hasSearched) {
    return <div className="loading">Loading products...</div>
  }

  if (error && !hasSearched) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="products-page">
      {/* <h1>Our Products</h1> */}

      {/* Filters */}
      <div className="filters">
        <select
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
        >
          <option value="createdAt">Newest</option>
          <option value="price">Price</option>
          <option value="name">Name</option>
          <option value="popularity">Popularity</option>
        </select>

        <select
          value={filters.order}
          onChange={(e) => handleFilterChange('order', e.target.value)}
        >
          <option value="desc">High to Low</option>
          <option value="asc">Low to High</option>
        </select>

        <select
          value={filters.category || ''}
          onChange={(e) => handleFilterChange('category', e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
          <option value="books">Books</option>
          <option value="home">Home & Garden</option>
          <option value="sports">Sports & Outdoors</option>
          <option value="beauty">Beauty & Personal Care</option>
        </select>

        <input
          type="number"
          placeholder="Min Price"
          value={filters.minPrice || ''}
          onChange={(e) => handleFilterChange('minPrice', e.target.value)}
          min="0"
          step="0.01"
        />

        <input
          type="number"
          placeholder="Max Price"
          value={filters.maxPrice || ''}
          onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
          min="0"
          step="0.01"
        />

        <input
          type="text"
          placeholder="Search products..."
          value={searchInput}
          onChange={handleSearchChange}
          className="search-input"
        />

        {hasActiveFilters && (
          <button onClick={clearFilters} className="clear-filters-btn">
            Clear Filters
          </button>
        )}
      </div>

      {/* Loading indicator for search/filtering */}
      {loading && hasSearched && (
        <div className="search-loading">
          {filters.search ? 'Searching...' : 'Filtering products...'}
        </div>
      )}

      {/* Products Grid */}
      <div className="products-grid">
        {products.map(product => (
          <ProductCard
            key={product._id}
            product={{
              ...product,
              colours: Array.isArray(product.colours) ? product.colours : (product.colour ? [product.colour] : []),
              size: product.size || [],
              instock: product.totalStock > 0,
              rating: product.rating || 4.5,
              reviewCount: product.reviewCount || Math.floor(Math.random() * 200) + 10
            }}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>

      {/* No products found message */}
      {products.length === 0 && hasSearched && !loading && (
        <div className="no-products">
          {hasActiveFilters
            ? `No products found matching your criteria. Try adjusting your filters.`
            : 'No products available at the moment.'
          }
        </div>
      )}

      {/* Toast Notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ isVisible: false, message: '', type: 'success' })}
      />
    </div>
  )
}

export default Products
