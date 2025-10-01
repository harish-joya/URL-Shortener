import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const AdminDashboard = () => {
  const { user, logout, loading: authLoading } = useAuth()
  const [urls, setUrls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Get base URL from environment or use relative path
  const getBaseUrl = () => {
    return import.meta.env.VITE_API_URL || ''
  }

  const getShortUrl = (shortId) => {
    const baseUrl = getBaseUrl() || window.location.origin
    return `${baseUrl}/api/url/${shortId}`
  }

  useEffect(() => {
    if (!authLoading && user && user.role === 'admin') {
      fetchAllUrls()
    } else if (!authLoading && (!user || user.role !== 'admin')) {
      setLoading(false)
    }
  }, [user, authLoading])

  const fetchAllUrls = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await axios.get(`${getBaseUrl()}/api/admin/urls`, {
        withCredentials: true
      })
      setUrls(response.data.urls)
    } catch (error) {
      console.error('Error fetching admin URLs:', error)
      if (error.response?.status === 403) {
        setError('Access denied. Admin privileges required.')
      } else if (error.response?.status === 401) {
        setError('Please login again.')
        navigate('/admin-login')
      } else {
        setError('Failed to load URLs: ' + (error.response?.data?.error || 'Unknown error'))
      }
      setUrls([])
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (shortUrl) => {
    navigator.clipboard.writeText(shortUrl)
    alert('Copied to clipboard!')
  }

  const handleLogout = async () => {
    await logout()
    navigate('/admin-login')
  }

  const refreshData = () => {
    fetchAllUrls()
  }

  // Show loading only during initial auth check
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#ff758c] to-[#ff7eb3]">
        <div className="text-white text-xl">Checking authentication...</div>
      </div>
    )
  }

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#ff758c] to-[#ff7eb3] px-4">
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg text-center w-full max-w-md">
          <h2 className="text-xl md:text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            {user ? 'Admin privileges required to view this page.' : 'Please login as admin.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/admin-login')}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 text-sm md:text-base"
            >
              Admin Login
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 text-sm md:text-base"
            >
              User Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-4 md:py-8 px-3 md:px-6 bg-gradient-to-br from-[#ff758c] to-[#ff7eb3]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl md:text-4xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-white opacity-90 text-sm md:text-base">Manage all shortened URLs</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <span className="text-white text-sm md:text-base text-center sm:text-left">Welcome, {user?.name}</span>
            <div className="flex gap-2 w-full sm:w-auto justify-center">
              <button
                onClick={refreshData}
                disabled={loading}
                className="bg-green-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 text-sm"
                title="Refresh data"
              >
                {loading ? '🔄' : '🔃'}
              </button>
              <button
                onClick={handleLogout}
                className="bg-white text-red-600 px-3 py-2 md:px-4 md:py-2 rounded-lg font-semibold hover:bg-gray-100 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm md:text-base">
            {error}
            <button 
              onClick={() => setError('')}
              className="float-right text-red-800 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg">
            <h3 className="text-sm md:text-lg font-semibold text-gray-600">Total URLs</h3>
            <p className="text-xl md:text-3xl font-bold text-pink-600">{urls.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg">
            <h3 className="text-sm md:text-lg font-semibold text-gray-600">Total Clicks</h3>
            <p className="text-xl md:text-3xl font-bold text-pink-600">
              {urls.reduce((total, url) => total + url.visitHistory.length, 0)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg">
            <h3 className="text-sm md:text-lg font-semibold text-gray-600">Active Users</h3>
            <p className="text-xl md:text-3xl font-bold text-pink-600">
              {new Set(urls.map(url => url.createdBy?._id?.toString()).filter(Boolean)).size}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg">
            <h3 className="text-sm md:text-lg font-semibold text-gray-600">Status</h3>
            <p className="text-base md:text-lg font-bold text-green-600">✅ Connected</p>
          </div>
        </div>

        {/* URLs Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-4 md:px-6 py-3 md:py-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-lg md:text-xl font-semibold">
              All Shortened URLs {urls.length > 0 && `(${urls.length})`}
            </h2>
            <button
              onClick={refreshData}
              disabled={loading}
              className="bg-pink-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm hover:bg-pink-700 disabled:opacity-50 w-full sm:w-auto"
            >
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
          
          {loading ? (
            <div className="p-6 md:p-8 text-center">
              <div className="text-gray-500">Loading URLs...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Mobile Cards View */}
              <div className="block md:hidden">
                {urls.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <div className="text-4xl mb-3">🔗</div>
                      <h3 className="text-base font-semibold mb-2">No URLs Found</h3>
                      <p className="text-gray-600 text-sm">No URLs have been created yet.</p>
                      <p className="text-xs text-gray-500 mt-2">
                        URLs will appear here once users start shortening links.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 p-3">
                    {urls.map((url, index) => (
                      <div key={url._id} className="bg-gray-50 rounded-lg p-4 border">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            url.visitHistory.length > 10 ? 'bg-green-100 text-green-800' :
                            url.visitHistory.length > 0 ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {url.visitHistory.length} clicks
                          </span>
                        </div>
                        
                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <a
                              href={getShortUrl(url.shortId)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline font-mono text-sm break-all"
                            >
                              {url.shortId}
                            </a>
                            <button
                              onClick={() => copyToClipboard(getShortUrl(url.shortId))}
                              className="text-gray-500 hover:text-gray-700 p-1 flex-shrink-0"
                              title="Copy to clipboard"
                            >
                              📋
                            </button>
                          </div>
                          <div className="text-xs text-gray-500 break-all" title={url.redirectURl}>
                            {url.redirectURl.length > 60 ? `${url.redirectURl.substring(0, 60)}...` : url.redirectURl}
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <div>
                            {url.createdBy ? (
                              <div>
                                <div className="font-semibold">{url.createdBy.name}</div>
                                <div className="text-gray-400">{url.createdBy.email}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400">Unknown user</span>
                            )}
                          </div>
                          <div className="text-right">
                            <div>{new Date(url.createdAt).toLocaleDateString()}</div>
                            <div>{new Date(url.createdAt).toLocaleTimeString()}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop Table View */}
              <table className="hidden md:table w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Short URL</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original URL</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {urls.map((url, index) => (
                    <tr key={url._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <a
                            href={getShortUrl(url.shortId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-mono text-sm"
                          >
                            {url.shortId}
                          </a>
                          <button
                            onClick={() => copyToClipboard(getShortUrl(url.shortId))}
                            className="text-gray-500 hover:text-gray-700 p-1"
                            title="Copy to clipboard"
                          >
                            📋
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-md truncate text-sm" title={url.redirectURl}>
                        {url.redirectURl}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          url.visitHistory.length > 10 ? 'bg-green-100 text-green-800' :
                          url.visitHistory.length > 0 ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {url.visitHistory.length} clicks
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {url.createdBy ? (
                          <div>
                            <div className="font-semibold">{url.createdBy.name}</div>
                            <div className="text-gray-500">{url.createdBy.email}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Unknown user</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(url.createdAt).toLocaleDateString()}
                        <br />
                        <span className="text-xs">{new Date(url.createdAt).toLocaleTimeString()}</span>
                      </td>
                    </tr>
                  ))}
                  {urls.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <div className="text-6xl mb-4">🔗</div>
                          <h3 className="text-lg font-semibold mb-2">No URLs Found</h3>
                          <p className="text-gray-600">No URLs have been created yet.</p>
                          <p className="text-sm text-gray-500 mt-2">
                            URLs will appear here once users start shortening links.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard