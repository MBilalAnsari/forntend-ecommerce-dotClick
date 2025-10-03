import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productService } from '../services/productService'
import { authService } from '../services/authService'
import CartModal from '../components/CartModal'
import './ProductDetail.css'

const ProductDetail = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [showCartModal, setShowCartModal] = useState(false)

  useEffect(() => {
    fetchProduct()
  }, [slug])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const data = await productService.getProductBySlug(slug)
      setProduct(data)
      if (data.size && data.size.length > 0) {
        setSelectedSize(data.size[0])
      }
      if (data.colour) {
        setSelectedColor(data.colour)
      }
    } catch (err) {
      setError('Failed to fetch product details')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!authService.isAuthenticated()) {
      navigate('/login')
      return
    }

    if (!selectedSize) {
      setError('Please select a size')
      return
    }

    try {
      setAddingToCart(true)
      await productService.addToCart({
        productId: product._id,
        quantity,
        size: selectedSize,
        colour: selectedColor
      })

      setShowCartModal(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add to cart')
      console.error(err)
    } finally {
      setAddingToCart(false)
    }
  }

  const closeCartModal = () => {
    setShowCartModal(false)
  }

  if (loading) return <div className="loading">Loading product...</div>
  if (error) return <div className="error">{error}</div>
  if (!product) return <div className="error">Product not found</div>

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        {/* Product Images - Left Side */}
        <div className="product-images">
          <div className="main-image">
            <img
              src={product.images?.[selectedImage] || '/placeholder-product.png'}
              alt={product.name}
            />
          </div>

          {product.images && product.images.length > 1 && (
            <div className="image-thumbnails">
              {product.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className={selectedImage === index ? 'active' : ''}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info - Right Side */}
        <div className="product-info">
          {/* Product Title */}
          <h1 className="product-title">{product.name}</h1>

          {/* Rating and Reviews */}
          <div className="product-rating">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`star ${i < Math.floor(product.rating || 4.5) ? 'filled' : ''}`}>
                  ✧
                </span>
              ))}
            </div>
            <span className="rating-text">
              ({product.rating || 4.5}) - {product.reviewCount || 120} reviews
            </span>
          </div>

          {/* Price */}
          <div className="product-price">
            ${product.price}
          </div>

          {/* Size Selection */}
          {product.size && product.size.length > 0 && (
            <div className="option-group">
              <label>Select Size:</label>
              <div className="size-options">
                {product.size.map(size => (
                  <button
                    key={size}
                    className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selection */}
          {product.colour && (
            <div className="option-group">
              <label>Color:</label>
              <div className="color-option">
                <span
                  className="color-display"
                  style={{ backgroundColor: product.colour.toLowerCase() }}
                ></span>
                <span>{product.colour}</span>
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="option-group">
            <label>Quantity:</label>
            <div className="quantity-controls">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                −
              </button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="product-actions">
            <button
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={addingToCart || !selectedSize}
            >
              {addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
            <button className="buy-now-btn">
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* Cart Modal */}
      <CartModal
        isOpen={showCartModal}
        onClose={closeCartModal}
        product={product}
        quantity={quantity}
        size={selectedSize}
        color={selectedColor}
      />
    </div>
  )
}

export default ProductDetail
