import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'  // Add Link import
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const [urls, setUrls] = useState([])  // Initialize as empty array, not undefined
  const [originalUrl, setOriginalUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [urlsLoading, setUrlsLoading] = useState(true)  // Separate loading state for URLs
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
      setUrlsLoading(true)
      const response = await axios.get(`${getBaseUrl()}/api/urls`, {
        withCredentials: true
      })
      // Make sure we always set an array, even if response.data.urls is undefined
      setUrls(response.data.urls || [])
    } catch (error) {
      console.log('Not authenticated or no URLs found')
      setUrls([])  // Always set to empty array on error
    } finally {
      setUrlsLoading(false)
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
      
      // Make sure we always set an array
      setUrls(response.data.urls || [])
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
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">URL Shortener</h1>
          <div className="flex items-center gap-4">
            <span className="text-white">
              {user ? `Welcome, ${user.name}` : 'Please Login'}
            </span>
            <button
              onClick={handleLogout}
              className="bg-white text-pink-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100"
            >
              {user ? 'Logout' : 'Login'}
            </button>
          </div>
        </div>

        {/* URL Shortening Form */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <form onSubmit={handleShortenUrl} className="flex gap-4">
            <input
              type="url"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              placeholder="Enter your long URL here..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              required
            />
            <button
              type="submit"
              disabled={loading || !user}
              className="bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 disabled:opacity-50"
            >
              {loading ? 'Shortening...' : 'Shorten URL'}
            </button>
          </form>
          {!user && (
            <p className="text-sm text-red-600 mt-2">
              🔐 Please login to shorten URLs
            </p>
          )}
        </div>

        {/* Your URLs Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">
              {user ? 'Your Shortened URLs' : 'Please Login to View URLs'}
            </h2>
          </div>
          
          {urlsLoading ? (
            <div className="p-8 text-center">
              <div className="text-gray-500">Loading your URLs...</div>
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
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {/* FIX: Always use urls (which is now guaranteed to be an array) */}
                  {urls && urls.length > 0 ? (
                    urls.map((url, index) => (
                      <tr key={url._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">{index + 1}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <a
                              href={getShortUrl(url.shortId)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline font-medium"
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
                          {/* Safe access to visitHistory */}
                          {url.visitHistory ? url.visitHistory.length : 0}
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            to={`/analytics/${url.shortId}`}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                          >
                            View Analytics
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        {user ? 'No URLs shortened yet. Create your first short URL above!' : 'Please login to view and create shortened URLs'}
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

export default Dashboard