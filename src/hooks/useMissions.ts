import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Mission, Completion } from '../types'

export function useMyMissions(userId: string | undefined) {
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setLoading(false); return }

    async function load() {
      try {
        const { data } = await supabase
          .from('missions')
          .select('*')
          .eq('owner_id', userId)
          .order('created_at', { ascending: false })
        setMissions((data as Mission[]) || [])
      } catch {
        setMissions([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [userId])

  return { missions, loading }
}

export function useMyCompletions(userId: string | undefined) {
  const [completions, setCompletions] = useState<Completion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setLoading(false); return }

    async function load() {
      try {
        const { data } = await supabase
          .from('completions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10)
        setCompletions((data as Completion[]) || [])
      } catch {
        setCompletions([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [userId])

  return { completions, loading }
}
