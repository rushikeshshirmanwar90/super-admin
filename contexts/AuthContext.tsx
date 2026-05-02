"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Hardcoded credentials
  const ADMIN_EMAIL = 'rushikeshshrimanwar@gmail.com'
  const ADMIN_PASSWORD = 'Rushikesh@123'

  useEffect(() => {
    // Check if user is already authenticated on page load
    const authStatus = localStorage.getItem('superAdminAuth')
    const authTimestamp = localStorage.getItem('superAdminAuthTime')
    
    if (authStatus === 'true' && authTimestamp) {
      const now = new Date().getTime()
      const authTime = parseInt(authTimestamp)
      const twentyFourHours = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
      
      // Check if authentication is still valid (within 24 hours)
      if (now - authTime < twentyFourHours) {
        setIsAuthenticated(true)
      } else {
        // Authentication expired, clear storage
        localStorage.removeItem('superAdminAuth')
        localStorage.removeItem('superAdminAuthTime')
      }
    }
    
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem('superAdminAuth', 'true')
      localStorage.setItem('superAdminAuthTime', new Date().getTime().toString())
      return true
    }
    
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('superAdminAuth')
    localStorage.removeItem('superAdminAuthTime')
  }

  const value = {
    isAuthenticated,
    login,
    logout,
    isLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}