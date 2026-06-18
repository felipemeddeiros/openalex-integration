import http from 'http'
import { URL } from 'url'
import { findPublications, OpenAlexUnavailableError } from './publications.js'

const PORT = 3000

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(body))
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)

  if (req.method !== 'GET' || url.pathname !== '/publications') {
    return send(res, 404, { error: 'Not found' })
  }

  const authorName = url.searchParams.get('author_name')?.trim()
  const page = parseInt(url.searchParams.get('page') || '1', 10)

  if (!authorName) {
    return send(res, 400, { error: 'author_name is required' })
  }

  try {
    const result = await findPublications(authorName, page)

    if (!result) {
      return send(res, 404, { error: 'No publications found for this author' })
    }

    send(res, 200, result)
  } catch (err) {
    if (err instanceof OpenAlexUnavailableError) {
      return send(res, 503, { error: err.message })
    }
    throw err
  }
})

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
