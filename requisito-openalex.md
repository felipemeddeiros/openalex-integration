# Requisito: Integração com OpenAlex para Busca de Publicações por Autor

> **Aviso:** Este documento foi gerado com auxílio de IA e requer revisão humana antes de ser incorporado ao projeto.

---

## 1. Visão Geral

Implementar um endpoint HTTP no backend que receba o nome de um autor, consulte a API pública do OpenAlex e retorne uma lista paginada das publicações associadas, ordenada alfabeticamente pelo título.

---

## 2. Contrato da API

### Request

```
GET /publications?author_name={string}&page={int}
```

| Parâmetro     | Tipo   | Obrigatório | Padrão | Descrição                        |
|---------------|--------|-------------|--------|----------------------------------|
| `author_name` | string | Sim         | —      | Nome do autor a ser pesquisado   |
| `page`        | int    | Não         | 1      | Número da página                 |

### Response — 200 OK

```json
{
  "data": [
    { "title": "string", "year": 2023 }
  ],
  "meta": {
    "page": 1,
    "per_page": 25,
    "total": 130,
    "has_next": true
  }
}
```

> O campo `year` pode ser `null` quando ausente na fonte.

### Respostas de Erro

| Código | Situação                                      |
|--------|-----------------------------------------------|
| 404    | Nenhuma publicação encontrada para o autor    |
| 503    | API do OpenAlex indisponível                  |
| 500    | Erro inesperado (exceção lançada)             |

---

## 3. Regras de Negócio

- Resultados ordenados alfabeticamente pelo título da publicação
- Paginação fixa de 25 itens por página
- Quando o nome informado corresponder a múltiplos autores na OpenAlex, utilizar o primeiro resultado retornado pela API
- Erros inesperados (timeout, resposta malformada, parâmetro inválido) devem lançar exceção

---

## 4. Restrições Técnicas

| Item                    | Decisão                                              |
|-------------------------|------------------------------------------------------|
| Runtime                 | Node.js 22 LTS                                       |
| Dependências externas   | Nenhuma — uso do `fetch` nativo do Node              |
| Framework web           | Proibido — execução via terminal ou scripts de teste |
| URL base da OpenAlex    | Hardcoded (`https://api.openalex.org`)               |
| Testes gerados por IA   | Proibido sem revisão humana prévia                   |
| Documentação gerada por IA | Proibido sem revisão humana prévia              |

---

## 5. Fora do Escopo

- Autenticação e autorização do endpoint
- Cache de resultados
- Desambiguação avançada de autores homônimos

---

## 6. Checklist de Implementação

### 6.1 Configuração do Projeto

- [x] Criar projeto Node.js com `package.json`
- [ ] Confirmar versão do Node (`node --version` >= 22) — ⚠️ ambiente atual tem Node 20.5.1; código funciona mas requer atualização para Node 22 em produção
- [x] Definir estrutura de diretórios (`src/`, `test/`)
- [x] Validar que nenhuma dependência externa foi adicionada

### 6.2 Integração com OpenAlex

- [x] Implementar função de busca de autor pelo nome na OpenAlex (`searchAuthor` em `src/publications.js`)
- [x] Implementar extração do primeiro autor quando houver ambiguidade
- [x] Implementar busca das publicações do autor retornado (`fetchWorks` em `src/publications.js`)
- [x] Mapear resposta da OpenAlex para o contrato definido (`title`, `year`)
- [x] Tratar `year` ausente como `null`

### 6.3 Paginação e Ordenação

- [x] Implementar ordenação alfabética por título (via parâmetro `sort=display_name` na OpenAlex)
- [x] Implementar paginação com 25 itens por página
- [x] Calcular e retornar metadados: `page`, `per_page`, `total`, `has_next`

### 6.4 Tratamento de Erros

- [x] Retornar 404 quando nenhuma publicação for encontrada (autor não encontrado ou sem obras)
- [x] Retornar 503 com mensagem descritiva quando a OpenAlex estiver indisponível (`OpenAlexUnavailableError`)
- [x] Lançar exceção para erros inesperados (timeout via `AbortController`, resposta malformada)
- [x] Validar que `author_name` não está vazio (retorna 400)

### 6.5 Testes

- [x] Escrever script de teste para o fluxo principal (autor encontrado) — `test/test.js`
- [x] Escrever script de teste para autor não encontrado (404)
- [x] Escrever script de teste para nome ambíguo (coberto pelo fluxo principal)
- [x] Escrever script de teste para simular OpenAlex indisponível (503) — coberto com 3 cenários via mock de `globalThis.fetch` (ECONNREFUSED, HTTP 500, timeout)
- [ ] **Revisar manualmente todos os testes antes de incorporar ao projeto**

### 6.6 Validação Final

- [x] Tempo de resposta abaixo de 3 segundos em condições normais (validado manualmente)
- [x] Execução funciona via terminal sem dependências externas
- [ ] **Revisar manualmente toda documentação antes de incorporar ao projeto**
- [ ] Código revisado por humano antes do merge
