import React, { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Get base URL from environment or use relative path
  const getBaseUrl = () => {
    return import.meta.env.VITE_API_URL || ''
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${getBaseUrl()}/api/auth/me`, {
        withCredentials: true
      })
      setUser(response.data.user)
    } catch (error) {
      console.log('Auth check failed:', error.response?.data?.message || 'Not authenticated')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password, source = 'user') => {
    try {
      const response = await axios.post(`${getBaseUrl()}/api/user/login`, 
        { email, password, source },
        { withCredentials: true }
      )
      setUser(response.data.user)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      }
    }
  }

  const signup = async (name, email, password) => {
    try {
      const response = await axios.post(`${getBaseUrl()}/api/user`, 
        { name, email, password },
        { withCredentials: true }
      )
      setUser(response.data.user)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      }
    }
  }

  const logout = async () => {
    try {
      await axios.post(`${getBaseUrl()}/api/auth/logout`, {}, 
        { withCredentials: true }
      )
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
    }
  }

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    checkAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}