import React from 'react'
import './CartModal.css'

const CartModal = ({ isOpen, onClose, product, quantity, size, color }) => {
  if (!isOpen) return null

  return (
    <div className="cart-modal-overlay" onClick={onClose}>
      <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cart-modal-header">
          <span className="success-icon">✓</span>
          <h3 className="cart-modal-title">Added to Cart!</h3>
        </div>

        <div className="cart-modal-item">
          <img
            src={product.images?.[0] || '/placeholder-product.png'}
            alt={product.name}
          />
          <div className="cart-modal-item-details">
            <h4>{product.name}</h4>
            <p>
              Size: {size} | Color: {color} | Qty: {quantity}
            </p>
            <p className="item-price">${product.price * quantity}</p>
          </div>
        </div>

        <div className="cart-modal-actions">
          <button className="cart-modal-continue" onClick={onClose}>
            Continue Shopping
          </button>
          <button className="cart-modal-view-cart" onClick={() => window.location.href = '/cart'}>
            View Cart
          </button>
        </div>
      </div>
    </div>
  )
}

export default CartModal
