import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { productService } from '../services/productService'
import { authService } from '../services/authService'

const EditProduct = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    colours: ['default'], // Changed from colour to colours array to match CreateProduct
    sizes: ['md'], // Changed from size to sizes array
    category: '',
    tags: '',
    inStock: true,
    totalStock: '',
    isTrending: false,
    productImages: []
  })
  const [imagePreviews, setImagePreviews] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [imagesToRemove, setImagesToRemove] = useState([])
  const [showColors, setShowColors] = useState(false)
  const [showSizes, setShowSizes] = useState(false)

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

  const fetchProduct = async () => {
    try {
      setFetching(true)
      const product = await productService.getProductById(id)

      const sizesArray = Array.isArray(product.size) ? product.size : (product.size ? [product.size] : ['md'])
      const coloursArray = Array.isArray(product.colours) ? product.colours : (product.colours ? [product.colours] : ['default'])

      const newFormData = {
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        colours: coloursArray,
        sizes: sizesArray,
        category: product.category?._id || product.category || '',
        tags: product.tags?.join(', ') || '',
        inStock: product.inStock !== false,
        totalStock: product.totalStock || '',
        isTrending: product.isTrending || false,
        productImages: []
      }

      setFormData(newFormData)
      setExistingImages(product.images || [])
      setImagePreviews(product.images || [])

    } catch (err) {
      setError('Failed to fetch product details')
    } finally {
      setFetching(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target

    setFormData(prev => {
      const newValue = type === 'checkbox' ? checked : value

      return {
        ...prev,
        [name]: newValue
      }
    })
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)

    setFormData(prev => ({
      ...prev,
      productImages: files
    }))

    // Create previews for new images
    const newPreviews = files.map(file => URL.createObjectURL(file))

    setImagePreviews(prev => {
      const updatedPreviews = [...existingImages, ...newPreviews]
      return updatedPreviews
    })
  }

  // Add size to the sizes array (for checkboxes)
  const addSize = (size) => {
    if (!formData.sizes.includes(size)) {
      setFormData(prev => ({
        ...prev,
        sizes: [...prev.sizes, size]
      }))
    }
  }

  // Add colour to the colours array
  const addColour = (colour) => {
    if (!formData.colours.includes(colour)) {
      setFormData(prev => ({
        ...prev,
        colours: [...prev.colours, colour]
      }))
    }
  }

  // Remove colour from the colours array
  const removeColour = (colourToRemove) => {
    setFormData(prev => ({
      ...prev,
      colours: prev.colours.filter(colour => colour !== colourToRemove)
    }))
  }

  // Remove size from the sizes array
  const removeSize = (sizeToRemove) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter(size => size !== sizeToRemove)
    }))
  }

  const removeImage = (imageUrl) => {
    const isMarkedForRemoval = imagesToRemove.includes(imageUrl);

    if (isMarkedForRemoval) {
      // Unmark for removal
      setImagesToRemove(prev => prev.filter(img => img !== imageUrl));
    } else {
      // Mark for removal
      setImagesToRemove(prev => [...prev, imageUrl]);
    }
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData()

      // Add all form fields to FormData
      formDataToSend.append('name', formData.name)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('price', parseFloat(formData.price))
      formDataToSend.append('category', formData.category || '')
      formDataToSend.append('totalStock', parseInt(formData.totalStock))
      formDataToSend.append('inStock', formData.inStock)
      formDataToSend.append('isTrending', formData.isTrending)

      // Handle arrays by converting them to JSON strings
      formDataToSend.append('colours', JSON.stringify(formData.colours))
      formDataToSend.append('sizes', JSON.stringify(formData.sizes))
      formDataToSend.append('tags', JSON.stringify(formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)))

      // Add images to remove if any
      if (imagesToRemove.length > 0) {
        formDataToSend.append('imagesToRemove', JSON.stringify(imagesToRemove))
      }

      // Add new images if any
      if (formData.productImages && formData.productImages.length > 0) {
        Array.from(formData.productImages).forEach((file, index) => {
          formDataToSend.append('productImages', file)
        })
      }

      await productService.updateProduct(id, formDataToSend, true)

      // Clear cache to ensure fresh data on admin page
      productService.clearCache()

      navigate('/admin/products')
    } catch (err) {
      console.error('Update error:', err)
      setError(err.response?.data?.message || 'Failed to update product')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      if (!authService.isAdmin()) {
        navigate('/admin/products')
        return;
      }

      if (!id) {
        if (isMounted) {
          setError('Product ID not found in URL');
          setFetching(false);
        }
        return;
      }

      try {
        await fetchProduct();
      } catch (err) {
        if (isMounted) {
          setError('Failed to load product details');
          setFetching(false);
        }
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id, navigate])

  if (!authService.isAdmin()) {
    return null // Will redirect
  }

  if (fetching) return <div className="loading">Loading product details...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="edit-product-page">
      <div className="page-header">
        <h1>Edit Product</h1>
        <button onClick={() => navigate('/admin/products')} className="back-btn">
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
              Manage your product images. Click on any image to mark it for removal. Click again to unmark it.
            </p>

            {/* Current Images */}
            {existingImages && existingImages.length > 0 && (
              <div className="current-images">
                <h3>Current Images ({existingImages ? existingImages.length : 0})</h3>
                <div className="image-grid">
                  {existingImages
                    .filter(image => !imagesToRemove.includes(image)) // Only show images NOT marked for removal
                    .map((image, index) => (
                      <div
                        key={index}
                        className="image-item"
                        onClick={() => removeImage(image)}
                        title="Click to remove this image"
                      >
                        <img
                          src={image}
                          alt={`Product image ${index + 1}`}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                            e.target.nextSibling.innerHTML = '<span style="color: #ef4444; font-size: 0.8rem;">Failed to load</span>';
                          }}
                        />
                        <div style={{display: 'none', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#f3f4f6', color: '#6b7280'}}>
                          Image unavailable
                        </div>
                        <div className="image-overlay">
                          <span className="overlay-text">Click to remove</span>
                        </div>
                      </div>
                    ))
                  }

                  {/* Show images marked for removal separately */}
                  {existingImages
                    .filter(image => imagesToRemove.includes(image)) // Only show images marked for removal
                    .map((image, index) => (
                      <div
                        key={`remove-${index}`}
                        className="image-item marked-for-removal"
                        onClick={() => removeImage(image)}
                        title="Click to keep this image"
                      >
                        <img
                          src={image}
                          alt={`Image to be removed ${index + 1}`}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                            e.target.nextSibling.innerHTML = '<span style="color: #ef4444; font-size: 0.8rem;">Failed to load</span>';
                          }}
                        />
                        <div style={{display: 'none', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#f3f4f6', color: '#6b7280'}}>
                          Image unavailable
                        </div>
                        <div className="image-overlay removal">
                          <span className="overlay-text">Will be removed - Click to keep</span>
                        </div>
                      </div>
                    ))
                  }
                </div>

                {imagesToRemove && imagesToRemove.length > 0 && (
                  <p className="removal-note">
                    {imagesToRemove.length} image{imagesToRemove.length > 1 ? 's' : ''} marked for removal
                  </p>
                )}
              </div>
            )}

            {/* Upload New Images */}
            <div className="form-group">
              <label htmlFor="productImages">Upload New Images</label>
              <input
                type="file"
                id="productImages"
                name="productImages"
                onChange={handleImageChange}
                multiple
                accept="image/*"
              />
              <small>Add new images to the product</small>
            </div>

            {/* New Image Previews */}
            {imagePreviews && existingImages && imagePreviews.length > existingImages.length && (
              <div className="new-images-preview">
                <h3>New Images Preview</h3>
                <div className="image-grid">
                  {imagePreviews.slice(existingImages.length).map((preview, index) => (
                    <div key={index} className="image-item new">
                      <img
                        src={preview}
                        alt={`New image ${index + 1}`}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                          e.target.nextSibling.innerHTML = '<span style="color: #f59e0b; font-size: 0.8rem;">Preview unavailable</span>';
                        }}
                      />
                      <div style={{display: 'none', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#f3f4f6', color: '#6b7280'}}>
                        Preview unavailable
                      </div>
                      <div className="image-overlay new">
                        <span className="overlay-text">New image</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="form-actions">
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Updating Product...' : 'Update Product'}
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

export default EditProduct
