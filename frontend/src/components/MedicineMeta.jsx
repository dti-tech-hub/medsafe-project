import { formatValue } from '../lib/format'

export function MedicineMeta({ medicine, compact = false }) {
  return (
    <dl
      className={`medicine-meta${compact ? ' medicine-meta--compact' : ''}`}
    >
      <div>
        <dt>Strength</dt>
        <dd>{formatValue(medicine?.strength, 'Not listed')}</dd>
      </div>
      <div>
        <dt>Dosage form</dt>
        <dd>{formatValue(medicine?.dosage_form, 'Not listed')}</dd>
      </div>
      <div>
        <dt>Active ingredient</dt>
        <dd>{formatValue(medicine?.active_ingredient)}</dd>
      </div>
    </dl>
  )
}
