import express from 'express'
import { registerAllRouter } from './api'

const app = express()

registerAllRouter(app)

app.listen(9090, () => {
  console.log('api server run @http://localhost:9090')
})
