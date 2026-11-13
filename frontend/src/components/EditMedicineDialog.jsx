import { useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { Alert } from './Alert'
import { Textarea } from './Input'
import { MedicineMeta } from './MedicineMeta'
import { useMedicines } from '../context/useMedicines'

export function EditMedicineDialog({ medicine, open, onClose }) {
  const { updateMedicine } = useMedicines()
  const [included, setIncluded] = useState(medicine?.included !== false)
  const [userNotes, setUserNotes] = useState(medicine?.user_notes || '')

  function handleSave() {
    if (!medicine) return
    updateMedicine(medicine.id, { included, user_notes: userNotes.trim() })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit list entry"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save changes</Button>
        </>
      }
    >
      {medicine ? (
        <>
          <div className="dialog-medicine-heading">
            <h3>{medicine.name}</h3>
            <p>{medicine.active_ingredient || 'Active ingredient not listed'}</p>
          </div>
          <MedicineMeta medicine={medicine} />

          {medicine.allergy_notes ? (
            <Alert tone="warning" title="Documented allergy caution in source">
              {medicine.allergy_notes}
            </Alert>
          ) : null}

          <div style={{ margin: 'var(--space-4) 0' }}>
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={included}
                onChange={(event) => setIncluded(event.target.checked)}
              />
              <span>
                <strong>Include this medicine in interaction checks</strong>
                <span>
                  Excluded medicines stay in your list but are not compared.
                </span>
              </span>
            </label>
          </div>

          <Textarea
            label="Personal allergy or dosage notes (optional)"
            name="user_notes"
            rows={2}
            value={userNotes}
            onChange={(e) => setUserNotes(e.target.value)}
            placeholder="e.g. Mild rash with penicillin; take with breakfast"
            hint="Personal notes serve as a prompt for professional review with a doctor or pharmacist; not a safety guarantee."
          />
        </>
      ) : null}
    </Modal>
  )
}
