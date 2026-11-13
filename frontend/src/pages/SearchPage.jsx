import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Check, FileText, Plus, SearchX } from 'lucide-react'
import { AddMedicineDialog } from '../components/AddMedicineDialog'
import { Alert } from '../components/Alert'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { MedicineMeta } from '../components/MedicineMeta'
import { SearchForm } from '../components/SearchForm'
import { useMedicines } from '../context/useMedicines'
import { findSearchSuggestion, searchMedicines } from '../lib/search'
import { formatValue } from '../lib/format'
import { rememberMedicine } from '../lib/medicineCache'

function SearchSkeleton() {
  return (
    <div className="skeleton-stack" aria-hidden="true">
      {[1, 2, 3].map((item) => (
        <div className="skeleton-result" key={item}>
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line skeleton-line--short" />
        </div>
      ))}
    </div>
  )
}

export default function SearchPage() {
  const [params, setParams] = useSearchParams()
  const query = (params.get('q') || '').trim()
  const [searchState, setSearchState] = useState({
    query,
    status: query.length >= 2 ? 'loading' : 'idle',
    results: [],
    error: '',
    suggestion: '',
  })
  const [added, setAdded] = useState({ query: '', name: '' })
  const [selectedMedicine, setSelectedMedicine] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const { isInList } = useMedicines()

  const activeState =
    searchState.query === query
      ? searchState
      : {
          query,
          status: query.length >= 2 ? 'loading' : 'idle',
          results: [],
          error: '',
          suggestion: '',
        }
  const { status, results, error, suggestion } = activeState
  const addedName = added.query === query ? added.name : ''

  useEffect(() => {
    if (query.length < 2) return undefined

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      try {
        const medicines = await searchMedicines(query, {
          signal: controller.signal,
        })

        if (controller.signal.aborted) return
        setSearchState({
          query,
          status: 'done',
          results: medicines,
          error: '',
          suggestion: '',
        })

        if (medicines.length === 0) {
          try {
            const match = await findSearchSuggestion(query, {
              signal: controller.signal,
            })
            if (!controller.signal.aborted && match) {
              setSearchState((current) =>
                current.query === query
                  ? { ...current, suggestion: match }
                  : current,
              )
            }
          } catch (suggestionError) {
            if (suggestionError.name !== 'AbortError') {
              // The search result is still valid if a suggestion cannot load.
            }
          }
        }
      } catch (searchError) {
        if (!controller.signal.aborted) {
          setSearchState({
            query,
            status: 'error',
            results: [],
            error:
              searchError.message ||
              'Unable to search the medicine database. Please try again.',
            suggestion: '',
          })
        }
      }
    }, 300)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [query, reloadKey])

  function updateQuery(value) {
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        if (value.trim()) next.set('q', value)
        else next.delete('q')
        return next
      },
      { replace: true },
    )
  }

  function submitSearch(value) {
    updateQuery(value)
  }

  function retrySearch() {
    setSearchState({
      query,
      status: 'loading',
      results: [],
      error: '',
      suggestion: '',
    })
    setReloadKey((current) => current + 1)
  }

  function handleViewDetails(medicine) {
    rememberMedicine(medicine)
  }

  return (
    <div className="page-stack">
      <div className="page-heading">
        <h1>Search medicines</h1>
        <p>
          Search by medicine name or active ingredient. Review the exact record
          before adding anything to your list.
        </p>
      </div>

      <SearchForm value={query} onChange={updateQuery} onSubmit={submitSearch} />

      <div
        className="results-region"
        aria-live="polite"
        aria-busy={status === 'loading'}
      >
        <p className="results-status">
          {query.length < 2
            ? 'Enter at least two characters to search the reference.'
            : status === 'loading'
              ? 'Searching medicine records…'
              : status === 'done'
                ? `${results.length} result${results.length === 1 ? '' : 's'} for “${query}”`
                : status === 'error'
                  ? 'Search interrupted'
                  : 'Enter at least two characters to search the reference.'}
        </p>

        {status === 'loading' ? <SearchSkeleton /> : null}

        {status === 'error' ? (
          <Alert tone="danger" title="Search unavailable" role="alert">
            <p>{error}</p>
            <Button variant="secondary" size="sm" onClick={retrySearch}>
              Try again
            </Button>
          </Alert>
        ) : null}

        {suggestion ? (
          <Alert tone="info" title="Did you mean…?" role="status">
            <button
              className="link-button"
              type="button"
              onClick={() => updateQuery(suggestion)}
            >
              Search for {suggestion}
              <ArrowRight size={15} aria-hidden="true" />
            </button>
          </Alert>
        ) : null}

        {addedName ? (
          <Alert tone="success" title="Added to your medicines" role="status">
            <p>
              {addedName} is in your list.{' '}
              <Link className="text-link" to="/my-medicines">
                Review my medicines
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </p>
          </Alert>
        ) : null}

        {status === 'done' && results.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No medicines found"
            action={
              <Button as={Link} to="/sources" variant="secondary">
                Read about the data source
              </Button>
            }
          >
            <p>
              No medicine records matched “{query}” by name or active
              ingredient. Check the spelling or try a different term.
            </p>
          </EmptyState>
        ) : null}

        {results.length > 0 ? (
          <ul className="search-results">
            {results.map((medicine) => {
              const inList = isInList(medicine.id)

              return (
                <li className="search-result" key={medicine.id}>
                  <div className="search-result-main">
                    <div className="search-result-heading">
                      <h2>
                        <Link
                          to={`/medicine/${medicine.id}`}
                          state={{ medicine }}
                          onClick={() => handleViewDetails(medicine)}
                        >
                          {medicine.name}
                        </Link>
                      </h2>
                      {inList ? (
                        <Badge tone="success" icon={<Check size={14} />}>
                          In my medicines
                        </Badge>
                      ) : null}
                    </div>
                    <p className="search-result-ingredient">
                      {formatValue(medicine.active_ingredient)}
                    </p>
                    <MedicineMeta medicine={medicine} compact />
                  </div>
                  <div className="search-result-actions">
                    <Button
                      as={Link}
                      to={`/medicine/${medicine.id}`}
                      state={{ medicine }}
                      variant="secondary"
                      size="sm"
                      onClick={() => handleViewDetails(medicine)}
                    >
                      <FileText size={15} aria-hidden="true" />
                      View details
                    </Button>
                    <Button
                      size="sm"
                      variant={inList ? 'secondary' : 'primary'}
                      disabled={inList}
                      onClick={() => setSelectedMedicine(medicine)}
                    >
                      {inList ? (
                        <>
                          <Check size={15} aria-hidden="true" />
                          In list
                        </>
                      ) : (
                        <>
                          <Plus size={15} aria-hidden="true" />
                          Add to my list
                        </>
                      )}
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : null}
      </div>

      <AddMedicineDialog
        medicine={selectedMedicine}
        open={Boolean(selectedMedicine)}
        onClose={() => setSelectedMedicine(null)}
        onAdded={(medicine) =>
          setAdded({ query, name: medicine.name })
        }
      />
    </div>
  )
}
