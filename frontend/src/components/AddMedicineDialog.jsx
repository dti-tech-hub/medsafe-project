import { Modal } from './Modal'
import { Button } from './Button'
import { Alert } from './Alert'
import { MedicineMeta } from './MedicineMeta'
import { useMedicines } from '../context/useMedicines'

export function AddMedicineDialog({ medicine, open, onClose, onAdded }) {
  const { addMedicine, isInList } = useMedicines()
  const alreadyAdded = medicine ? isInList(medicine.id) : false

  function handleAdd() {
    if (!medicine || alreadyAdded) return
    addMedicine(medicine)
    onAdded?.(medicine)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Confirm the exact medicine"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={alreadyAdded}
            data-autofocus
          >
            {alreadyAdded
              ? 'Already in my medicines'
              : `Add ${medicine?.name || 'medicine'}`}
          </Button>
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
          <Alert tone="info" title="Check the exact match">
            Confirm the strength, dosage form and active ingredient before
            adding this medicine to your list.
          </Alert>
        </>
      ) : null}
    </Modal>
  )
}
