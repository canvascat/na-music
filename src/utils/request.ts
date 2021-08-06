import axios from 'axios'
// import Cookies from 'js-cookie'

const service = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 15000
})

service.interceptors.request.use((config) => {
  if (!config.params) config.params = {}
  // if (baseURL[0] !== '/' && !process.env.IS_ELECTRON) {
  //   config.params.cookie = `MUSIC_U=${Cookies.get('MUSIC_U')};`;
  // }

  return config
})

service.interceptors.response.use(
  response => response.data,
  error => Promise.reject(error)
)

export default service
