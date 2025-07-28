// import axios from 'axios'

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: 60000,
// })

// export const checkApiHealth = async () => {
//   const response = await api.get('/health')
//   return response.data
// }

// export const uploadDocument = async (file) => {
//   const formData = new FormData()
//   formData.append('file', file)
  
//   const response = await api.post('/api/upload', formData, {
//     headers: {
//       'Content-Type': 'multipart/form-data',
//     },
//   })
  
//   return response.data
// }

// export const chatWithDocuments = async (query) => {
//   const response = await api.post('/api/chat', { query })
//   return response.data
// }


// lib/api.js - Updated API utility functions

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Check if the backend API is healthy
export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`API health check failed: ${response.status}`)
    }

    const data = await response.json()
    return data

  } catch (error) {
    console.error('API Health Check Error:', error)
    throw error
  }
}

// NEW: Get all previously uploaded documents
export const getAllDocuments = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/documents`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch documents: ${response.status}`)
    }

    const data = await response.json()
    return data

  } catch (error) {
    console.error('Get Documents Error:', error)
    throw error
  }
}

// Upload document to backend
export const uploadDocument = async (file) => {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.detail || data.message || `Upload failed: ${response.status}`)
    }

    return data

  } catch (error) {
    console.error('Document Upload Error:', error)
    throw error
  }
}

// Send chat message to backend
export const sendChatMessage = async (query) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.detail || data.message || `Chat request failed: ${response.status}`)
    }

    return data

  } catch (error) {
    console.error('Chat Message Error:', error)
    throw error
  }
}

// Alias for chatWithDocuments (for compatibility with existing ChatInterface)
export const chatWithDocuments = sendChatMessage

// Get API status
export const getApiStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(`Status request failed: ${response.status}`)
    }

    return data

  } catch (error) {
    console.error('API Status Error:', error)
    throw error
  }
}