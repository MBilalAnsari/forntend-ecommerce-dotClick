import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { authService } from '../services/authService'
import './Checkout.css'

const Checkout = () => {
  const navigate = useNavigate()
  const [orderData, setOrderData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)

  useEffect(() => {
    if (authService.isAuthenticated()) {
      fetchOrderSummary()
    } else {
      navigate('/login')
    }
  }, [navigate])

  const fetchOrderSummary = async () => {
    try {
      setLoading(true)
      setError('')

      // Call the order summary API endpoint
      const response = await api.post('/checkout')

      if (response.data) {
        setOrderData(response.data)
        console.log('Order Summary:', response.data)
      }
    } catch (err) {
      console.error('Order summary error:', err)
      setError(err.response?.data?.message || 'Failed to fetch order summary')
    } finally {
      setLoading(false)
    }
  }

  const handlePlaceOrder = async () => {
    try {
      setProcessing(true)

      // Simulate order processing (demo mode)
      await new Promise(resolve => setTimeout(resolve, 2000))

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

  if (!orderData || orderData.totalItems === 0) {
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

          {orderData.orderSummary.map((item, index) => (
            <div key={index} className="checkout-item">
              <div className="checkout-item-details">
                <h3>{item.name}</h3>
                {item.colour && <p>Color: {item.colour}</p>}
                {item.size && <p>Size: {item.size}</p>}
                <p>Quantity: {item.quantity}</p>
                <p className="item-price">${item.price} each</p>
              </div>

              <div className="item-total">
                ${item.total}
              </div>
            </div>
          ))}

          <div className="checkout-total">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>${orderData.totalAmount}</span>
            </div>
            <div className="total-row">
              <span>Shipping:</span>
              <span>FREE</span>
            </div>
            <div className="total-row final">
              <strong>Total: ${orderData.totalAmount}</strong>
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
              {processing ? 'Placing Order...' : `Place Order - $${orderData.totalAmount}`}
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
