import fs from 'fs'
import path from 'path'
import express, { Request, Response } from 'express'
import fileUpload from 'express-fileupload'
import { app } from 'electron/main'

type QuestionFn = (query: any, request: any) => Promise<any>
type CacheMiddleware = (strDuration: number|string, middlewareToggle: (request: Request, response: Response) => void) => any

const request = require('NeteaseCloudMusicApi/util/request')
const cache: CacheMiddleware = require('NeteaseCloudMusicApi/util/apicache').middleware
const { cookieToJson } = require('NeteaseCloudMusicApi/util/index')
const MODULE_PATH = path.join(app.getAppPath(), '../node_modules')

export default function startNeteaseMusicApi(port: number, host: string) {
  const app = express()
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

  app.use(fileUpload())

  // static
  app.use(express.static(path.join(__dirname, 'public')))

  // cache
  app.use(cache('2 minutes', (_, res) => res.statusCode === 200))
  // router
  const special: Record<string, string> = {
    'daily_signin.js': '/daily_signin',
    'fm_trash.js': '/fm_trash',
    'personal_fm.js': '/personal_fm'
  }
  const API_MODULE_PATH = path.join(MODULE_PATH, 'NeteaseCloudMusicApi/module')

  fs.readdirSync(API_MODULE_PATH)
    .reverse()
    .forEach((file) => {
      if (!file.endsWith('.js')) return
      const route =
        file in special
          ? special[file]
          : '/' + file.replace(/\.js$/i, '').replace(/_/g, '/')
      const question: QuestionFn = require(path.join(API_MODULE_PATH, file))

      app.use(route, (req, res) => {
        ;[req.query, req.body].forEach((item) => {
          if (typeof item.cookie === 'string') {
            item.cookie = cookieToJson(decodeURIComponent(item.cookie))
          }
        })
        const query = Object.assign(
          {},
          { cookie: req.cookies },
          req.query,
          req.body,
          req.files
        )

        question(query, request)
          .then((answer) => {
            console.log('[OK]', decodeURIComponent(req.originalUrl))

            const cookies = answer.cookie
            if (Array.isArray(cookies) && cookies.length > 0) {
              if (req.protocol === 'https') {
                // Try to fix CORS SameSite Problem
                res.append(
                  'Set-Cookie',
                  cookies.map((cookie) => {
                    return cookie + '; SameSite=None; Secure'
                  })
                )
              } else {
                res.append('Set-Cookie', cookies)
              }
            }
            res.status(answer.status).send(answer.body)
          })
          .catch((answer) => {
            console.log('[ERR]', decodeURIComponent(req.originalUrl), {
              status: answer.status,
              body: answer.body
            })
            if (+answer.body.code === 301) answer.body.msg = '需要登录'
            res.append('Set-Cookie', answer.cookie)
            res.status(answer.status).send(answer.body)
          })
      })
    })

  const server = app.listen(port, host, () => {
    console.log(`server running @ http://${host || 'localhost'}:${port}`)
  })

  return [app, server]
}
