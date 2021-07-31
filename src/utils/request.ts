import axios from 'axios'
// import Cookies from 'js-cookie'

const service = axios.create({
  // baseURL,
  withCredentials: true,
  timeout: 15000,
});

service.interceptors.request.use((config) => {
  if (!config.params) config.params = {};
  // if (baseURL[0] !== '/' && !process.env.IS_ELECTRON) {
  //   config.params.cookie = `MUSIC_U=${Cookies.get('MUSIC_U')};`;
  // }

  const proxy = JSON.parse(localStorage.getItem('settings')!).proxyConfig;
  if (['HTTP', 'HTTPS'].includes(proxy.protocol)) {
    config.params.proxy = `${proxy.protocol}://${proxy.server}:${proxy.port}`;
  }

  return config;
});

service.interceptors.response.use(
  response => response.data,
  error => Promise.reject(error)
);

export default service;
