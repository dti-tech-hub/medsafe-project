import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  Database,
  FileSearch,
  GitCompareArrows,
  ListTree,
} from 'lucide-react'
import { Alert } from '../components/Alert'
import { Card } from '../components/Card'
import { SeverityBadge } from '../components/SeverityBadge'
import { Table } from '../components/Table'
import {
  API,
  FULL_DISCLAIMER,
  SEVERITY_DEFINITIONS,
  SOURCE_INFO,
  requestJson,
} from '../config'
import { formatDate } from '../lib/format'

const MATCHING_STEPS = [
  'Search records by medicine name or active ingredient.',
  'Add the exact medicine record you intended to review to your list.',
  'The check sends the IDs of every included medicine as a list.',
  'Every unique pair of medicines is compared against the interaction records.',
  'The lookup accepts either medicine order for a pair.',
  'If a record exists, the source severity and description are returned. If no record exists, the result states that no documented interaction was found in this source.',
]

const LIMITS = [
  'No dose assessment.',
  'No age assessment.',
  'No pregnancy assessment.',
  'No kidney or liver function assessment.',
  'No review of other personal factors.',
  'No assessment of whether a medicine is appropriate for you.',
]

export default function SourcesPage() {
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    let active = true
    async function loadSummary() {
      try {
        const data = await requestJson(API.sourcesSummary)
        if (active && data) setSummary(data)
      } catch {
        // Fallback to static info if summary endpoint is offline
      }
    }
    loadSummary()
    return () => {
      active = false
    }
  }, [])

  const sourceName = summary?.primary_source || SOURCE_INFO.name
  const lastUpdated = summary?.last_updated || SOURCE_INFO.lastUpdated
  const version = summary?.version || SOURCE_INFO.version

  return (
    <div className="page-stack">
      <div className="page-heading">
        <h1>Sources &amp; method</h1>
        <p>
          This reference reports source records. It does not interpret them as
          clinical advice or assess personal factors.
        </p>
      </div>

      <Card className="content-card">
        <div className="content-heading">
          <span className="content-icon" aria-hidden="true">
            <Database size={20} />
          </span>
          <div>
            <h2>Data source</h2>
            <p>Source names, dates and version information in the current reference.</p>
          </div>
        </div>

        <Table caption="Source records in the current reference">
          <thead>
            <tr>
              <th scope="col">Data source</th>
              <th scope="col">Update date</th>
              <th scope="col">Version / Scope</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{sourceName}</td>
              <td>{formatDate(lastUpdated)}</td>
              <td>{version}</td>
            </tr>
          </tbody>
        </Table>

        {summary?.total_medicines ? (
          <p className="muted-copy" style={{ marginTop: 'var(--space-2)' }}>
            <strong>Active dataset:</strong> {summary.total_medicines} medicines,{' '}
            {summary.total_interactions} verified pairwise interactions.
          </p>
        ) : null}

        <p className="muted-copy">{SOURCE_INFO.versionNote}</p>
      </Card>

      <Card className="content-card">
        <div className="content-heading">
          <span className="content-icon" aria-hidden="true">
            <GitCompareArrows size={20} />
          </span>
          <div>
            <h2>How pairs are matched</h2>
            <p>The checker uses exact medicine records and pairwise lookups.</p>
          </div>
        </div>

        <ol className="method-list">
          {MATCHING_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        <Alert tone="info" title="What the results mean">
          The result list reports whether a documented record exists for a pair
          and shows the severity label stored with that record. The app does not
          reinterpret the label.
        </Alert>
      </Card>

      <Card className="content-card" id="severity-labels">
        <div className="content-heading">
          <span className="content-icon" aria-hidden="true">
            <ListTree size={20} />
          </span>
          <div>
            <h2>Severity labels</h2>
            <p>
              These labels are displayed exactly as assigned in the source
              record.
            </p>
          </div>
        </div>

        <Table caption="Severity labels used by the reference">
          <thead>
            <tr>
              <th scope="col">Label</th>
              <th scope="col">How it is presented</th>
            </tr>
          </thead>
          <tbody>
            {SEVERITY_DEFINITIONS.map((definition) => (
              <tr key={definition.label}>
                <td>
                  <SeverityBadge severity={definition.label} />
                </td>
                <td>{definition.description}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Card className="content-card">
        <div className="content-heading">
          <span className="content-icon" aria-hidden="true">
            <FileSearch size={20} />
          </span>
          <div>
            <h2>Limits</h2>
            <p>What this reference does not assess.</p>
          </div>
        </div>

        <ul className="limit-list">
          {LIMITS.map((limit) => (
            <li key={limit}>{limit}</li>
          ))}
        </ul>

        <p>
          The absence of a documented interaction record does not replace advice
          from a pharmacist or doctor. This reference may not include every
          interaction or every medicine.
        </p>
      </Card>

      <div className="source-meta-strip">
        <span>
          <CalendarDays size={17} aria-hidden="true" />
          Source date in records: {formatDate(SOURCE_INFO.lastUpdated)}
        </span>
        <Link className="text-link" to="/search">
          Search the reference
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>

      <Alert tone="warning" title="Important">
        {FULL_DISCLAIMER}
      </Alert>
    </div>
  )
}
