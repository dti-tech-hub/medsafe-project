export function formatDate(value, fallback = 'Date not listed') {
  if (!value) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatValue(value, fallback = 'Not listed in this source') {
  return value?.trim?.() || fallback
}

export function getSourceDate(medicines = []) {
  const dates = medicines
    .map((medicine) => medicine?.source_date)
    .filter(Boolean)
    .map((value) => ({ value, label: formatDate(value) }))

  if (dates.length === 0) return 'Date not listed'
  const unique = [...new Map(dates.map((date) => [date.label, date])).values()]
  return unique.map((date) => date.label).join(' · ')
}
