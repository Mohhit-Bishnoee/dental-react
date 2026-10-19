import handler from './handler.js'

export function route(path) {
  return (req, res) => {
    req.url = path
    return handler(req, res)
  }
}
