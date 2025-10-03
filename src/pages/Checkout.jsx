import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { authService } from '../services/authService'
import './Checkout.css'

const Checkout = () => {
  const navigate = useNavigate()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)

  useEffect(() => {
    if (authService.isAuthenticated()) {
      fetchCart()
    } else {
      navigate('/login')
    }
  }, [navigate])

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

  const handlePlaceOrder = async () => {
    try {
      setProcessing(true)

      // Create order without payment (demo mode)
      const orderData = {
        items: cart.items,
        totalAmount: cart.totalAmount,
        paymentMethod: 'demo', // Demo mode - no real payment
        status: 'confirmed' // Order confirmed immediately
      }

      // For demo purposes, just show success
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate processing

      setOrderPlaced(true)

    } catch (err) {
      setError('Failed to place order. Please try again.')
      setProcessing(false)
    }
  }

  if (!authService.isAuthenticated()) {
    return null // Will redirect to login
  }

  if (loading) return <div className="loading">Loading checkout...</div>
  if (error) return <div className="error">{error}</div>

  if (!cart || cart.totalItems === 0) {
    return (
      <div className="empty-cart">
        <h2>Your cart is empty</h2>
        <p>Add some products before checkout</p>
        <button onClick={() => navigate('/products')}>
          Continue Shopping
        </button>
      </div>
    )
  }

  if (orderPlaced) {
    return (
      <div className="order-success">
        <div className="success-icon">✅</div>
        <h2>Order Placed Successfully!</h2>
        <p>Thank you for your order. You'll receive a confirmation email shortly.</p>
        <div className="order-actions">
          <button onClick={() => navigate('/products')}>
            Continue Shopping
          </button>
          <button onClick={() => navigate('/dashboard')}>
            View Orders
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      <div className="checkout-container">
        <div className="order-summary">
          <h2>Order Summary</h2>

          {cart.items.map(item => (
            <div key={item._id} className="checkout-item">
              <img
                src={item.product?.images?.[0] || '/placeholder-product.png'}
                alt={item.product?.name}
                className="checkout-item-image"
              />

              <div className="checkout-item-details">
                <h3>{item.product?.name}</h3>
                {item.colour && <p>Color: {item.colour}</p>}
                {item.size && <p>Size: {item.size}</p>}
                <p>Quantity: {item.quantity}</p>
                <p className="item-price">${item.product?.price} each</p>
              </div>

              <div className="item-total">
                ${((item.product?.price || 0) * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}

          <div className="checkout-total">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>${cart.totalAmount?.toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>Shipping:</span>
              <span>FREE</span>
            </div>
            <div className="total-row final">
              <strong>Total: ${cart.totalAmount?.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        <div className="payment-section">
          <h2>Payment Information</h2>

          <div className="payment-method">
            <div className="payment-header">
              <input type="radio" checked readOnly />
              <span>Demo Payment Mode</span>
            </div>
            <p className="payment-note">
              This is a demo checkout. No real payment will be processed.
              Click "Place Order" to simulate order completion.
            </p>
          </div>

          <div className="checkout-actions">
            <button
              onClick={handlePlaceOrder}
              disabled={processing}
              className="place-order-btn"
            >
              {processing ? 'Placing Order...' : `Place Order - $${cart.totalAmount?.toFixed(2)}`}
            </button>

            <button
              onClick={() => navigate('/cart')}
              className="back-to-cart-btn"
              disabled={processing}
            >
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
