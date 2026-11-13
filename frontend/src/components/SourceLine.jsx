import { FileText } from 'lucide-react'
import { getSourceDate } from '../lib/format'

export function SourceLine({ source, medicines = [] }) {
  const sources = source
    ? source
    : [
        ...new Set(
          medicines
            .map((medicine) => medicine?.source_name)
            .filter(Boolean),
        ),
      ].join(' · ')

  return (
    <p className="source-line">
      <FileText size={15} aria-hidden="true" />
      <span>
        Source: {sources || 'Source not listed'} · Source date:{' '}
        {getSourceDate(medicines)}
      </span>
    </p>
  )
}
