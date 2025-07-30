

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



// Upload document to backend
export const uploadDocument = async (file) => {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/upload`, {
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
export const sendChatMessage = async (query) => { // 'query' is the input variable name
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // --- FIX IS HERE ---
      // The key in the JSON body must be "question" to match the Pydantic model in FastAPI
      body: JSON.stringify({ question: query }), 
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