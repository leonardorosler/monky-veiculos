import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'x-tenant-id': import.meta.env.VITE_TENANT_ID,
  }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    const requestToken = error.config?.headers?.Authorization
    const currentToken = localStorage.getItem('token')
    if (error.response?.status === 401 && currentToken && requestToken === `Bearer ${currentToken}`) {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      window.dispatchEvent(new Event('monky:auth-changed'))
    }
    return Promise.reject(error)
  }
)

export default api
