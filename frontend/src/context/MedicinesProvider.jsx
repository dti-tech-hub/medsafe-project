import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { API, requestJson } from '../config'
import { MedicinesContext } from './MedicinesContext'

const GUEST_LIST_STORAGE_KEY = 'medinteract:guest-list'

function readGuestList() {
  try {
    const stored = window.localStorage.getItem(GUEST_LIST_STORAGE_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function mergeMedicines(current, incoming) {
  const entries = new Map(current.map((medicine) => [medicine.id, medicine]))

  for (const medicine of incoming) {
    const existing = entries.get(medicine.id)
    entries.set(medicine.id, {
      ...medicine,
      included: existing?.included !== false,
    })
  }

  return [...entries.values()]
}

export function MedicinesProvider({ children }) {
  const { user, loading: authLoading, getAccessToken } = useAuth()
  const [guestList, setGuestList] = useState(readGuestList)
  const [accountState, setAccountState] = useState({
    userId: null,
    items: [],
    error: '',
  })
  const guestListRef = useRef(guestList)
  const userId = user?.id || null

  useEffect(() => {
    guestListRef.current = guestList

    try {
      window.localStorage.setItem(
        GUEST_LIST_STORAGE_KEY,
        JSON.stringify(guestList),
      )
    } catch {
      // The in-memory list still works when storage is unavailable.
    }
  }, [guestList])

  useEffect(() => {
    if (authLoading || !userId) return undefined

    let cancelled = false
    const requestedUserId = userId

    async function loadSavedList() {
      try {
        const token = await getAccessToken()
        if (!token) {
          throw new Error('Your session has expired. Please log in again.')
        }

        const data = await requestJson(API.savedList, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!cancelled) {
          const medicines = Array.isArray(data.medicines) ? data.medicines : []
          setAccountState((current) => ({
            userId: requestedUserId,
            items: mergeMedicines(
              mergeMedicines(
                guestListRef.current,
                current.userId === requestedUserId ? current.items : [],
              ),
              medicines,
            ),
            error: '',
          }))
        }
      } catch (error) {
        if (!cancelled) {
          setAccountState((current) => ({
            userId: requestedUserId,
            items: mergeMedicines(
              guestListRef.current,
              current.userId === requestedUserId ? current.items : [],
            ),
            error: error.message || 'Unable to load your saved medicines.',
          }))
        }
      }
    }

    loadSavedList()

    return () => {
      cancelled = true
    }
  }, [authLoading, userId, getAccessToken])

  const list = userId ? accountState.items : guestList
  const loading =
    Boolean(userId) &&
    (authLoading || accountState.userId !== userId)
  const loadError =
    userId && accountState.userId === userId ? accountState.error : ''

  const addMedicine = useCallback(
    (medicine) => {
      if (!userId) {
        setGuestList((current) => {
          if (current.some((item) => item.id === medicine.id)) return current
          return [...current, { ...medicine, included: true }]
        })
        return
      }

      setAccountState((current) => {
        const items = current.userId === userId ? current.items : []
        if (items.some((item) => item.id === medicine.id)) {
          return { ...current, userId, items }
        }
        return {
          ...current,
          userId,
          items: [...items, { ...medicine, included: true }],
        }
      })
    },
    [userId],
  )

  const removeMedicine = useCallback(
    (medicineId) => {
      if (!userId) {
        setGuestList((current) =>
          current.filter((medicine) => medicine.id !== medicineId),
        )
        return
      }

      setAccountState((current) => ({
        ...current,
        items: current.items.filter(
          (medicine) => medicine.id !== medicineId,
        ),
      }))
    },
    [userId],
  )

  const updateMedicine = useCallback(
    (medicineId, updates) => {
      if (!userId) {
        setGuestList((current) =>
          current.map((medicine) =>
            medicine.id === medicineId
              ? { ...medicine, ...updates, id: medicine.id }
              : medicine,
          ),
        )
        return
      }

      setAccountState((current) => ({
        ...current,
        items: current.items.map((medicine) =>
          medicine.id === medicineId
            ? { ...medicine, ...updates, id: medicine.id }
            : medicine,
        ),
      }))
    },
    [userId],
  )

  const clearList = useCallback(() => {
    if (!userId) {
      setGuestList([])
      return
    }

    setAccountState((current) => ({
      ...current,
      items: [],
    }))
  }, [userId])

  const isInList = useCallback(
    (medicineId) => list.some((medicine) => medicine.id === medicineId),
    [list],
  )

  const saveList = useCallback(async () => {
    const token = await getAccessToken()
    if (!token) {
      throw new Error('Your session has expired. Please log in again.')
    }

    await requestJson(API.saveList, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        medicine_ids: list.map((medicine) => medicine.id),
      }),
    })
  }, [getAccessToken, list])

  const includedMedicines = useMemo(
    () => list.filter((medicine) => medicine.included !== false),
    [list],
  )

  const value = useMemo(
    () => ({
      list,
      includedMedicines,
      loading,
      loadError,
      addMedicine,
      removeMedicine,
      updateMedicine,
      clearList,
      isInList,
      saveList,
    }),
    [
      list,
      includedMedicines,
      loading,
      loadError,
      addMedicine,
      removeMedicine,
      updateMedicine,
      clearList,
      isInList,
      saveList,
    ],
  )

  return (
    <MedicinesContext.Provider value={value}>
      {children}
    </MedicinesContext.Provider>
  )
}
