import React, { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0)
  const [cartItems, setCartItems] = useState([])

  // Load cart count from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems')
    if (savedCart) {
      const items = JSON.parse(savedCart)
      setCartItems(items)
      setCartCount(items.length)
    }
  }, [])

  const addToCart = (item) => {
    const updatedCart = [...cartItems, item]
    setCartItems(updatedCart)
    setCartCount(updatedCart.length)
    localStorage.setItem('cartItems', JSON.stringify(updatedCart))
  }

  const removeFromCart = (itemId) => {
    const updatedCart = cartItems.filter(item => item._id !== itemId)
    setCartItems(updatedCart)
    setCartCount(updatedCart.length)
    localStorage.setItem('cartItems', JSON.stringify(updatedCart))
  }

  const clearCart = () => {
    setCartItems([])
    setCartCount(0)
    localStorage.removeItem('cartItems')
  }

  const updateCartCount = (count) => {
    setCartCount(count)
  }

  return (
    <CartContext.Provider
      value={{
        cartCount,
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        updateCartCount
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export default CartContext
