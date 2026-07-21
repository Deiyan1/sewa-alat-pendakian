'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface CartItem {
  id: string
  name: string
  price_per_day: number
  image_url: string
  quantity: number
  stock: number
}

interface CartContextType {
  cart: CartItem[]
  cartCount: number
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  rentalDays: number
  setRentalDays: (days: number) => void
  startDate: string
  setStartDate: (date: string) => void
  endDate: string
  setEndDate: (date: string) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [rentalDays, setRentalDays] = useState<number>(1)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('sewa_cart')
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (e) {
        console.error('Error parsing cart from localStorage', e)
      }
    }
    
    // Load dates if available
    const savedStart = localStorage.getItem('sewa_start_date')
    const savedEnd = localStorage.getItem('sewa_end_date')
    if (savedStart) setStartDate(savedStart)
    if (savedEnd) setEndDate(savedEnd)
  }, [])

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('sewa_cart', JSON.stringify(cart))
  }, [cart])

  // Sync dates to localStorage and recalculate rentalDays
  useEffect(() => {
    if (startDate) localStorage.setItem('sewa_start_date', startDate)
    if (endDate) localStorage.setItem('sewa_end_date', endDate)

    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // Inclusive of start/end day
      setRentalDays(diffDays > 0 ? diffDays : 1)
    } else {
      setRentalDays(1)
    }
  }, [startDate, endDate])

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0)

  const addToCart = (product: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)
      if (existingItem) {
        const newQty = Math.min(existingItem.quantity + quantity, product.stock)
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: newQty } : item
        )
      }
      return [...prevCart, { ...product, quantity: Math.min(quantity, product.stock) }]
    })
  }

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: Math.min(Math.max(1, quantity), item.stock) } : item
      )
    )
  }

  const clearCart = () => {
    setCart([])
    localStorage.removeItem('sewa_cart')
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        rentalDays,
        setRentalDays,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
