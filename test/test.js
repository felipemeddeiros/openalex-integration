/**
 * AVISO: Script gerado com auxílio de IA — revisar antes de incorporar ao projeto.
 *
 * Executar com o servidor rodando: node src/server.js
 * Então em outro terminal: node test/test.js
 */

const BASE = 'http://localhost:3000'

async function request(path) {
  const res = await fetch(`${BASE}${path}`)
  const body = await res.json()
  return { status: res.status, body }
}

async function run(label, fn) {
  try {
    await fn()
    console.log(`[PASS] ${label}`)
  } catch (err) {
    console.error(`[FAIL] ${label}`)
    console.error(`       ${err.message}`)
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

await run('Autor encontrado retorna 200 com data e meta', async () => {
  const { status, body } = await request('/publications?author_name=Alan+Turing')
  assert(status === 200, `esperado 200, recebido ${status}`)
  assert(Array.isArray(body.data), 'body.data deve ser array')
  assert(typeof body.meta.total === 'number', 'meta.total deve ser number')
  assert(typeof body.meta.has_next === 'boolean', 'meta.has_next deve ser boolean')
  assert(body.meta.per_page === 25, 'per_page deve ser 25')
})

await run('Resultado vem ordenado alfabeticamente pelo título', async () => {
  const { status, body } = await request('/publications?author_name=Alan+Turing')
  assert(status === 200, `esperado 200, recebido ${status}`)
  const titles = body.data.map(p => p.title?.toLowerCase()).filter(Boolean)
  for (let i = 1; i < titles.length; i++) {
    assert(titles[i - 1] <= titles[i], `Ordem quebrada: "${titles[i - 1]}" > "${titles[i]}"`)
  }
})

await run('Autor inexistente retorna 404', async () => {
  const { status } = await request('/publications?author_name=xyzauthorthatdoesnotexist99999')
  assert(status === 404, `esperado 404, recebido ${status}`)
})

await run('author_name ausente retorna 400', async () => {
  const { status } = await request('/publications')
  assert(status === 400, `esperado 400, recebido ${status}`)
})

await run('author_name vazio retorna 400', async () => {
  const { status } = await request('/publications?author_name=')
  assert(status === 400, `esperado 400, recebido ${status}`)
})

await run('Paginação: página 2 retorna itens diferentes da página 1', async () => {
  const { status: s1, body: b1 } = await request('/publications?author_name=Alan+Turing&page=1')
  const { status: s2, body: b2 } = await request('/publications?author_name=Alan+Turing&page=2')
  assert(s1 === 200 && s2 === 200, 'ambas páginas devem retornar 200')
  assert(b1.meta.has_next === true, 'página 1 deve ter próxima página')
  assert(b1.data[0]?.title !== b2.data[0]?.title, 'página 2 deve ter itens diferentes')
})

// --- Testes unitários de erro 503 (sem servidor) ---
// Substituem globalThis.fetch para simular falhas na OpenAlex sem dependências externas.

const { findPublications, OpenAlexUnavailableError } = await import('../src/publications.js')

await run('503: ECONNREFUSED lança OpenAlexUnavailableError', async () => {
  const original = globalThis.fetch
  globalThis.fetch = async () => {
    const err = new TypeError('fetch failed')
    err.cause = { code: 'ECONNREFUSED' }
    throw err
  }
  try {
    await findPublications('Alan Turing')
    assert(false, 'deveria ter lançado OpenAlexUnavailableError')
  } catch (err) {
    assert(err instanceof OpenAlexUnavailableError, `esperado OpenAlexUnavailableError, recebido ${err.constructor.name}`)
  } finally {
    globalThis.fetch = original
  }
})

await run('503: OpenAlex retorna HTTP 500 lança OpenAlexUnavailableError', async () => {
  const original = globalThis.fetch
  globalThis.fetch = async () => ({ ok: false, status: 500 })
  try {
    await findPublications('Alan Turing')
    assert(false, 'deveria ter lançado OpenAlexUnavailableError')
  } catch (err) {
    assert(err instanceof OpenAlexUnavailableError, `esperado OpenAlexUnavailableError, recebido ${err.constructor.name}`)
  } finally {
    globalThis.fetch = original
  }
})

await run('503: timeout lança OpenAlexUnavailableError', async () => {
  const original = globalThis.fetch
  globalThis.fetch = async () => {
    const err = new Error('The operation was aborted')
    err.name = 'AbortError'
    throw err
  }
  try {
    await findPublications('Alan Turing')
    assert(false, 'deveria ter lançado OpenAlexUnavailableError')
  } catch (err) {
    assert(err instanceof OpenAlexUnavailableError, `esperado OpenAlexUnavailableError, recebido ${err.constructor.name}`)
  } finally {
    globalThis.fetch = original
  }
})
