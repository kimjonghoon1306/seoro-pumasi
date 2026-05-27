import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '../types'

interface AuthState {
  user: User | null
  loading: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({ user: null, loading: true })

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (session?.user) fetchUser(session.user.id)
        else setState({ user: null, loading: false })
      })
      .catch(() => setState({ user: null, loading: false }))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) fetchUser(session.user.id)
      else setState({ user: null, loading: false })
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchUser(id: string) {
    try {
      const { data } = await supabase.from('users').select('*').eq('id', id).single()
      setState({ user: data as User | null, loading: false })
    } catch {
      setState({ user: null, loading: false })
    }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signUp(email: string, password: string, nickname: string, blogUrl: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nickname, blog_url: blogUrl } },
    })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return { ...state, signIn, signUp, signOut }
}
