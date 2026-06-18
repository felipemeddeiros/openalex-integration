const OPENALEX_BASE = 'https://api.openalex.org'
const PER_PAGE = 25
const FETCH_TIMEOUT_MS = 5000

export class OpenAlexUnavailableError extends Error {
  constructor(cause) {
    super('OpenAlex service is unavailable. Please try again later.')
    this.name = 'OpenAlexUnavailableError'
    this.cause = cause
  }
}

async function fetchWithTimeout(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    return await fetch(url, { signal: controller.signal })
  } catch (err) {
    if (err.name === 'AbortError') throw new OpenAlexUnavailableError(err)
    if (err.cause?.code === 'ECONNREFUSED' || err.cause?.code === 'ENOTFOUND') {
      throw new OpenAlexUnavailableError(err)
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

async function searchAuthor(authorName) {
  const url = `${OPENALEX_BASE}/authors?search=${encodeURIComponent(authorName)}`
  const response = await fetchWithTimeout(url)

  if (response.status >= 500) throw new OpenAlexUnavailableError(new Error(`HTTP ${response.status}`))
  if (!response.ok) throw new Error(`OpenAlex authors API returned ${response.status}`)

  const data = await response.json()

  if (!data.results?.length) return null

  return data.results[0].id
}

async function fetchWorks(authorId, page) {
  const url = `${OPENALEX_BASE}/works?filter=authorships.author.id:${authorId}&per-page=${PER_PAGE}&page=${page}&sort=display_name`
  const response = await fetchWithTimeout(url)

  if (response.status >= 500) throw new OpenAlexUnavailableError(new Error(`HTTP ${response.status}`))
  if (!response.ok) throw new Error(`OpenAlex works API returned ${response.status}`)

  return response.json()
}

export async function findPublications(authorName, page = 1) {
  const authorId = await searchAuthor(authorName)

  if (!authorId) return null

  const data = await fetchWorks(authorId, page)
  const total = data.meta.count

  if (total === 0) return null

  return {
    data: data.results.map(work => ({
      title: work.title ?? work.display_name,
      year: work.publication_year ?? null
    })),
    meta: {
      page,
      per_page: PER_PAGE,
      total,
      has_next: page * PER_PAGE < total
    }
  }
}
