import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '../services/authService'
import { productService } from '../services/productService'

const Dashboard = () => {
  const user = authService.getCurrentUser()
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    lowStockProducts: 0,
    trendingProducts: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authService.isAdmin()) {
      fetchDashboardStats()
    }
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      // For now, we'll use the products API to get some basic stats
      // In a real app, you'd have separate endpoints for dashboard stats
      const response = await productService.getProducts({
        limit: 1000 // Get all products for stats
      })

      const products = response.products || []
      const lowStockProducts = products.filter(p => p.totalStock < 10 && p.totalStock > 0).length
      const trendingProducts = products.filter(p => p.isTrending).length

      setStats({
        totalProducts: products.length,
        totalOrders: 0, // Would need orders API for this
        lowStockProducts,
        trendingProducts
      })
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!authService.isAdmin()) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>Admin access required</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Admin Dashboard</h1>
          <p>Welcome back, {user?.username}!</p>
        </div>
        <button onClick={fetchDashboardStats} className="refresh-btn">
          🔄 Refresh Stats
        </button>
      </div>

      {/* Stats Overview */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>{loading ? '...' : stats.totalProducts}</h3>
            <p>Total Products</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🛒</div>
          <div className="stat-info">
            <h3>{loading ? '...' : stats.totalOrders}</h3>
            <p>Total Orders</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <h3>{loading ? '...' : stats.lowStockProducts}</h3>
            <p>Low Stock Items</p>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">🔥</div>
          <div className="stat-info">
            <h3>{loading ? '...' : stats.trendingProducts}</h3>
            <p>Trending Products</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-actions">
        <h2>Quick Actions</h2>
        <div className="action-grid">
          <Link to="/admin/products/create" className="action-card primary">
            <div className="action-icon">➕</div>
            <div className="action-info">
              <h3>Add New Product</h3>
              <p>Create and publish new products</p>
            </div>
          </Link>

          <Link to="/admin/products" className="action-card secondary">
            <div className="action-icon">📋</div>
            <div className="action-info">
              <h3>Manage Products</h3>
              <p>Edit, delete, and organize products</p>
            </div>
          </Link>

          <div className="action-card info">
            <div className="action-icon">📊</div>
            <div className="action-info">
              <h3>View Analytics</h3>
              <p>Sales and performance metrics</p>
            </div>
          </div>

          <div className="action-card warning">
            <div className="action-icon">⚙️</div>
            <div className="action-info">
              <h3>Settings</h3>
              <p>Configure store settings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="dashboard-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">🆕</div>
            <div className="activity-info">
              <p><strong>New product</strong> was added to the store</p>
              <small>2 hours ago</small>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-icon">📈</div>
            <div className="activity-info">
              <p><strong>Sales increased</strong> by 15% this week</p>
              <small>1 day ago</small>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-icon">⚠️</div>
            <div className="activity-info">
              <p><strong>Low stock alert</strong> for 3 products</p>
              <small>3 days ago</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
