const PREFIX = 'medinteract:medicine:'

export function rememberMedicine(medicine) {
  if (!medicine?.id) return
  try {
    window.sessionStorage.setItem(
      `${PREFIX}${medicine.id}`,
      JSON.stringify(medicine),
    )
  } catch {
    // Session storage may be unavailable; the route state still works.
  }
}

export function recallMedicine(medicineId) {
  try {
    const value = window.sessionStorage.getItem(`${PREFIX}${medicineId}`)
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}
