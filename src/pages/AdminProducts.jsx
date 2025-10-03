import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productService } from '../services/productService'
import { authService } from '../services/authService'

const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    order: 'desc',
    search: ''
  })
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (authService.isAdmin()) {
      fetchProducts()
    } else {
      setError('Admin access required')
      setLoading(false)
    }
  }, [filters])

  // Force refresh when component mounts (in case cache was cleared)
  useEffect(() => {
    const handleFocus = () => {
      // Check if we should refresh (e.g., if cache was recently cleared)
      const lastCacheClear = localStorage.getItem('lastCacheClear')
      if (lastCacheClear && Date.now() - parseInt(lastCacheClear) < 5000) {
        fetchProducts()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await productService.getProducts(filters)

      setProducts(response.products || [])
      setTotalPages(response.totalPages || 1)
    } catch (err) {
      setError('Failed to fetch products')
      console.error('AdminProducts fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(productId)
        fetchProducts() // Refresh the list
      } catch (err) {
        setError('Failed to delete product')
        console.error(err)
      }
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }))
  }

  if (!authService.isAdmin()) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>Admin access required</p>
      </div>
    )
  }

  if (loading) return <div className="loading">Loading products...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="admin-products-page">
      <div className="admin-header">
        <h1>Product Management</h1>
        <Link to="/admin/products/create" className="create-btn">
          + Add New Product
        </Link>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <div className="filter-group">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Sort by:</label>
          <select
            value={`${filters.sortBy}-${filters.order}`}
            onChange={(e) => {
              const [sortBy, order] = e.target.value.split('-')
              handleFilterChange('sortBy', sortBy)
              handleFilterChange('order', order)
            }}
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="price-asc">Price Low-High</option>
            <option value="price-desc">Price High-Low</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Items per page:</label>
          <select
            value={filters.limit}
            onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Category</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id}>
                <td>
                  <img
                    src={product.images?.[0] || '/placeholder-product.png'}
                    alt={product.name}
                    className="product-thumbnail"
                  />
                </td>
                <td>
                  <div className="product-info">
                    <strong>{product.name}</strong>
                    <small>{product.description?.substring(0, 60)}...</small>
                  </div>
                </td>
                <td>${product.price}</td>
                <td>
                  <span className={`stock-badge ${product.totalStock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                    {product.totalStock !== undefined ? product.totalStock : '0'}
                  </span>
                </td>
                <td>{product.category || 'N/A'}</td>
                <td>
                  <span className={`status-badge ${product.isActive !== false ? 'active' : 'inactive'}`}>
                    {product.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <Link
                      to={`/admin/products/edit/${product._id}`}
                      className="edit-btn"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <div className="no-products">
          <p>No products found</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={filters.page <= 1}
            onClick={() => handleFilterChange('page', filters.page - 1)}
          >
            Previous
          </button>

          <span className="page-info">
            Page {filters.page} of {totalPages}
          </span>

          <button
            disabled={filters.page >= totalPages}
            onClick={() => handleFilterChange('page', filters.page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default AdminProducts
