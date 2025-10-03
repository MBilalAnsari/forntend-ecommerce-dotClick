import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { authService } from '../services/authService'
import './Cart.css'

const Cart = () => {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authService.isAuthenticated()) {
      fetchCart()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchCart = async () => {
    try {
      setLoading(true)
      const response = await api.get('/cart')
      setCart(response.data)
    } catch (err) {
      setError('Failed to fetch cart')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return

    try {
      await api.put(`/cart/${itemId}`, { quantity: newQuantity })
      fetchCart() // Refresh cart
    } catch (err) {
      setError('Failed to update quantity')
      console.error(err)
    }
  }

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`)
      fetchCart() // Refresh cart
    } catch (err) {
      setError('Failed to remove item')
      console.error(err)
    }
  }

  const clearCart = async () => {
    try {
      await api.delete('/cart')
      setCart({ items: [], totalItems: 0, totalAmount: 0 })
    } catch (err) {
      setError('Failed to clear cart')
      console.error(err)
    }
  }

  if (!authService.isAuthenticated()) {
    return (
      <div className="auth-required">
        <h2>Please login to view your cart</h2>
        <Link to="/login">Login</Link>
      </div>
    )
  }

  if (loading) return <div className="loading">Loading cart...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="cart-page">
      <h1>Your Shopping Cart</h1>

      {!cart || cart.totalItems === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <Link to="/products">Continue Shopping</Link>
        </div>
      ) : (
        <>
          <div className="cart-header">
            <button onClick={clearCart} className="clear-cart-btn">
              Clear Cart
            </button>
          </div>

          <div className="cart-items">
            {cart.items.map(item => (
              <div key={item._id} className="cart-item">
                <img
                  src={item.product?.images?.[0] || '/placeholder-product.png'}
                  alt={item.product?.name}
                  className="cart-item-image"
                />

                <div className="cart-item-details">
                  <h3>{item.product?.name}</h3>
                  {item.colour && <p>Color: {item.colour}</p>}
                  {item.size && <p>Size: {item.size}</p>}
                  <p className="cart-item-price">${item.product?.price}</p>
                </div>

                <div className="cart-item-quantity">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <div className="cart-item-total">
                  ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                </div>

                <button
                  onClick={() => removeItem(item._id)}
                  className="remove-btn"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="cart-total">
              <strong>Total: ${cart.totalAmount?.toFixed(2)}</strong>
            </div>
            <Link to="/checkout" className="checkout-btn">
              Proceed to Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

export default Cart
