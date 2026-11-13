import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Alert } from '../components/Alert'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Input, Textarea } from '../components/Input'
import { Spinner } from '../components/Spinner'
import { useAuth } from '../auth/useAuth'
import {
  ADMIN_EMAIL,
  API,
  FULL_DISCLAIMER,
  requestJson,
} from '../config'

const EMPTY_FORM = {
  name: '',
  active_ingredient: '',
  uses: '',
  warnings: '',
  side_effects: '',
  allergy_notes: '',
  source_name: '',
  source_date: '',
}

export default function AdminPage() {
  const { user, loading, getAccessToken } = useAuth()
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (loading) {
    return (
      <div className="page-status" role="status">
        <Spinner label="Checking your session" />
        Checking your session…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: '/admin' }} replace />
  }

  if (user.email?.toLowerCase() !== ADMIN_EMAIL) {
    return (
      <div className="page-stack">
        <div className="page-heading">
          <h1>Admin access restricted</h1>
          <p>This section is reserved for the designated medical administrator.</p>
        </div>
        <Alert tone="danger" title="Access Denied" role="alert">
          You are signed in as <strong>{user.email}</strong>, which does not have administrator privileges. Only <strong>{ADMIN_EMAIL}</strong> can manage reference records.
        </Alert>
        <div>
          <Button as={Link} to="/">
            Return to home
          </Button>
        </div>
      </div>
    )
  }

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setSuccess('')
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.name.trim()) {
      setError('Medicine name is required.')
      return
    }

    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const token = await getAccessToken()
      if (!token) {
        throw new Error('Your session has expired. Please log in again.')
      }

      const payload = Object.fromEntries(
        Object.entries(form)
          .map(([key, value]) => [key, value.trim()])
          .filter(([, value]) => value !== ''),
      )

      const data = await requestJson(API.adminMedicine, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })

      setForm(EMPTY_FORM)
      setSuccess(
        `Added ${data.medicine?.name || payload.name} to the medicine database.`,
      )
    } catch (submitError) {
      setError(
        submitError.message || 'Unable to add this medicine right now.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-stack">
      <div className="page-heading">
        <h1>Admin</h1>
        <p>
          Add a medicine record with its source reference. Admin access is
          available to any signed-in account in this version.
        </p>
      </div>

      <Card className="content-card">
        <div className="content-heading">
          <span className="content-icon" aria-hidden="true">
            <Plus size={20} />
          </span>
          <div>
            <h2>New medicine</h2>
            <p>Publish a new medicine profile and source reference.</p>
          </div>
        </div>

        {error ? (
          <Alert tone="danger" title="Unable to add medicine" role="alert">
            {error}
          </Alert>
        ) : null}
        {success ? (
          <Alert tone="success" title="Medicine added" role="status">
            {success}
          </Alert>
        ) : null}

        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <Input
              label="Medicine name (required)"
              name="name"
              value={form.name}
              onChange={updateField}
              placeholder="e.g. Amoxicillin"
              required
            />
            <Input
              label="Active ingredient"
              name="active_ingredient"
              value={form.active_ingredient}
              onChange={updateField}
              placeholder="e.g. Amoxicillin trihydrate"
            />
          </div>

          <Textarea
            label="Uses"
            name="uses"
            rows={3}
            value={form.uses}
            onChange={updateField}
            placeholder="What is this medicine used to treat?"
          />

          <Textarea
            label="Warnings"
            name="warnings"
            rows={3}
            value={form.warnings}
            onChange={updateField}
            placeholder="Important warnings, contraindications, or precautions"
          />

          <Textarea
            label="Side effects"
            name="side_effects"
            rows={3}
            value={form.side_effects}
            onChange={updateField}
            placeholder="Common or serious side effects"
          />

          <Textarea
            label="Allergy notes & contraindications"
            name="allergy_notes"
            rows={2}
            value={form.allergy_notes}
            onChange={updateField}
            placeholder="Contraindicated in specific allergies or conditions"
          />

          <div className="form-grid">
            <Input
              label="Source name"
              name="source_name"
              value={form.source_name}
              onChange={updateField}
              placeholder="e.g. FDA Drug Labels"
            />
            <Input
              label="Source date"
              name="source_date"
              type="date"
              value={form.source_date}
              onChange={updateField}
            />
          </div>

          <div className="form-actions">
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner label="Adding medicine" />
                  Adding medicine…
                </>
              ) : (
                'Add medicine'
              )}
            </Button>
            <p className="inline-hint">
              Required fields are marked. Source details are displayed with the
              record.
            </p>
          </div>
        </form>

        <Alert tone="warning" title="Important">
          {FULL_DISCLAIMER}
        </Alert>
      </Card>
    </div>
  )
}
