import { API, requestJson } from '../config'

export async function searchMedicines(query, options = {}) {
  const data = await requestJson(API.search(query), options)
  return Array.isArray(data.results) ? data.results : []
}

function editDistance(first, second) {
  const a = first.toLowerCase()
  const b = second.toLowerCase()
  const rows = Array.from({ length: a.length + 1 }, (_, index) => [index])

  for (let column = 1; column <= b.length; column += 1) {
    rows[0][column] = column
  }

  for (let row = 1; row <= a.length; row += 1) {
    for (let column = 1; column <= b.length; column += 1) {
      const cost = a[row - 1] === b[column - 1] ? 0 : 1
      rows[row][column] = Math.min(
        rows[row - 1][column] + 1,
        rows[row][column - 1] + 1,
        rows[row - 1][column - 1] + cost,
      )
    }
  }

  return rows[a.length][b.length]
}

export async function findSearchSuggestion(query, options = {}) {
  const trimmed = query.trim()
  if (trimmed.length < 3) return ''

  const prefixLength = Math.max(3, Math.min(5, trimmed.length - 1))
  const prefix = trimmed.slice(0, prefixLength)
  if (prefix.toLowerCase() === trimmed.toLowerCase()) return ''

  try {
    const candidates = await searchMedicines(prefix, options)
    const limit = Math.max(2, Math.floor(trimmed.length / 3))

    return (
      candidates
        .map((medicine) => ({
          name: medicine.name,
          distance: editDistance(trimmed, medicine.name || ''),
        }))
        .filter((candidate) => candidate.distance <= limit)
        .sort((first, second) => first.distance - second.distance)[0]?.name ||
      ''
    )
  } catch (error) {
    if (error.name === 'AbortError') return ''
    throw error
  }
}
