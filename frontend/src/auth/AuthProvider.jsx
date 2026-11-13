import { useCallback, useEffect, useMemo, useState } from 'react'
import { insforge } from '../lib/insforge'
import { AuthContext } from './AuthContext'

function toAuthError(error, fallback) {
  const authError = new Error(error?.message || fallback)
  authError.statusCode = error?.statusCode
  authError.code = error?.code
  return authError
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    let unsubscribe = () => {}

    async function hydrate() {
      try {
        const token = await insforge.getHttpClient().getValidAccessToken()
        if (!token) {
          if (active) {
            setUser(null)
          }
          return
        }

        const { data, error } = await insforge.auth.getCurrentUser()
        if (active) {
          setUser(error ? null : (data?.user ?? null))
        }
      } catch {
        if (active) {
          setUser(null)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    hydrate()

    unsubscribe = insforge.auth.onAuthStateChange((event) => {
      if (event === 'signedOut') {
        if (active) {
          setUser(null)
        }
        return
      }

      insforge.auth
        .getCurrentUser()
        .then(({ data }) => {
          if (active) {
            setUser(data?.user ?? null)
          }
        })
        .catch(() => {
          if (active) {
            setUser(null)
          }
        })
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await insforge.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw toAuthError(error, 'Unable to sign in.')
    }
    if (data?.user) {
      setUser(data.user)
    }
    return data
  }, [])

  const signUp = useCallback(async (email, password) => {
    const { data, error } = await insforge.auth.signUp({
      email,
      password,
    })

    if (error) {
      throw toAuthError(error, 'Unable to create your account.')
    }
    if (data?.user && data?.accessToken) {
      setUser(data.user)
    }
    return data
  }, [])

  const verifyEmail = useCallback(async (email, otp) => {
    const { data, error } = await insforge.auth.verifyEmail({ email, otp })

    if (error) {
      throw toAuthError(error, 'Unable to verify your email.')
    }
    if (data?.user) {
      setUser(data.user)
    }
    return data
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await insforge.auth.signOut()
    if (error) {
      throw toAuthError(error, 'Unable to sign out.')
    }
    setUser(null)
  }, [])

  const getAccessToken = useCallback(
    () => insforge.getHttpClient().getValidAccessToken(),
    [],
  )

  const value = useMemo(
    () => ({
      user,
      loading,
      signIn,
      signUp,
      verifyEmail,
      signOut,
      getAccessToken,
    }),
    [user, loading, signIn, signUp, verifyEmail, signOut, getAccessToken],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
