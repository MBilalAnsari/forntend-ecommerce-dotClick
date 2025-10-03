import api from './api.js'

// Authentication services
export const authService = {
  // Register new user
  register: async (userData) => {
    const formData = new FormData()

    // Add text fields
    Object.keys(userData).forEach(key => {
      if (key !== 'profileImage') {
        formData.append(key, userData[key])
      }
    })

    // Add profile image if exists
    if (userData.profileImage) {
      formData.append('profileImage', userData.profileImage)
    }

    const response = await api.post('/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data))
    }

    return response.data
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)

    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data))
    }

    return response.data
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token')
  },

  // Check if user is admin
  isAdmin: () => {
    const user = authService.getCurrentUser()
    return user?.role === 'admin'
  }
}
