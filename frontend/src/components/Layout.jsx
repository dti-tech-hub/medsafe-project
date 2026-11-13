import { useEffect, useRef, useState } from 'react'
import {
  Plus,
  ChevronDown,
  ClipboardCheck,
  Database,
  ListChecks,
  LogIn,
  LogOut,
  Menu,
  Search,
  UserRound,
  X,
} from 'lucide-react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { BRAND, ADMIN_EMAIL } from '../config'
import { Button } from './Button'

function Wordmark({ compact = false, onNavigate }) {
  return (
    <Link
      className={`wordmark${compact ? ' wordmark--compact' : ''}`}
      to="/"
      onClick={onNavigate}
    >
      <span className="wordmark-mark" aria-hidden="true">
        <Plus size={compact ? 18 : 20} strokeWidth={2.8} />
      </span>
      <span className="wordmark-text">
        <strong>{BRAND.shortName}</strong>
      </span>
    </Link>
  )
}

function AccountMenu({ user, signingOut, onSignOut }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) setOpen(false)
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div className="account" ref={containerRef}>
      <button
        className="account-trigger"
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
      >
        <UserRound size={17} aria-hidden="true" />
        <span className="account-email">{user.email}</span>
        <ChevronDown size={15} aria-hidden="true" />
      </button>
      {open ? (
        <div className="account-menu" role="menu">
          <div className="account-menu-meta">
            <span>Signed in as</span>
            <strong>{user.email}</strong>
          </div>
          <Link
            className="account-menu-item"
            to="/my-medicines"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <ListChecks size={16} aria-hidden="true" />
            My medicines
          </Link>
          <button
            className="account-menu-item"
            type="button"
            role="menuitem"
            onClick={onSignOut}
            disabled={signingOut}
          >
            <LogOut size={16} aria-hidden="true" />
            {signingOut ? 'Signing out…' : 'Log out'}
          </button>
        </div>
      ) : null}
    </div>
  )
}

function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1))
      window.requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ block: 'start' })
      })
      return
    }

    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname, hash])

  return null
}

export function Layout() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuState, setMenuState] = useState({
    open: false,
    pathname: location.pathname,
  })
  const [signingOut, setSigningOut] = useState(false)
  const mobileOpen =
    menuState.open && menuState.pathname === location.pathname

  function toggleMenu() {
    setMenuState({ open: !mobileOpen, pathname: location.pathname })
  }

  function closeMenu() {
    setMenuState({ open: false, pathname: location.pathname })
  }

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Unable to sign out.', error)
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <div className="app-shell">
      <ScrollManager />
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <header className="site-header">
        <div className="container header-inner">
          <Wordmark onNavigate={closeMenu} />

          <button
            className="icon-button nav-toggle"
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="primary-navigation"
            onClick={toggleMenu}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            <span className="sr-only">
              {mobileOpen ? 'Close navigation' : 'Open navigation'}
            </span>
          </button>

          <nav
            className={`primary-nav${mobileOpen ? ' is-open' : ''}`}
            id="primary-navigation"
            aria-label="Primary navigation"
          >
            <NavLink
              className={({ isActive }) => `nav-link ${isActive ? 'is-active active' : ''}`}
              to="/search"
              onClick={closeMenu}
            >
              <Search size={17} aria-hidden="true" />
              Search
            </NavLink>
            <NavLink
              className={({ isActive }) => `nav-link ${isActive ? 'is-active active' : ''}`}
              to="/my-medicines"
              onClick={closeMenu}
            >
              <ListChecks size={17} aria-hidden="true" />
              My medicines
            </NavLink>
            <NavLink
              className={({ isActive }) => `nav-link ${isActive ? 'is-active active' : ''}`}
              to="/check"
              onClick={closeMenu}
            >
              <ClipboardCheck size={17} aria-hidden="true" />
              Check interactions
            </NavLink>
            {user && user.email?.toLowerCase() === ADMIN_EMAIL ? (
              <NavLink
                className={({ isActive }) => `nav-link ${isActive ? 'is-active active' : ''}`}
                to="/admin"
                onClick={closeMenu}
              >
                <Database size={17} aria-hidden="true" />
                Admin
              </NavLink>
            ) : null}
          </nav>

          <div className="header-actions">
            {loading ? (
              <span className="header-loading">Loading account…</span>
            ) : user ? (
              <AccountMenu
                user={user}
                signingOut={signingOut}
                onSignOut={handleSignOut}
              />
            ) : (
              <Button
                as={Link}
                to="/login"
                variant="secondary"
                size="sm"
                className="login-link"
              >
                <LogIn size={16} aria-hidden="true" />
                Log in
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="page" id="main-content">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container footer-compact">
          <div className="footer-compact-main">
            <Wordmark compact />
            <span className="footer-compact-sep" aria-hidden="true">·</span>
            <span className="footer-disclaimer-text">Always consult a pharmacist or doctor.</span>
          </div>

          <nav className="footer-compact-nav" aria-label="Footer navigation">
            <Link to="/search">Search</Link>
            <Link to="/my-medicines">My medicines</Link>
            <Link to="/check">Check</Link>
            <Link to="/sources">Sources</Link>
            {user ? <span className="footer-user-tag">{user.email}</span> : null}
          </nav>
        </div>
      </footer>
    </div>
  )
}
