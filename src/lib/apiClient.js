import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 10000,
  withCredentials: true,
})

// Attach auth token or other headers in one place later on.
apiClient.interceptors.request.use((config) => config)

export default apiClient
