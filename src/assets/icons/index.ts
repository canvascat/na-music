const req = require.context('./', true, /\.svg$/)
req.keys().forEach(req)
// const requireAll = requireContext => requireContext.keys().map(requireContext)
// requireAll(req)
