import React from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to DotClick</h1>
          <p>Your ultimate shopping destination for quality products at amazing prices</p>
          <Link to="/products" className="cta-button">
            🛍️ Shop Now
          </Link>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <div className="feature-card">
            <h3>🔥 Trending Products</h3>
            <p>Discover the latest and most popular items handpicked by our experts</p>
          </div>

          <div className="feature-card">
            <h3>⚡ Fast & Free Delivery</h3>
            <p>Get your orders delivered quickly with our reliable shipping partners</p>
          </div>

          <div className="feature-card">
            <h3>🛡️ Secure Payment</h3>
            <p>Safe and secure checkout process with multiple payment options</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
