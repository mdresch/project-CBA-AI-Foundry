// Lightweight shim to run the serverless handler locally as an ES module.
import http from 'http'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let handlerModule
try {
  // Prefer the compiled JS handler for local testing
  handlerModule = await import(path.join(__dirname, '..', 'api', 'ai', 'chat.js'))
} catch (err) {
  try {
    handlerModule = await import(path.join(__dirname, '..', 'api', 'ai', 'chat.ts'))
  } catch (err2) {
    console.warn('Failed to import api/ai/chat handler module.', err2)
  }
}

const server = http.createServer(async (req, res) => {
  if (req.url === '/api/ai/chat' && req.method === 'POST') {
    let body = ''
    for await (const chunk of req) body += chunk
    const fakeReq = { method: 'POST', body }
    const fakeRes = {
      status: (code) => ({ json: (payload) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(payload)); } }),
      setHeader: () => {},
    }
    try {
      if (handlerModule && handlerModule.default) {
        await handlerModule.default(fakeReq, fakeRes)
      } else {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Handler module not available in local shim' }))
      }
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end('handler error: ' + String(err))
    }
  } else {
    res.writeHead(404)
    res.end('not found')
  }
})

const port = process.env.PORT || 3030
server.listen(port, () => console.log('Local chat shim listening on', port))
