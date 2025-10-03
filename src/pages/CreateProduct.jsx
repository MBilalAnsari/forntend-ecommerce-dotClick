import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { productService } from '../services/productService'
import { authService } from '../services/authService'
import './CreateProduct.css'

const CreateProduct = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    colours: ['default'], // Changed from colour to colours array
    sizes: ['md'], // Changed from size to sizes array
    category: '',
    tags: '',
    inStock: true,
    totalStock: '',
    isTrending: false,
    productImages: []
  })
  const [imagePreviews, setImagePreviews] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [showColors, setShowColors] = useState(false)
  const [showSizes, setShowSizes] = useState(false)

  useEffect(() => {
    // Check admin status only once on mount
    const adminStatus = authService.isAdmin()
    setIsAdmin(adminStatus)

    if (!adminStatus) {
      navigate('/admin/products')
    }
  }, [navigate])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowColors(false)
        setShowSizes(false)
      }
    }

    if (showColors || showSizes) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showColors, showSizes])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setFormData(prev => ({
      ...prev,
      productImages: files
    }))

    // Create previews
    const previews = files.map(file => URL.createObjectURL(file))
    setImagePreviews(previews)
  }

  // Add size to the sizes array (for checkboxes)
  const addSize = (size) => {
    console.log('Adding size:', size, 'Current sizes:', formData.sizes)
    if (!formData.sizes.includes(size)) {
      setFormData(prev => {
        const newSizes = [...prev.sizes, size]
        console.log('New sizes array:', newSizes)
        return {
          ...prev,
          sizes: newSizes
        }
      })
    }
  }

  // Remove size from the sizes array (for checkboxes)
  const removeSize = (sizeToRemove) => {
    console.log('Removing size:', sizeToRemove, 'Current sizes:', formData.sizes)
    setFormData(prev => {
      const newSizes = prev.sizes.filter(size => size !== sizeToRemove)
      console.log('New sizes array after removal:', newSizes)
      return {
        ...prev,
        sizes: newSizes
      }
    })
  }

  // Add colour to the colours array
  const addColour = (colour) => {
    console.log('Adding colour:', colour, 'Current colours:', formData.colours)
    if (!formData.colours.includes(colour)) {
      setFormData(prev => {
        const newColours = [...prev.colours, colour]
        console.log('New colours array:', newColours)
        return {
          ...prev,
          colours: newColours
        }
      })
    }
  }

  // Remove colour from the colours array
  const removeColour = (colourToRemove) => {
    console.log('Removing colour:', colourToRemove, 'Current colours:', formData.colours)
    setFormData(prev => {
      const newColours = prev.colours.filter(colour => colour !== colourToRemove)
      console.log('New colours array after removal:', newColours)
      return {
        ...prev,
        colours: newColours
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Debug: Check current form data
      console.log('Current formData:', formData)
      console.log('productImages in formData:', formData.productImages)
      console.log('productImages type:', typeof formData.productImages)
      console.log('productImages length:', formData.productImages ? formData.productImages.length : 'undefined')
      console.log('Sizes in formData:', formData.sizes)
      console.log('Type of sizes:', typeof formData.sizes)
      console.log('Is sizes array:', Array.isArray(formData.sizes))

      // Prepare data for submission
      const submitData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        colours: formData.colours, // Changed from colour to colours array
        size: formData.sizes, // ✅ Change from 'sizes' to 'size' to match backend model
        category: formData.category || undefined,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        inStock: formData.inStock,
        totalStock: parseInt(formData.totalStock),
        isTrending: formData.isTrending,
        productImages: formData.productImages // ✅ Add missing productImages
      }

      console.log('Submitting data:', submitData) // Debug log
      await productService.createProduct(submitData)
      navigate('/admin/products')
    } catch (err) {
      console.error('Submit error:', err) // Debug log
      setError(err.response?.data?.message || 'Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking admin status
  if (isAdmin === false) {
    return (
      <div className="loading">
        <p>Checking permissions...</p>
      </div>
    )
  }

  return (
    <div className="create-product-page">
      <div className="page-header">
        <h1>Create New Product</h1>
        <button
          type="button"
          onClick={() => navigate('/admin/products')}
          className="back-btn"
        >
          ← Back to Products
        </button>
      </div>

      <form onSubmit={handleSubmit} className="product-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-sections">
          {/* Basic Information */}
          <div className="form-section">
            <h2>Basic Information</h2>

            <div className="form-group">
              <label htmlFor="name">Product Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter product name"
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                placeholder="Enter product description"
                autoComplete="off"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  autoComplete="off"
                />
              </div>

              <div className="form-group">
                <label htmlFor="totalStock">Stock Quantity *</label>
                <input
                  type="number"
                  id="totalStock"
                  name="totalStock"
                  value={formData.totalStock}
                  onChange={handleInputChange}
                  required
                  min="0"
                  placeholder="0"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Colors</label>
                <div className="dropdown-container">
                  <button
                    type="button"
                    className="dropdown-toggle"
                    onClick={() => setShowColors(!showColors)}
                  >
                    Select Colors ({formData.colours.length} selected)
                    <span className={`dropdown-arrow ${showColors ? 'rotated' : ''}`}>▼</span>
                  </button>
                  {showColors && (
                    <div className="dropdown-content">
                      <div className="dropdown-grid">
                        {['red', 'blue', 'green', 'black', 'white', 'yellow', 'purple', 'pink', 'orange', 'gray', 'brown', 'default'].map(colour => (
                          <label key={colour} className={`dropdown-item ${formData.colours.includes(colour) ? 'selected' : ''}`}>
                            <input
                              type="checkbox"
                              checked={formData.colours.includes(colour)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  addColour(colour)
                                } else {
                                  removeColour(colour)
                                }
                              }}
                              className="dropdown-checkbox"
                            />
                            <span className="dropdown-label">
                              {colour.charAt(0).toUpperCase() + colour.slice(1)}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <small>Select multiple colors for this product</small>
              </div>

              <div className="form-group">
                <label>Sizes</label>
                <div className="dropdown-container">
                  <button
                    type="button"
                    className="dropdown-toggle"
                    onClick={() => setShowSizes(!showSizes)}
                  >
                    Select Sizes ({formData.sizes.length} selected)
                    <span className={`dropdown-arrow ${showSizes ? 'rotated' : ''}`}>▼</span>
                  </button>
                  {showSizes && (
                    <div className="dropdown-content">
                      <div className="dropdown-grid">
                        {['xs', 'sm', 'md', 'lg', 'xl', 'xxl'].map(size => (
                          <label key={size} className={`dropdown-item ${formData.sizes.includes(size) ? 'selected' : ''}`}>
                            <input
                              type="checkbox"
                              checked={formData.sizes.includes(size)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  addSize(size)
                                } else {
                                  removeSize(size)
                                }
                              }}
                              className="dropdown-checkbox"
                            />
                            <span className="dropdown-label">
                              {size.toUpperCase()}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <small>Select multiple sizes for this product</small>
              </div>
            </div>
          </div>

          {/* Category and Tags */}
          <div className="form-section">
            <h2>Category & Tags</h2>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                autoComplete="off"
              >
                <option value="">Select Category</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="books">Books</option>
                <option value="home">Home & Garden</option>
                <option value="sports">Sports & Outdoors</option>
                <option value="beauty">Beauty & Personal Care</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="tags">Tags (comma-separated)</label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="e.g., summer, cotton, casual"
                autoComplete="off"
              />
              <small>Separate multiple tags with commas</small>
            </div>
          </div>

          {/* Settings */}
          <div className="form-section">
            <h2>Settings</h2>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="inStock"
                  checked={formData.inStock}
                  onChange={handleInputChange}
                />
                <span className="checkmark"></span>
                In Stock
              </label>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isTrending"
                  checked={formData.isTrending}
                  onChange={handleInputChange}
                />
                <span className="checkmark"></span>
                Mark as Trending
              </label>
            </div>
          </div>

          {/* Product Images */}
          <div className="form-section">
            <h2>Product Images</h2>
            <p className="section-description">
              Upload up to 5 product images. First image will be used as the main product image.
            </p>

            <div className="form-group">
              <label htmlFor="productImages">Product Images *</label>
              <input
                type="file"
                id="productImages"
                name="productImages"
                onChange={handleImageChange}
                multiple
                accept="image/*"
                required
              />
              <small>Supported formats: JPG, PNG, WebP (Max 5MB each)</small>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="image-previews">
                {imagePreviews.map((preview, index) => (
                  <div key={`preview-${index}`} className="image-preview-item">
                    <img src={preview} alt={`Preview ${index + 1}`} />
                    <span className="preview-label">Image {index + 1}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="form-actions">
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Creating Product...' : 'Create Product'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="cancel-btn"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateProduct
