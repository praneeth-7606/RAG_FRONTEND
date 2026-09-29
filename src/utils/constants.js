import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds for file uploads
})

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.detail || error.response.data?.message || 'An error occurred'
      throw new Error(errorMessage)
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Unable to connect to the server. Please check if the backend is running.')
    } else {
      // Something else happened
      throw new Error(error.message || 'An unexpected error occurred')
    }
  }
)

export const checkApiHealth = async () => {
  const response = await api.get('/health')
  return response.data
}

export const uploadDocument = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await api.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  
  return response.data
}

export const chatWithDocuments = async (query) => {
  const response = await api.post('/api/chat', { query })
  return response.data
}

export const getApiStatus = async () => {
  const response = await api.get('/api/status')
  return response.data
}