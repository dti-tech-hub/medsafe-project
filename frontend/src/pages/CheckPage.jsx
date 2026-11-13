import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ClipboardCheck,
  ListChecks,
  RefreshCw,
  SearchX,
} from 'lucide-react'
import { Alert } from '../components/Alert'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { EditMedicineDialog } from '../components/EditMedicineDialog'
import { EmptyState } from '../components/EmptyState'
import { MedicineListRow } from '../components/MedicineListRow'
import { SeverityBadge } from '../components/SeverityBadge'
import { Spinner } from '../components/Spinner'
import { useMedicines } from '../context/useMedicines'
import {
  API,
  FULL_DISCLAIMER,
  NO_INTERACTION_MESSAGE,
  NO_INTERACTION_NOTE,
  SOURCE_INFO,
  requestJson,
} from '../config'
import { groupInteractions, normalizeSeverity } from '../lib/severity'

function InteractionSkeleton() {
  return (
    <div className="skeleton-stack" aria-hidden="true">
      {[1, 2].map((item) => (
        <div className="skeleton-result" key={item}>
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line skeleton-line--short" />
        </div>
      ))}
    </div>
  )
}

function InteractionCard({ result, medicineFor }) {
  const first = medicineFor(result.medicine_a_id)
  const second = medicineFor(result.medicine_b_id)
  const medicines = [first, second].filter(Boolean)
  const pairLabel = `${first?.name || `Medicine #${result.medicine_a_id}`} + ${
    second?.name || `Medicine #${result.medicine_b_id}`
  }`

  if (!result.found) {
    return (
      <article className="interaction-card interaction-card--not-found">
        <div className="interaction-card-heading">
          <div>
            <h4>{pairLabel}</h4>
            <p className="interaction-caption">Pair compared</p>
          </div>
          <Badge tone="neutral" icon={<SearchX size={14} />}>
            Not found
          </Badge>
        </div>
        <p className="interaction-description">{NO_INTERACTION_MESSAGE}</p>
        <div className="interaction-meta">
          <Link className="text-link" to={SOURCE_INFO.severityPath}>
            Severity definitions
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </article>
    )
  }

  return (
    <article
      className={`interaction-card interaction-card--${normalizeSeverity(
        result.severity,
      ).toLowerCase()}`}
    >
      <div className="interaction-card-heading">
        <div>
          <h4>{pairLabel}</h4>
          <p className="interaction-caption">Documented interaction</p>
        </div>
        <SeverityBadge severity={result.severity} />
      </div>
      <p className="interaction-description">
        {result.description || 'No description is listed in this source.'}
      </p>
      <div className="interaction-meta">
        <Link className="text-link" to={SOURCE_INFO.severityPath}>
          Severity definition
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}

export default function CheckPage() {
  const {
    list,
    includedMedicines,
    loading,
    loadError,
    removeMedicine,
  } = useMedicines()
  const [editMedicine, setEditMedicine] = useState(null)
  const [checkState, setCheckState] = useState({
    signature: null,
    results: null,
    error: '',
  })
  const [checking, setChecking] = useState(false)
  const signature = includedMedicines.map((medicine) => medicine.id).join(',')
  const results =
    checkState.signature === signature ? checkState.results : null
  const error = checkState.signature === signature ? checkState.error : ''

  function medicineFor(medicineId) {
    return list.find((medicine) => medicine.id === medicineId)
  }

  async function handleCheck() {
    if (includedMedicines.length < 2 || checking) return

    setChecking(true)
    setCheckState({ signature, results: null, error: '' })

    try {
      const data = await requestJson(API.interactions, {
        method: 'POST',
        body: JSON.stringify({
          medicine_ids: includedMedicines.map((medicine) => medicine.id),
        }),
      })
      setCheckState({
        signature,
        results: Array.isArray(data.interactions) ? data.interactions : [],
        error: '',
      })
    } catch (checkError) {
      setCheckState({
        signature,
        results: null,
        error: checkError.message || 'Unable to check interactions right now.',
      })
    } finally {
      setChecking(false)
    }
  }

  const foundResults = results?.filter((result) => result.found) || []
  const notFoundResults = results?.filter((result) => !result.found) || []
  const severityGroups = groupInteractions(foundResults)
  const notIncluded = list.length - includedMedicines.length

  return (
    <div className="page-stack">
      <div className="page-heading">
        <h1>Check interactions</h1>
        <p>
          Compare the medicines in your list against documented interaction
          records from the cited source.
        </p>
      </div>

      {loadError ? (
        <Alert tone="danger" title="Saved list unavailable" role="alert">
          {loadError}
        </Alert>
      ) : null}

      <div className="check-layout">
        <Card className="check-list-panel">
          <div className="panel-heading">
            <div>
              <h2>Medicines in this check</h2>
              <p>
                {includedMedicines.length} included
                {notIncluded > 0 ? ` · ${notIncluded} not included` : ''}
              </p>
            </div>
          </div>

          {loading && list.length === 0 ? (
            <div className="inline-loading">
              <Spinner label="Loading saved medicines" />
              Loading saved list…
            </div>
          ) : null}

          {!loading && list.length === 0 ? (
            <EmptyState
              icon={ListChecks}
              title="No medicines in your list"
              action={
                <Button as={Link} to="/search">
                  Search medicines
                </Button>
              }
            >
              <p>
                Add at least two medicines to compare a pair against the source
                records.
              </p>
            </EmptyState>
          ) : null}

          {list.length > 0 ? (
            <ul className="medicine-list">
              {list.map((medicine) => (
                <MedicineListRow
                  key={medicine.id}
                  medicine={medicine}
                  onEdit={setEditMedicine}
                  onRemove={removeMedicine}
                  compact
                />
              ))}
            </ul>
          ) : null}

          <div className="check-action">
            <Button
              fullWidth
              onClick={handleCheck}
              disabled={includedMedicines.length < 2 || checking}
            >
              {checking ? (
                <>
                  <Spinner label="Checking interactions" />
                  Checking interactions…
                </>
              ) : (
                <>
                  <ClipboardCheck size={17} aria-hidden="true" />
                  Check interactions
                </>
              )}
            </Button>
            <p className="inline-hint">
              {includedMedicines.length < 2
                ? 'Include at least two medicines to run a check.'
                : `Comparing ${includedMedicines.length} medicines in your list.`}
            </p>
          </div>
        </Card>

        <Card
          className="results-panel"
          aria-live="polite"
          aria-busy={checking}
        >
          <div className="panel-heading">
            <div>
              <h2>Interaction results</h2>
            </div>
            {results ? (
              <span className="result-count">
                {results.length} pair{results.length === 1 ? '' : 's'}
              </span>
            ) : null}
          </div>

          {checking ? <InteractionSkeleton /> : null}

          {!checking && error ? (
            <Alert tone="danger" title="Check unavailable" role="alert">
              <p>{error}</p>
              <Button variant="secondary" size="sm" onClick={handleCheck}>
                <RefreshCw size={15} aria-hidden="true" />
                Try again
              </Button>
            </Alert>
          ) : null}

          {!checking && !error && results === null ? (
            <EmptyState
              icon={ClipboardCheck}
              title="No check run yet"
              action={
                includedMedicines.length < 2 ? (
                  <Button as={Link} to="/search" variant="secondary">
                    Add medicines
                  </Button>
                ) : null
              }
            >
              <p>
                {includedMedicines.length < 2
                  ? 'Add at least two medicines to your list, then run the check.'
                  : 'Run the check to review documented interaction records for every pair in your list.'}
              </p>
            </EmptyState>
          ) : null}

          {!checking && !error && results && results.length === 0 ? (
            <EmptyState icon={SearchX} title="No pairs were compared">
              <p>
                Add at least two different medicines to compare a pair.
              </p>
            </EmptyState>
          ) : null}

          {!checking && !error && results && results.length > 0 ? (
            <div className="interaction-results">
              <p className="results-status" role="status">
                {foundResults.length} documented interaction
                {foundResults.length === 1 ? '' : 's'} found across{' '}
                {results.length} pair{results.length === 1 ? '' : 's'}.
              </p>

              {severityGroups.map(([severity, items]) => (
                <section className="severity-group" key={severity}>
                  <div className="severity-group-heading">
                    <SeverityBadge severity={severity} />
                    <span>Source-assigned severity</span>
                  </div>
                  <div className="interaction-list">
                    {items.map((result) => (
                      <InteractionCard
                        key={`${result.medicine_a_id}-${result.medicine_b_id}`}
                        result={result}
                        medicineFor={medicineFor}
                      />
                    ))}
                  </div>
                </section>
              ))}

              {notFoundResults.length > 0 ? (
                <section className="severity-group severity-group--not-found">
                  <div className="no-interaction-heading">
                    <h3>{NO_INTERACTION_MESSAGE}</h3>
                    <p>{NO_INTERACTION_NOTE}</p>
                  </div>
                  <div className="interaction-list">
                    {notFoundResults.map((result) => (
                      <InteractionCard
                        key={`${result.medicine_a_id}-${result.medicine_b_id}`}
                        result={result}
                        medicineFor={medicineFor}
                      />
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          ) : null}
        </Card>
      </div>

      <Alert tone="warning" title="Important">
        {FULL_DISCLAIMER}
      </Alert>

      <EditMedicineDialog
        key={editMedicine ? editMedicine.id : 'none'}
        medicine={editMedicine}
        open={Boolean(editMedicine)}
        onClose={() => setEditMedicine(null)}
      />
    </div>
  )
}
