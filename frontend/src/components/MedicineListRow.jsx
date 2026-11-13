import { CheckCircle2, FileEdit, MinusCircle, Pencil, Trash2 } from 'lucide-react'
import { Badge } from './Badge'
import { Button } from './Button'
import { MedicineMeta } from './MedicineMeta'

export function MedicineListRow({
  medicine,
  onEdit,
  onRemove,
  compact = false,
}) {
  const included = medicine.included !== false

  return (
    <li className={`medicine-row${compact ? ' medicine-row--compact' : ''}`}>
      <div className="medicine-row-main">
        <div className="medicine-row-title">
          <h3>{medicine.name}</h3>
          <Badge
            tone={included ? 'success' : 'neutral'}
            icon={
              included ? <CheckCircle2 size={14} /> : <MinusCircle size={14} />
            }
          >
            {included ? 'Included in checks' : 'Not included in checks'}
          </Badge>
        </div>
        <MedicineMeta medicine={medicine} compact={compact} />
        {medicine.user_notes ? (
          <p className="medicine-note-snippet" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent)', margin: 'var(--space-1) 0' }}>
            <strong>Note / Allergy:</strong> {medicine.user_notes}
          </p>
        ) : null}
      </div>
      <div className="medicine-row-actions">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(medicine)}
          aria-label={`Edit ${medicine.name}`}
        >
          <Pencil size={15} aria-hidden="true" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="button--danger-text"
          onClick={() => onRemove(medicine.id)}
          aria-label={`Remove ${medicine.name}`}
        >
          <Trash2 size={15} aria-hidden="true" />
          Remove
        </Button>
      </div>
    </li>
  )
}
