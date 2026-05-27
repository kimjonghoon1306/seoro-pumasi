import { useState } from 'react'
import { useLocation, Link } from 'wouter'
import { supabase } from '../lib/supabase'
import styles from './AdminLogin.module.css'

const ADMIN_EMAIL = 's9653@naver.com'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [, setLocation]         = useLocation()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data, error: signInErr } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: password.trim(),
      })
      if (signInErr) {
        setError(`오류: ${signInErr.message}`)
        return
      }
      if (data.user) {
        sessionStorage.setItem('admin_auth', 'true')
        setLocation('/admin')
      }
    } catch (err: unknown) {
      setError(`예외: ${(err as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.icon}>⚙️</div>
        <h2 className={styles.title}>관리자 로그인</h2>
        <p className={styles.desc}>관리자 전용 페이지입니다</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            🔒 관리자 비밀번호
            <div className={styles.pwWrap}>
              <input
                className={styles.input}
                type={showPw ? 'text' : 'password'}
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPw((v: boolean) => !v)}>
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </label>
          {error && <div className={styles.error}>⚠️ {error}</div>}
          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? '확인 중...' : '로그인'}
          </button>
        </form>
        <Link href="/login" className={styles.back}>← 일반 로그인으로 돌아가기</Link>
      </div>
    </div>
  )
}
