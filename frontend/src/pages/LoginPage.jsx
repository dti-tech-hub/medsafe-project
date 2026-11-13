import { useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Alert } from '../components/Alert'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Input } from '../components/Input'
import { useAuth } from '../auth/useAuth'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginPage() {
  const { user, loading, signIn, signUp, verifyEmail } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from =
    typeof location.state?.from === 'string' ? location.state.from : '/'

  const signInTabRef = useRef(null)
  const signUpTabRef = useRef(null)
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [pendingEmail, setPendingEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user) {
    return <Navigate to={from} replace />
  }

  function switchMode(nextMode) {
    setMode(nextMode)
    setError('')
    setNotice('')
    setErrors({})
    setPassword('')
    setConfirmPassword('')
    setOtp('')
  }

  function handleTabKeyDown(event) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      return
    }

    event.preventDefault()
    const nextMode =
      event.key === 'ArrowLeft' || event.key === 'Home' ? 'signin' : 'signup'
    switchMode(nextMode)
    const target = nextMode === 'signin' ? signInTabRef : signUpTabRef
    target.current?.focus()
  }

  function validateEmail() {
    const value = email.trim()
    if (!value) return 'Enter your email address.'
    if (!EMAIL_PATTERN.test(value)) return 'Enter a valid email address.'
    return ''
  }

  function validateCredentials({ creating = false } = {}) {
    const nextErrors = {}
    const emailError = validateEmail()
    if (emailError) nextErrors.email = emailError

    if (!password) {
      nextErrors.password = 'Enter your password.'
    } else if (creating && password.length < 8) {
      nextErrors.password = 'Use at least 8 characters.'
    }

    if (creating) {
      if (!confirmPassword) {
        nextErrors.confirmPassword = 'Re-enter your password.'
      } else if (password !== confirmPassword) {
        nextErrors.confirmPassword = 'Passwords do not match.'
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSignIn(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    if (!validateCredentials()) return

    setSubmitting(true)

    try {
      await signIn(email.trim(), password)
      navigate(from, { replace: true })
    } catch (authError) {
      const message = authError.message || 'Unable to sign in.'
      setError(message)
      if (/verif|confirm/i.test(message)) {
        setPendingEmail(email.trim())
        setMode('verify')
        setNotice(`Enter the 6-digit code sent to ${email.trim()}.`)
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSignUp(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    if (!validateCredentials({ creating: true })) return

    setSubmitting(true)

    try {
      const data = await signUp(email.trim(), password)
      const needsVerification =
        data?.requireEmailVerification || (data?.user && !data?.accessToken)

      if (needsVerification) {
        setPendingEmail(email.trim())
        setMode('verify')
        setNotice(
          `We sent a 6-digit verification code to ${email.trim()}. Enter it below to finish creating your account.`,
        )
        setPassword('')
        setConfirmPassword('')
      } else if (data?.accessToken) {
        navigate(from, { replace: true })
      } else {
        setError('Unable to create your account. Please try again.')
      }
    } catch (authError) {
      setError(authError.message || 'Unable to create your account.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleVerify(event) {
    event.preventDefault()
    const verificationEmail = (pendingEmail || email).trim()
    const nextErrors = {}

    if (!verificationEmail) {
      nextErrors.email = 'Enter the email address used to create your account.'
    }
    if (!/^\d{6}$/.test(otp.trim())) {
      nextErrors.otp = 'Enter the 6-digit verification code.'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    setError('')

    try {
      await verifyEmail(verificationEmail, otp.trim())
      navigate(from, { replace: true })
    } catch (authError) {
      setError(authError.message || 'Unable to verify your email.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleSubmit(event) {
    if (mode === 'signup') {
      handleSignUp(event)
      return
    }
    if (mode === 'verify') {
      handleVerify(event)
      return
    }
    handleSignIn(event)
  }

  const title =
    mode === 'verify'
      ? 'Verify your email'
      : mode === 'signup'
        ? 'Create account'
        : 'Log in'

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <div className="auth-heading">
          <h1>{title}</h1>
          <p>
            {mode === 'verify'
              ? 'Enter the verification code from your email to activate your account.'
              : 'Accounts are optional. Sign in to save a medicine list to your account.'}
          </p>
        </div>

        {mode !== 'verify' ? (
          <div
            className="auth-tabs"
            role="tablist"
            aria-label="Account action"
          >
            <button
              className={`auth-tab${mode === 'signin' ? ' is-active' : ''}`}
              id="auth-tab-signin"
              type="button"
              role="tab"
              aria-selected={mode === 'signin'}
              aria-controls="auth-panel"
              tabIndex={mode === 'signin' ? 0 : -1}
              ref={signInTabRef}
              onClick={() => switchMode('signin')}
              onKeyDown={handleTabKeyDown}
            >
              Log in
            </button>
            <button
              className={`auth-tab${mode === 'signup' ? ' is-active' : ''}`}
              id="auth-tab-signup"
              type="button"
              role="tab"
              aria-selected={mode === 'signup'}
              aria-controls="auth-panel"
              tabIndex={mode === 'signup' ? 0 : -1}
              ref={signUpTabRef}
              onClick={() => switchMode('signup')}
              onKeyDown={handleTabKeyDown}
            >
              Create account
            </button>
          </div>
        ) : null}

        {notice ? (
          <Alert tone="info" role="status">
            {notice}
          </Alert>
        ) : null}
        {error ? (
          <Alert tone="danger" title="Unable to continue" role="alert">
            {error}
          </Alert>
        ) : null}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
          noValidate
          id={mode === 'verify' ? undefined : 'auth-panel'}
          role={mode === 'verify' ? undefined : 'tabpanel'}
          aria-labelledby={
            mode === 'verify' ? undefined : `auth-tab-${mode}`
          }
        >
          {mode === 'verify' ? (
            <>
              <div className="form-field">
                <span className="form-label">Email address</span>
                <strong className="verify-email">
                  {pendingEmail || email || 'No email provided'}
                </strong>
                {errors.email ? (
                  <span className="form-error">{errors.email}</span>
                ) : null}
              </div>
              <Input
                label="Verification code"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={6}
                value={otp}
                onChange={(event) => {
                  setOtp(event.target.value)
                  setErrors((current) => ({ ...current, otp: '' }))
                }}
                placeholder="123456"
                hint="Enter the 6-digit code from the email."
                error={errors.otp}
                required
              />
              <Button type="submit" fullWidth disabled={submitting}>
                {submitting ? 'Verifying…' : 'Verify email'}
              </Button>
              <button
                className="link-button auth-back"
                type="button"
                onClick={() => switchMode('signin')}
              >
                <ArrowLeft size={15} aria-hidden="true" />
                Back to log in
              </button>
            </>
          ) : (
            <>
              <Input
                label="Email address"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setErrors((current) => ({ ...current, email: '' }))
                }}
                placeholder="you@example.com"
                error={errors.email}
                required
              />
              <Input
                label="Password"
                type="password"
                revealable
                autoComplete={
                  mode === 'signup' ? 'new-password' : 'current-password'
                }
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setErrors((current) => ({ ...current, password: '' }))
                }}
                placeholder={
                  mode === 'signup'
                    ? 'At least 8 characters'
                    : 'Enter your password'
                }
                hint={
                  mode === 'signup' ? 'Use at least 8 characters.' : undefined
                }
                error={errors.password}
                required
              />
              {mode === 'signup' ? (
                <Input
                  label="Confirm password"
                  type="password"
                  revealable
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value)
                    setErrors((current) => ({
                      ...current,
                      confirmPassword: '',
                    }))
                  }}
                  placeholder="Re-enter your password"
                  error={errors.confirmPassword}
                  required
                />
              ) : null}
              <Button type="submit" fullWidth disabled={submitting}>
                {submitting
                  ? 'Please wait…'
                  : mode === 'signup'
                    ? 'Create account'
                    : 'Log in'}
              </Button>
              {mode === 'signup' ? (
                <p className="auth-footnote">
                  Email verification is required. We will send a 6-digit code to
                  confirm your address.
                </p>
              ) : null}
            </>
          )}
        </form>

        <p className="auth-guest">
          You can search and check interactions without an account.{' '}
          <Link className="text-link" to="/">
            Continue as a guest
          </Link>
        </p>
      </Card>
    </div>
  )
}
