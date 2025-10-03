import api from './api.js'

// Product API Service with optimizations
export const productService = {
  // Cache for API responses to prevent duplicate calls
  _cache: new Map(),
  _cacheTimeout: 30000, // 30 seconds

  // Get cache key for filters
  _getCacheKey: (filters) => {
    return JSON.stringify(filters)
  },

  // Check if we have valid cached data
  _getCachedData: (filters) => {
    const key = productService._getCacheKey(filters)
    const cached = productService._cache.get(key)

    if (cached && (Date.now() - cached.timestamp) < productService._cacheTimeout) {
      return cached.data
    }

    return null
  },

  // Set cached data
  _setCachedData: (filters, data) => {
    const key = productService._getCacheKey(filters)
    productService._cache.set(key, {
      data,
      timestamp: Date.now()
    })
  },

  // Get all products with filters, sorting, and pagination
  getProducts: async (filters = {}) => {
    try {
      // Check cache first
      const cachedData = productService._getCachedData(filters)
      if (cachedData) {
        return cachedData
      }

      const queryParams = new URLSearchParams()

      // Add all filter parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value)
        }
      })

      const response = await api.get(`/products?${queryParams}`)

      // Cache the response
      productService._setCachedData(filters, response.data)

      return response.data
    } catch (error) {
      // Don't cache errors
      throw error
    }
  },

  // Get product by ID (for admin edit)
  getProductById: async (id) => {
    try {
      const response = await api.get(`/products/id/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get product by slug (public route)
  getProductBySlug: async (slug) => {
    try {
      const response = await api.get(`/products/${slug}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Add product to cart
  addToCart: async (cartData) => {
    try {
      const response = await api.post('/cart', cartData)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Create new product (admin only) - with file upload
  createProduct: async (productData) => {
    try {
      // Clear cache when creating new product
      productService._cache.clear()

      const formData = new FormData()

      // Add all product fields to FormData
      Object.entries(productData).forEach(([key, value]) => {
        if (key === 'productImages' && Array.isArray(value)) {
          // Handle multiple image files
          value.forEach((file, index) => {
            formData.append(`productImages`, file)
          })
        } else if (key === 'tags' && Array.isArray(value)) {
          // Handle tags array
          value.forEach(tag => formData.append('tags[]', tag))
        } else if (key === 'size' && Array.isArray(value)) {
          // Handle size array - append each size separately
          value.forEach(size => formData.append('size[]', size))
        } else if (key === 'colours' && Array.isArray(value)) {
          // Handle colours array - append each colour separately
          value.forEach(colour => formData.append('colours[]', colour))
        } else if (key === 'category' && typeof value === 'object') {
          // Handle category object
          formData.append('category', JSON.stringify(value))
        } else {
          formData.append(key, value)
        }
      })

      const response = await api.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Update product (admin only)
  updateProduct: async (id, productData, isFormData = false) => {
    try {
      // Clear cache when updating product
      productService._cache.clear()

      // If it's already FormData, use it directly
      if (isFormData && productData instanceof FormData) {
        const response = await api.put(`/products/${id}`, productData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        return response.data
      }

      // Otherwise, create FormData from the product data
      const formData = new FormData()

      // Add all product fields to FormData
      Object.entries(productData).forEach(([key, value]) => {
        if (key === 'productImages' && Array.isArray(value)) {
          // Handle multiple image files
          value.forEach((file, index) => {
            formData.append(`productImages`, file)
          })
        } else if (key === 'tags' && Array.isArray(value)) {
          // Handle tags array
          value.forEach(tag => formData.append('tags[]', tag))
        } else if (key === 'size' && Array.isArray(value)) {
          // Handle size array - append each size separately
          value.forEach(size => formData.append('size[]', size))
        } else if (key === 'colours' && Array.isArray(value)) {
          // Handle colours array - append each colour separately
          value.forEach(colour => formData.append('colours[]', colour))
        } else if (key === 'category' && typeof value === 'object') {
          // Handle category object
          formData.append('category', JSON.stringify(value))
        } else {
          formData.append(key, value)
        }
      })

      const response = await api.put(`/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Delete product (admin only)
  deleteProduct: async (id) => {
    try {
      // Clear cache when deleting product
      productService._cache.clear()

      const response = await api.delete(`/products/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Clear cache manually (useful for admin operations)
  clearCache: () => {
    productService._cache.clear()
  },

  // Helper function to get product filters
  getProductFilters: () => {
    return {
      page: 1,
      limit: 12,
      sortBy: 'createdAt',
      order: 'desc',
      category: '',
      tag: '',
      minPrice: '',
      maxPrice: '',
      inStock: '',
      isTrending: '',
      search: ''
    }
  }
}

export default productService
