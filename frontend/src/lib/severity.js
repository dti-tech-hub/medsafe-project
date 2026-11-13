export const SEVERITY_ORDER = ['Major', 'Moderate', 'Minor', 'Unknown']

export function normalizeSeverity(severity) {
  const value = String(severity || '').toLowerCase()
  if (value === 'major') return 'Major'
  if (value === 'moderate') return 'Moderate'
  if (value === 'minor') return 'Minor'
  return 'Unknown'
}

export function severityTone(severity) {
  return normalizeSeverity(severity).toLowerCase()
}

export function groupInteractions(results = []) {
  const groups = new Map()

  for (const result of results) {
    const key = result.found ? normalizeSeverity(result.severity) : 'Not found'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(result)
  }

  return [...groups.entries()].sort(([first], [second]) => {
    if (first === 'Not found') return 1
    if (second === 'Not found') return -1
    return SEVERITY_ORDER.indexOf(first) - SEVERITY_ORDER.indexOf(second)
  })
}
