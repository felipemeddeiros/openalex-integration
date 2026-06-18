# openalex-integration

> **Aviso:** Este documento foi gerado com auxílio de IA e requer revisão humana antes de ser incorporado ao projeto.

Endpoint HTTP para busca de publicações de um autor na API pública do [OpenAlex](https://openalex.org).

## Requisitos

- Node.js 22 LTS (`node --version`)
- Sem dependências externas — usa `fetch` nativo do Node

## Instalação

```bash
git clone https://github.com/felipemeddeiros/openalex-integration
cd openalex-integration
```

## Uso

Inicie o servidor:

```bash
node src/server.js
```

Faça uma requisição:

```bash
curl "http://localhost:3000/publications?author_name=Alan+Turing"
```

Com paginação:

```bash
curl "http://localhost:3000/publications?author_name=Alan+Turing&page=2"
```

### Resposta

```json
{
  "data": [
    { "title": "Computing Machinery and Intelligence", "year": 1950 }
  ],
  "meta": {
    "page": 1,
    "per_page": 25,
    "total": 130,
    "has_next": true
  }
}
```

### Códigos de resposta

| Código | Situação |
|--------|----------|
| 200 | Publicações encontradas |
| 400 | `author_name` ausente ou vazio |
| 404 | Nenhuma publicação encontrada |
| 503 | API do OpenAlex indisponível |

## Testes

Com o servidor rodando em outro terminal:

```bash
node test/test.js
```

Os testes cobrem: fluxo principal, ordenação, paginação, erros 400/404 e cenários de indisponibilidade da OpenAlex (sem servidor, via mock de `fetch`).

## Estrutura

```
src/
  publications.js   # lógica de negócio e integração com OpenAlex
  server.js         # servidor HTTP (módulo nativo http)
test/
  test.js           # testes de integração e unitários
```
