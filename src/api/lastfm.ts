// Last.fm API documents 👉 https://www.last.fm/api

import axios from 'axios'
import md5 from 'crypto-js/md5'
// VUE_APP_LASTFM_API_KEY=09c55292403d961aa517ff7f5e8a3d9c
// VUE_APP_LASTFM_API_SHARED_SECRET=307c9fda32b3904e53654baff215cb67
const apiKey = '09c55292403d961aa517ff7f5e8a3d9c'
const apiSharedSecret = '307c9fda32b3904e53654baff215cb67'
const baseUrl = window.location.origin
const url = 'https://ws.audioscrobbler.com/2.0/'

const sign = params => {
  const sortParamsKeys = Object.keys(params).sort()
  const sortedParams = sortParamsKeys.reduce((acc, key) => {
    acc[key] = params[key]
    return acc
  }, {})
  let signature = ''
  for (const [key, value] of Object.entries(sortedParams)) {
    signature += `${key}${value}`
  }
  return md5(signature + apiSharedSecret).toString()
}

export function auth() {
  window.open(
    `https://www.last.fm/api/auth/?api_key=${apiKey}&cb=${baseUrl}/#/lastfm/callback`
  )
}

export function authGetSession(token) {
  const signature = md5(
    `api_key${apiKey}methodauth.getSessiontoken${token}${apiSharedSecret}`
  ).toString()
  return axios({
    url,
    method: 'GET',
    params: {
      method: 'auth.getSession',
      format: 'json',
      api_key: apiKey,
      api_sig: signature,
      token
    }
  })
}

export function trackUpdateNowPlaying(params) {
  params.api_key = apiKey
  params.method = 'track.updateNowPlaying'
  params.sk = JSON.parse(localStorage.getItem('lastfm')).key
  const signature = sign(params)

  return axios({
    url,
    method: 'POST',
    params: {
      ...params,
      api_sig: signature,
      format: 'json'
    }
  })
}

export function trackScrobble(params) {
  params.api_key = apiKey
  params.method = 'track.scrobble'
  params.sk = JSON.parse(localStorage.getItem('lastfm')).key
  const signature = sign(params)

  return axios({
    url,
    method: 'POST',
    params: {
      ...params,
      api_sig: signature,
      format: 'json'
    }
  })
}
