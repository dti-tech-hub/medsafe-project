import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ClipboardCheck,
  ListChecks,
  LogIn,
  Plus,
  Save,
} from 'lucide-react'
import { Alert } from '../components/Alert'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { EditMedicineDialog } from '../components/EditMedicineDialog'
import { EmptyState } from '../components/EmptyState'
import { MedicineListRow } from '../components/MedicineListRow'
import { Modal } from '../components/Modal'
import { Spinner } from '../components/Spinner'
import { useAuth } from '../auth/useAuth'
import { useMedicines } from '../context/useMedicines'
import { FULL_DISCLAIMER } from '../config'

export default function MyMedicinesPage() {
  const { user } = useAuth()
  const {
    list,
    includedMedicines,
    loading,
    loadError,
    removeMedicine,
    clearList,
    saveList,
  } = useMedicines()
  const navigate = useNavigate()
  const [editMedicine, setEditMedicine] = useState(null)
  const [saveOpen, setSaveOpen] = useState(false)
  const [consent, setConsent] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState('')

  function openSaveDialog() {
    setConsent(false)
    setSaveError('')
    setSaveOpen(true)
  }

  function handleRemove(medicineId) {
    removeMedicine(medicineId)
    setSaveSuccess('')
  }

  async function handleSave() {
    setSaving(true)
    setSaveError('')

    try {
      await saveList()
      setSaveOpen(false)
      setSaveSuccess('Your medicine list was saved to your account.')
    } catch (error) {
      setSaveError(error.message || 'Unable to save your medicine list.')
    } finally {
      setSaving(false)
    }
  }

  const canCheck = includedMedicines.length >= 2

  return (
    <div className="page-stack">
      <div className="page-heading page-heading--with-actions">
        <div>
          <h1>My medicines</h1>
          <p>
            Keep the medicines you want to review together. Edit list entries or
            remove them at any time.
          </p>
        </div>
        <div className="heading-actions">
          {list.length > 0 ? (
            <Button
              variant="ghost"
              onClick={() => {
                if (window.confirm('Remove all medicines from your list?')) {
                  clearList()
                }
              }}
              title="Remove all medicines from your list"
            >
              Clear list
            </Button>
          ) : null}
          <Button as={Link} to="/search" variant="secondary">
            <Plus size={16} aria-hidden="true" />
            Add medicines
          </Button>
          <Button
            onClick={() => navigate('/check')}
            disabled={!canCheck}
            title={
              canCheck
                ? undefined
                : 'Include at least two medicines to check interactions.'
            }
          >
            <ClipboardCheck size={16} aria-hidden="true" />
            Check interactions
          </Button>
        </div>
      </div>

      {loadError ? (
        <Alert tone="danger" title="Saved list unavailable" role="alert">
          {loadError}
        </Alert>
      ) : null}

      {saveSuccess ? (
        <Alert tone="success" title="List saved" role="status">
          {saveSuccess}
        </Alert>
      ) : null}

      <Card className="list-panel">
        <div className="panel-heading">
          <div>
            <h2>Your list</h2>
            <p>
              {list.length} medicine{list.length === 1 ? '' : 's'} ·{' '}
              {includedMedicines.length} included in checks
            </p>
          </div>
          {loading ? (
            <span className="inline-loading">
              <Spinner label="Loading saved medicines" />
              Loading saved list…
            </span>
          ) : null}
        </div>

        {loading && list.length === 0 ? (
          <div className="skeleton-stack" aria-hidden="true">
            {[1, 2].map((item) => (
              <div className="skeleton-result" key={item}>
                <div className="skeleton skeleton-title" />
                <div className="skeleton skeleton-line" />
              </div>
            ))}
          </div>
        ) : null}

        {!loading && list.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title="Your medicine list is empty"
            action={
              <Button as={Link} to="/search">
                Search medicines
              </Button>
            }
          >
            <p>
              Search for a medicine, confirm the exact record, and add it to
              this list. The checker works without an account.
            </p>
          </EmptyState>
        ) : null}

        {list.length > 0 ? (
          <>
            <ul className="medicine-list">
              {list.map((medicine) => (
                <MedicineListRow
                  key={medicine.id}
                  medicine={medicine}
                  onEdit={setEditMedicine}
                  onRemove={handleRemove}
                />
              ))}
            </ul>

            <div className="list-footer">
              {user ? (
                <div className="save-list-block">
                  <Button
                    variant="secondary"
                    onClick={openSaveDialog}
                    disabled={saving || list.length === 0}
                  >
                    <Save size={16} aria-hidden="true" />
                    Save to account
                  </Button>
                  <p>
                    Saving keeps this list in your account for your next visit.
                  </p>
                </div>
              ) : (
                <Alert tone="info" title="Accounts are optional">
                  <p>
                    You can build and check a list as a guest. To keep this list
                    for a later visit,{' '}
                    <Link className="text-link" to="/login">
                      <LogIn size={14} aria-hidden="true" />
                      log in
                    </Link>
                    .
                  </p>
                </Alert>
              )}

              {!canCheck ? (
                <p className="inline-hint">
                  Include at least two medicines to run an interaction check.
                </p>
              ) : null}
            </div>
          </>
        ) : null}
      </Card>

      <EditMedicineDialog
        key={editMedicine ? editMedicine.id : 'none'}
        medicine={editMedicine}
        open={Boolean(editMedicine)}
        onClose={() => setEditMedicine(null)}
      />

      <Modal
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        title="Save medicine list to your account"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setSaveOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!consent || saving}
              data-autofocus
            >
              {saving ? 'Saving…' : 'Save list'}
            </Button>
          </>
        }
      >
        <p>
          This saves the medicines currently in your list to your account. It
          does not save a clinical assessment.
        </p>
        <Alert tone="warning" title="Before you save">
          {FULL_DISCLAIMER}
        </Alert>
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
          />
          <span>
            <strong>
              I understand this tool reports documented information only.
            </strong>
            <span>
              I confirm that I have reviewed the medicines in this list.
            </span>
          </span>
        </label>
        {saveError ? (
          <Alert tone="danger" title="Unable to save" role="alert">
            {saveError}
          </Alert>
        ) : null}
      </Modal>
    </div>
  )
}
