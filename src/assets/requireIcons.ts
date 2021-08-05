const req = require.context('./icons', true, /\.svg$/)
req.keys().forEach(req)
