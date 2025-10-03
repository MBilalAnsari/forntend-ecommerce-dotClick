import React from 'react'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>🛍️ DotClick</h3>
            <p>Your one-stop shop for everything!</p>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <a href="/">Home</a>
            <a href="/products">Products</a>
            <a href="/cart">Cart</a>
          </div>

          <div className="footer-section">
            <h4>Support</h4>
            <a href="/contact">Contact Us</a>
            <a href="/faq">FAQ</a>
            <a href="/shipping">Shipping Info</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 DotClick. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
