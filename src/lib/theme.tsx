import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

export type FontSize = 'normal' | 'large' | 'xlarge'
export type Theme    = 'light' | 'dark'

interface ThemeCtx {
  theme: Theme
  fontSize: FontSize
  toggleTheme: () => void
  setFontSize: (s: FontSize) => void
}

const Ctx = createContext<ThemeCtx>({
  theme: 'light',
  fontSize: 'normal',
  toggleTheme: () => {},
  setFontSize: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme,    setTheme]     = useState<Theme>('dark')
  const [fontSize, setFontSize_] = useState<FontSize>('normal')
  const [userId,   setUserId]    = useState<string | null>(null)

  // 로그인 상태 감지 + DB에서 설정 불러오기
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id)
        loadSettings(session.user.id)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        setUserId(session.user.id)
        loadSettings(session.user.id)
      } else {
        setUserId(null)
        // 로그아웃 시 localStorage 기본값
        setTheme((localStorage.getItem('theme') as Theme) || 'dark')
        setFontSize_((localStorage.getItem('fontSize') as FontSize) || 'normal')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Realtime 구독 - 다른 기기에서 변경 시 즉시 반영
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`user_settings_${userId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${userId}`,
      }, (payload) => {
        const updated = payload.new as { theme: Theme; font_size: FontSize }
        if (updated.theme)     setTheme(updated.theme)
        if (updated.font_size) setFontSize_(updated.font_size)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  // 화면에 적용
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark')
      root.style.background          = '#0c1a12'
      document.body.style.background = '#0c1a12'
      document.body.style.color      = ''
    } else {
      root.setAttribute('data-theme', 'light')
      root.style.background          = '#eef2f0'
      document.body.style.background = '#eef2f0'
      document.body.style.color      = ''
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const sizeMap: Record<FontSize, string> = {
      normal: '17px',
      large:  '20px',
      xlarge: '23px',
    }
    document.documentElement.style.fontSize = sizeMap[fontSize]
    localStorage.setItem('fontSize', fontSize)
  }, [fontSize])

  async function loadSettings(uid: string) {
    try {
      const { data } = await supabase
        .from('users')
        .select('theme, font_size')
        .eq('id', uid)
        .single()
      if (data?.theme)     setTheme(data.theme as Theme)
      if (data?.font_size) setFontSize_(data.font_size as FontSize)
    } catch {
      // 실패 시 localStorage 사용
      setTheme((localStorage.getItem('theme') as Theme) || 'dark')
      setFontSize_((localStorage.getItem('fontSize') as FontSize) || 'normal')
    }
  }

  async function saveSettings(newTheme: Theme, newFontSize: FontSize) {
    if (!userId) return
    await supabase
      .from('users')
      .update({ theme: newTheme, font_size: newFontSize })
      .eq('id', userId)
  }

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    saveSettings(next, fontSize)
  }

  function setFontSize(s: FontSize) {
    setFontSize_(s)
    saveSettings(theme, s)
  }

  return <Ctx.Provider value={{ theme, fontSize, toggleTheme, setFontSize }}>{children}</Ctx.Provider>
}

export function useTheme() { return useContext(Ctx) }
