import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const [urls, setUrls] = useState([])
  const [originalUrl, setOriginalUrl] = useState('')
  const [loading, setLoading] = useState(false)
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
    fetchUserUrls()
  }, [])

  const fetchUserUrls = async () => {
    try {
      const response = await axios.get(`${getBaseUrl()}/api/urls`, {
        withCredentials: true
      })
      setUrls(response.data.urls)
    } catch (error) {
      console.log('Not authenticated or no URLs found')
      setUrls([])
    }
  }

  const handleShortenUrl = async (e) => {
    e.preventDefault()
    if (!originalUrl) return

    setLoading(true)
    
    try {
      const response = await axios.post(`${getBaseUrl()}/api/url`, 
        { url: originalUrl },
        { withCredentials: true }
      )
      
      setUrls(response.data.urls)
      setOriginalUrl('')
      alert('URL shortened successfully!')
    } catch (error) {
      if (error.response?.status === 401) {
        alert('Please login first to shorten URLs!')
        navigate('/login')
      } else {
        alert('Error shortening URL: ' + (error.response?.data?.error || 'Unknown error'))
      }
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
    navigate('/login')
  }

  return (
    <div className="min-h-screen py-4 md:py-8 px-3 md:px-6 bg-gradient-to-br from-[#ff758c] to-[#ff7eb3]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl md:text-4xl font-bold text-white">URL Shortener</h1>
            <p className="text-white opacity-90 text-sm md:text-base mt-1">
              {user ? `Welcome, ${user.name}` : 'Please Login'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white text-pink-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 text-sm md:text-base w-full sm:w-auto"
          >
            {user ? 'Logout' : 'Login'}
          </button>
        </div>

        {/* URL Shortening Form */}
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg mb-6 md:mb-8">
          <form onSubmit={handleShortenUrl} className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              placeholder="Enter your long URL here..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm md:text-base"
              required
            />
            <button
              type="submit"
              disabled={loading || !user}
              className="bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 disabled:opacity-50 text-sm md:text-base whitespace-nowrap"
            >
              {loading ? 'Shortening...' : 'Shorten URL'}
            </button>
          </form>
          {!user && (
            <p className="text-sm text-red-600 mt-3 text-center sm:text-left">
              🔐 Please login to shorten URLs
            </p>
          )}
        </div>

        {/* Your URLs Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-4 md:px-6 py-3 md:py-4 border-b">
            <h2 className="text-lg md:text-xl font-semibold text-center sm:text-left">
              {user ? 'Your Shortened URLs' : 'Please Login to View URLs'}
            </h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="text-gray-500">Loading your URLs...</div>
            </div>
          ) : (
            <>
              {/* Mobile Cards View */}
              <div className="block md:hidden">
                {urls.length === 0 && user ? (
                  <div className="p-6 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <div className="text-4xl mb-3">🔗</div>
                      <h3 className="text-base font-semibold mb-2">No URLs Yet</h3>
                      <p className="text-gray-600 text-sm">Create your first short URL above!</p>
                    </div>
                  </div>
                ) : urls.length === 0 && !user ? (
                  <div className="p-6 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <div className="text-4xl mb-3">🔒</div>
                      <h3 className="text-base font-semibold mb-2">Login Required</h3>
                      <p className="text-gray-600 text-sm">Please login to view and create shortened URLs</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 p-3">
                    {urls.map((url, index) => (
                      <div key={url._id} className="bg-gray-50 rounded-lg p-4 border">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            {url.visitHistory.length} clicks
                          </span>
                        </div>
                        
                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-2">
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
                            {url.redirectURl.length > 80 ? `${url.redirectURl.substring(0, 80)}...` : url.redirectURl}
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <button
                            onClick={() => alert(`Analytics for ${url.shortId}: ${url.visitHistory.length} clicks`)}
                            className="text-green-600 hover:text-green-800 text-xs font-medium"
                          >
                            View Analytics
                          </button>
                          <span className="text-xs text-gray-400">
                            {new Date(url.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Short URL</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original URL</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                        <td className="px-6 py-4 text-sm">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            {url.visitHistory.length} clicks
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => alert(`Analytics for ${url.shortId}: ${url.visitHistory.length} clicks`)}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            View Analytics
                          </button>
                        </td>
                      </tr>
                    ))}
                    {urls.length === 0 && user && (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <div className="text-4xl mb-3">🔗</div>
                            <h3 className="text-lg font-semibold mb-2">No URLs Yet</h3>
                            <p className="text-gray-600">Create your first short URL above!</p>
                          </div>
                        </td>
                      </tr>
                    )}
                    {!user && (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <div className="text-4xl mb-3">🔒</div>
                            <h3 className="text-lg font-semibold mb-2">Login Required</h3>
                            <p className="text-gray-600">Please login to view and create shortened URLs</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Quick Stats for Mobile */}
        {user && urls.length > 0 && (
          <div className="block md:hidden mt-4">
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <h3 className="text-sm font-semibold text-gray-600 mb-3">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-pink-600">{urls.length}</div>
                  <div className="text-xs text-gray-500">Total URLs</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-pink-600">
                    {urls.reduce((total, url) => total + url.visitHistory.length, 0)}
                  </div>
                  <div className="text-xs text-gray-500">Total Clicks</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard