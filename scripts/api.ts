import * as API from 'NeteaseCloudMusicApi'
import express, { Express } from 'express'
import { join } from 'path'

export function registerAllRouter (app: Express) {
  app.set('trust proxy', true)
  // CORS & Preflight request
  app.use((req, res, next) => {
    if (req.path !== '/' && !req.path.includes('.')) {
      res.set({
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Origin': req.headers.origin || '*',
        'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
        'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
        'Content-Type': 'application/json; charset=utf-8'
      })
    }
    req.method === 'OPTIONS' ? res.status(204).end() : next()
  })
  // cookie parser
  app.use((req, res, next) => {
    req.cookies = {}
    ;(req.headers.cookie || '').split(/\s*;\s*/).forEach((pair) => {
      const crack = pair.indexOf('=')
      if (crack < 1 || crack === pair.length - 1) return
      req.cookies[decodeURIComponent(pair.slice(0, crack)).trim()] =
        decodeURIComponent(pair.slice(crack + 1)).trim()
    })
    next()
  })
  // body parser
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  app.use(require('express-fileupload')())
  app.use(express.static(join(__dirname, 'public')))
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const cache = require('NeteaseCloudMusicApi/util/apicache').middleware
  // cache
  app.use(cache('2 minutes', (req: any, res: any) => res.statusCode === 200))
  // router
  const SPECIAL_KEY = ['daily_signin', 'fm_trash', 'personal_fm']
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { cookieToJson } = require('NeteaseCloudMusicApi/util/index')

  Object.entries(API).forEach(([key, fn]) => {
    if (typeof fn !== 'function') return
    const route = SPECIAL_KEY.includes(key) ? key : key.replace(/_/g, '/')
    app.use(`/${route}`, async (req, res) => {
      [req.query, req.body].forEach((item) => {
        if (typeof item.cookie !== 'string') return
        item.cookie = cookieToJson(decodeURIComponent(item.cookie))
      })
      const original = decodeURIComponent(req.originalUrl)
      const response = await (fn as any)({
        cookie: req.cookies,
        ...req.query,
        ...req.body,
        // @ts-ignore
        ...req.files
      }).then((response: API.Response) => {
        console.log('[OK]', original)
        return response
      }, (response: API.Response) => {
        const { status, body } = response
        console.log('[ERR]', original, { status, body })
        if (+body.code === 301) body.msg = '需要登录'
        return response
      })
      const { cookie, status, body } = response
      if (Array.isArray(cookie) && cookie.length > 0) {
        if (req.protocol === 'https') {
          // Try to fix CORS SameSite Problem
          res.append('Set-Cookie', cookie.map(c => `${c}; SameSite=None; Secure`))
        } else {
          res.append('Set-Cookie', cookie)
        }
      }
      res.status(status).send(body)
    })
  })
}
