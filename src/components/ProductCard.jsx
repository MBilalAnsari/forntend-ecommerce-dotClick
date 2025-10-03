import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './ProductCard.css'

const ProductCard = ({ product, onAddToCart }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const images = product.images || []
  const hasMultipleImages = images.length > 1

  // Auto-cycle through images when hovered
  useEffect(() => {
    if (!hasMultipleImages || !isHovered) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }, 2000) // Change image every 2 seconds

    return () => clearInterval(interval)
  }, [isHovered, images.length, hasMultipleImages])

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (onAddToCart) {
      onAddToCart(product)
    }
  }

  const nextImage = () => {
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }
  }

  const prevImage = () => {
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }
  }

  const goToImage = (index) => {
    setCurrentImageIndex(index)
  }

  return (
    <div className="product-card-modern" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {/* Wishlist */}
      <button className="wishlist-btn">♥</button>

      {/* Image Carousel */}
      <div className="product-image-container">
        <img
          src={images[currentImageIndex] || '/placeholder-product.png'}
          alt={product.name}
          className="product-image"
        />

        {/* Navigation Arrows - Only show on hover and if multiple images */}
        {hasMultipleImages && isHovered && (
          <>
            <button className="carousel-btn carousel-btn-left" onClick={prevImage}>
              &#8249;
            </button>
            <button className="carousel-btn carousel-btn-right" onClick={nextImage}>
              &#8250;
            </button>
          </>
        )}

        {/* Image Dots Indicator */}
        {hasMultipleImages && (
          <div className="image-dots">
            {images.map((_, index) => (
              <button
                key={index}
                className={`image-dot ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => goToImage(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="product-details">
        <h3 className="product-title">{product.name}</h3>

        {/* Tags */}
        <div className="product-tags">
          {product.tags?.map((tag, index) => (
            <span key={index} className="tag">
              {tag}
            </span>
          ))}
        </div>

        {/* Description */}
        <p className="product-description">
          {product.description?.slice(0, 100)}...
        </p>

        {/* Footer */}
        <div className="product-footer">
          <div className="price">${product.price}</div>
          <button
            className={`add-to-cart-btn ${!product.inStock ? 'disabled' : ''}`}
            onClick={handleAddToCart}
            disabled={!product.inStock}
          >
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>

        {/* Full View Button */}
        <Link to={`/product/${product.slug}`} className="view-btn">
          View Details
        </Link>
      </div>
    </div>
  );

}

export default ProductCard
