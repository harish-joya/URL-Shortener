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
      const response = await axios.get('/api/admin/urls', {
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

  const getShortUrl = (shortId) => {
    return `http://localhost:10000/api/url/${shortId}`
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#ff758c] to-[#ff7eb3]">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            {user ? 'Admin privileges required to view this page.' : 'Please login as admin.'}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/admin-login')}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
            >
              Admin Login
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              User Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-6 bg-gradient-to-br from-[#ff758c] to-[#ff7eb3]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-white opacity-90">Manage all shortened URLs</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white">Welcome, {user?.name}</span>
            <div className="flex gap-2">
              <button
                onClick={refreshData}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                title="Refresh data"
              >
                {loading ? '🔄' : '🔃'}
              </button>
              <button
                onClick={handleLogout}
                className="bg-white text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-600">Total URLs</h3>
            <p className="text-3xl font-bold text-pink-600">{urls.length}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-600">Total Clicks</h3>
            <p className="text-3xl font-bold text-pink-600">
              {urls.reduce((total, url) => total + url.visitHistory.length, 0)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-600">Active Users</h3>
            <p className="text-3xl font-bold text-pink-600">
              {new Set(urls.map(url => url.createdBy?._id?.toString()).filter(Boolean)).size}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-600">Status</h3>
            <p className="text-lg font-bold text-green-600">✅ Connected</p>
          </div>
        </div>

        {/* URLs Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              All Shortened URLs {urls.length > 0 && `(${urls.length})`}
            </h2>
            <button
              onClick={refreshData}
              disabled={loading}
              className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-pink-700 disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="text-gray-500">Loading URLs...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">#</th>
                    <th className="px-6 py-3 text-left">Short URL</th>
                    <th className="px-6 py-3 text-left">Original URL</th>
                    <th className="px-6 py-3 text-left">Clicks</th>
                    <th className="px-6 py-3 text-left">Created By</th>
                    <th className="px-6 py-3 text-left">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {urls.map((url, index) => (
                    <tr key={url._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <a
                            href={getShortUrl(url.shortId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-mono"
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
                      <td className="px-6 py-4 max-w-md truncate" title={url.redirectURl}>
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
                      <td className="px-6 py-4">
                        {url.createdBy ? (
                          <div>
                            <div className="font-semibold">{url.createdBy.name}</div>
                            <div className="text-sm text-gray-500">{url.createdBy.email}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Unknown user</span>
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