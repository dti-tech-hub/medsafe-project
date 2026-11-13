import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  FileQuestion,
  Plus,
  TriangleAlert,
} from 'lucide-react'
import { AddMedicineDialog } from '../components/AddMedicineDialog'
import { Alert } from '../components/Alert'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { MedicineMeta } from '../components/MedicineMeta'
import { Spinner } from '../components/Spinner'
import { useMedicines } from '../context/useMedicines'
import { API, FULL_DISCLAIMER, requestJson } from '../config'
import { formatValue } from '../lib/format'
import { recallMedicine, rememberMedicine } from '../lib/medicineCache'

function DetailSection({ id, title, text, tone, medicine }) {
  return (
    <section
      className={`detail-section${tone === 'warning' ? ' detail-section--warning' : ''}`}
      id={id}
      aria-labelledby={`${id}-title`}
    >
      <div className="detail-section-heading">
        <h2 id={`${id}-title`}>{title}</h2>
        {tone === 'warning' ? (
          <TriangleAlert size={19} aria-hidden="true" />
        ) : null}
      </div>
      <p>{formatValue(text, 'Not listed in this source.')}</p>
    </section>
  )
}

export default function MedicineDetailPage() {
  const { medicineId } = useParams()
  const location = useLocation()
  const { isInList } = useMedicines()
  const [addOpen, setAddOpen] = useState(false)

  const cached = useMemo(
    () => location.state?.medicine || recallMedicine(medicineId),
    [location.state, medicineId],
  )

  const [medicine, setMedicine] = useState(cached || null)
  const [loading, setLoading] = useState(!cached)
  const [fetchError, setFetchError] = useState('')

  useEffect(() => {
    if (cached) {
      setMedicine(cached)
      setLoading(false)
      return
    }

    let active = true
    async function fetchMedicine() {
      setLoading(true)
      setFetchError('')
      try {
        const data = await requestJson(API.medicine(medicineId))
        if (!active) return
        if (data?.medicine) {
          setMedicine(data.medicine)
          rememberMedicine(data.medicine)
        } else {
          setFetchError('Medicine record not found.')
        }
      } catch (err) {
        if (!active) return
        setFetchError(err.message || 'Unable to load medicine details.')
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchMedicine()
    return () => {
      active = false
    }
  }, [cached, medicineId])

  if (loading) {
    return (
      <div className="page-status" role="status">
        <Spinner label="Loading medicine record" />
        Loading medicine details…
      </div>
    )
  }

  if (!medicine) {
    return (
      <div className="page-stack">
        <EmptyState
          icon={FileQuestion}
          title="Medicine details unavailable"
          titleAs="h1"
          action={
            <Button as={Link} to="/search">
              Search medicines
            </Button>
          }
        >
          <p>
            {fetchError ||
              'This link does not include a medicine record. Search again to open a current record from the reference.'}
          </p>
        </EmptyState>
      </div>
    )
  }

  const inList = isInList(medicine.id)

  return (
    <div className="page-stack">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/search">Search</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{medicine.name}</span>
      </nav>

      <div className="detail-header">
        <div className="detail-header-main">
          <h1>{medicine.name}</h1>
          <p className="detail-subtitle">
            {formatValue(medicine.active_ingredient)}
          </p>
          <MedicineMeta medicine={medicine} />
        </div>
        <div className="detail-header-actions">
          {inList ? (
            <Badge tone="success" icon={<Check size={14} />}>
              In my medicines
            </Badge>
          ) : null}
          <Button
            onClick={() => setAddOpen(true)}
            disabled={inList}
            variant={inList ? 'secondary' : 'primary'}
          >
            {inList ? (
              <>
                <Check size={16} aria-hidden="true" />
                Added to list
              </>
            ) : (
              <>
                <Plus size={16} aria-hidden="true" />
                Add to my list
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="detail-layout">
        <nav className="detail-nav" aria-label="Medicine sections">
          <span className="detail-nav-label">On this page</span>
          <a href="#uses">Uses</a>
          <a href="#warnings">Warnings</a>
          <a href="#side-effects">Side effects</a>
          {medicine.allergy_notes ? (
            <a href="#allergy-notes">Allergy notes</a>
          ) : null}
        </nav>

        <div className="detail-content">
          <DetailSection
            id="uses"
            title="Uses"
            text={medicine.uses}
            medicine={medicine}
          />
          <DetailSection
            id="warnings"
            title="Warnings"
            text={medicine.warnings}
            tone="warning"
            medicine={medicine}
          />
          <DetailSection
            id="side-effects"
            title="Side effects"
            text={medicine.side_effects}
            medicine={medicine}
          />
          {medicine.allergy_notes ? (
            <DetailSection
              id="allergy-notes"
              title="Allergy notes"
              text={medicine.allergy_notes}
              medicine={medicine}
            />
          ) : null}
        </div>
      </div>

      <Alert tone="warning" title="Important">
        {FULL_DISCLAIMER}
      </Alert>

      <Button as={Link} to="/search" variant="secondary">
        <ArrowLeft size={16} aria-hidden="true" />
        Back to search
      </Button>

      <AddMedicineDialog
        medicine={medicine}
        open={addOpen}
        onClose={() => setAddOpen(false)}
      />
    </div>
  )
}
