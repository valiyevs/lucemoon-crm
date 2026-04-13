import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
})

// Request interceptor - add auth token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['x-auth-token'] = token
  }
  return config
})

// Response interceptor - handle errors globally
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response

      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }

      // Return structured error
      return Promise.reject({
        status,
        message: data.error || 'An error occurred',
        details: data.details || null
      })
    }

    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        status: 0,
        message: 'Request timeout - please try again'
      })
    }

    // Network error
    return Promise.reject({
      status: 0,
      message: 'Network error - please check your connection'
    })
  }
)

export default api