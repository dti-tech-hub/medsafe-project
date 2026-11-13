export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
).replace(/\/$/, '')

export const API = {
  search: (query) =>
    `${API_BASE_URL}/api/medicines/search?q=${encodeURIComponent(query)}`,
  medicine: (id) => `${API_BASE_URL}/api/medicines/${id}`,
  medicines: `${API_BASE_URL}/api/medicines`,
  sourcesSummary: `${API_BASE_URL}/api/sources/summary`,
  saveList: `${API_BASE_URL}/api/lists/save`,
  savedList: `${API_BASE_URL}/api/lists/me`,
  interactions: `${API_BASE_URL}/api/interactions/check`,
  adminMedicine: `${API_BASE_URL}/api/admin/medicines`,
  adminInteractions: `${API_BASE_URL}/api/admin/interactions`,
}

export const BRAND = {
  name: 'MedSafe',
  shortName: 'MedSafe',
  description:
    'A medicine information and documented interaction reference.',
}

export const ADMIN_EMAIL = (
  import.meta.env.VITE_ADMIN_EMAIL || 'admin@medsafe.org'
).trim().toLowerCase()

export const DISCLAIMER_TEXT = 'Always consult a pharmacist or doctor.'

export const FULL_DISCLAIMER =
  'This tool reports documented information from the cited source. It does not assess dose, age, pregnancy, kidney or liver function, or other personal factors. Always consult a pharmacist or doctor.'

export const SHORT_DISCLAIMER =
  'This tool reports documented information from the cited source. Always consult a pharmacist or doctor.'

export const NO_INTERACTION_MESSAGE =
  'No documented interaction found in this source.'

export const NO_INTERACTION_NOTE =
  'This does not mean the combination is safe. Please check with a pharmacist or doctor.'

export const SOURCE_INFO = {
  name: 'FDA Drug Labels',
  lastUpdated: '2025-01-01',
  version: 'Record-level source metadata',
  versionNote:
    'The current dataset does not provide a separate source version field. Dates and source names are shown with each record.',
  severityPath: '/sources#severity-labels',
}

export const SEVERITY_DEFINITIONS = [
  {
    label: 'Major',
    description:
      'The source record assigns the label “Major”. The app displays the source label without reinterpreting severity.',
  },
  {
    label: 'Moderate',
    description:
      'The source record assigns the label “Moderate”. The app displays the source label without reinterpreting severity.',
  },
  {
    label: 'Minor',
    description:
      'The source record assigns the label “Minor”. The app displays the source label without reinterpreting severity.',
  },
  {
    label: 'Unknown',
    description:
      'The source record does not provide a recognised severity label.',
  },
]

export async function requestJson(url, options = {}) {
  const { headers, ...rest } = options
  const response = await fetch(url, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  })

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`
    try {
      const data = await response.json()
      if (data?.detail) {
        detail =
          typeof data.detail === 'string'
            ? data.detail
            : JSON.stringify(data.detail)
      }
    } catch {
      detail = response.statusText || detail
    }
    throw new Error(detail)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}
