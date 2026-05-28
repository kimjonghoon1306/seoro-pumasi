import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Mission, Completion } from '../types'

export function useMyMissions(userId: string | undefined) {
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return }
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
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  // Realtime 구독 — 내 미션 변경 시 자동 업데이트
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`my_missions_${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'missions',
        filter: `owner_id=eq.${userId}`,
      }, () => {
        load()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, load])

  return { missions, loading }
}

export function useMyCompletions(userId: string | undefined) {
  const [completions, setCompletions] = useState<Completion[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return }
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
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  // Realtime 구독 — 내 인증 상태 변경 시 자동 업데이트 (승인/반려 즉시 반영)
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`my_completions_${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'completions',
        filter: `user_id=eq.${userId}`,
      }, () => {
        load()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, load])

  return { completions, loading }
}
