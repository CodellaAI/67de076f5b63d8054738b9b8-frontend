
'use client'

import { createContext, useState, useEffect } from 'react'
import Cookies from 'js-cookie'

export const AuthContext = createContext()

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check for existing user session on load
  useEffect(() => {
    const storedUser = Cookies.get('user')
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error('Error parsing user data:', error)
        Cookies.remove('user')
      }
    }
    
    setLoading(false)
  }, [])

  const login = (userData) => {
    setUser(userData)
    Cookies.set('user', JSON.stringify(userData), { expires: 7 })
  }

  const logout = () => {
    setUser(null)
    Cookies.remove('user')
  }

  const updateUser = (userData) => {
    setUser(userData)
    Cookies.set('user', JSON.stringify(userData), { expires: 7 })
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
