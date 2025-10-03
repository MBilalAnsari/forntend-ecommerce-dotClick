import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { useCart } from '../context/CartContext'

const Header = () => {
  const navigate = useNavigate()
  const user = authService.getCurrentUser()
  const isAuthenticated = authService.isAuthenticated()
  const { cartCount } = useCart()

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <Link to="/">🛍️ DotClick</Link>
        </div>

        <nav className="nav">
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>

          {isAuthenticated ? (
            <>
              <Link to="/cart" className="cart-link">
                🛒 Cart
                {cartCount > 0 && (
                  <span className="cart-badge">{cartCount}</span>
                )}
              </Link>
              {authService.isAdmin() && (
                <Link to="/dashboard">Dashboard</Link>
              )}
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
              <span className="welcome">Welcome, {user?.username}!</span>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header
