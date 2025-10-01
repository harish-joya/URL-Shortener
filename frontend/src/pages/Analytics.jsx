import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Analytics = () => {
  const { shortId } = useParams();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getBaseUrl = () => {
    return import.meta.env.VITE_API_URL || '';
  };

  useEffect(() => {
    if (user && shortId) {
      fetchAnalytics();
    }
  }, [user, shortId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${getBaseUrl()}/api/url/analytics/detailed/${shortId}`,
        { withCredentials: true }
      );
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const getShortUrl = () => {
    const baseUrl = getBaseUrl() || window.location.origin;
    return `${baseUrl}/api/url/${shortId}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#ff758c] to-[#ff7eb3] flex items-center justify-center">
        <div className="text-white text-xl">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#ff758c] to-[#ff7eb3] flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link to="/dashboard" className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#ff758c] to-[#ff7eb3] flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">No Data</h2>
          <p className="text-gray-600 mb-4">No analytics data found for this URL.</p>
          <Link to="/dashboard" className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ff758c] to-[#ff7eb3] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">URL Analytics</h1>
            <p className="text-white opacity-90">Detailed insights for your shortened URL</p>
          </div>
          <Link
            to="/dashboard"
            className="bg-white text-pink-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* URL Info Card */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">URL Information</h2>
              <p className="text-gray-600 mb-1">
                <strong>Short URL:</strong> 
                <span className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded">
                  {getShortUrl()}
                </span>
                <button
                  onClick={() => copyToClipboard(getShortUrl())}
                  className="ml-2 text-pink-600 hover:text-pink-800"
                >
                  📋
                </button>
              </p>
              <p className="text-gray-600">
                <strong>Original URL:</strong> 
                <span className="ml-2 truncate">{analytics.originalUrl}</span>
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-pink-600">{analytics.totalClicks}</div>
              <div className="text-gray-600">Total Clicks</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-2xl font-bold text-pink-600">{analytics.totalClicks}</div>
            <div className="text-gray-600">Total Clicks</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-2xl font-bold text-green-600">
              {analytics.clickData.last7Days ? Object.values(analytics.clickData.last7Days).reduce((a, b) => a + b, 0) : 0}
            </div>
            <div className="text-gray-600">Last 7 Days</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-2xl font-bold text-blue-600">
              {analytics.clickData.last30Days ? Object.values(analytics.clickData.last30Days).reduce((a, b) => a + b, 0) : 0}
            </div>
            <div className="text-gray-600">Last 30 Days</div>
          </div>
        </div>

        {/* Recent Clicks */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Recent Clicks</h2>
          </div>
          <div className="p-6">
            {analytics.recentClicks && analytics.recentClicks.length > 0 ? (
              <div className="space-y-3">
                {analytics.recentClicks.map((click, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b">
                    <div className="text-gray-700">
                      <span className="font-medium">Click #{analytics.totalClicks - index}</span>
                    </div>
                    <div className="text-gray-500 text-sm">
                      {click.time}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No clicks yet</p>
            )}
          </div>
        </div>

        {/* Last 7 Days Clicks */}
        {analytics.clickData.last7Days && (
          <div className="bg-white rounded-xl shadow-lg">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">Last 7 Days</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {Object.entries(analytics.clickData.last7Days).map(([date, count]) => (
                  <div key={date} className="flex justify-between items-center">
                    <span className="text-gray-700">{date}</span>
                    <span className="font-semibold text-pink-600">{count} clicks</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;