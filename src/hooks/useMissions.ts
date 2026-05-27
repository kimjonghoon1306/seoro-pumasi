import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Mission, Completion } from '../types'

// 내가 올린 미션 목록
export function useMyMissions(userId: string | undefined) {
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    supabase
      .from('missions')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setMissions((data as Mission[]) || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [userId])

  return { missions, loading }
}

// 내가 완료한 인증 목록
export function useMyCompletions(userId: string | undefined) {
  const [completions, setCompletions] = useState<Completion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    supabase
      .from('completions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        setCompletions((data as Completion[]) || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [userId])

  return { completions, loading }
}
