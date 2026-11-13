import { CircleAlert, CircleHelp, Info, TriangleAlert } from 'lucide-react'
import { Badge } from './Badge'
import { normalizeSeverity } from '../lib/severity'

const SEVERITY_ICONS = {
  Major: <CircleAlert size={15} />,
  Moderate: <TriangleAlert size={15} />,
  Minor: <Info size={15} />,
  Unknown: <CircleHelp size={15} />,
}

export function SeverityBadge({ severity }) {
  const label = normalizeSeverity(severity)
  return (
    <Badge tone={label.toLowerCase()} icon={SEVERITY_ICONS[label]}>
      {label}
    </Badge>
  )
}
