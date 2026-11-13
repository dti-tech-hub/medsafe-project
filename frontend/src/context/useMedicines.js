import { useContext } from 'react'
import { MedicinesContext } from './MedicinesContext'

export function useMedicines() {
  const context = useContext(MedicinesContext)
  if (!context) {
    throw new Error('useMedicines must be used within a MedicinesProvider')
  }
  return context
}
