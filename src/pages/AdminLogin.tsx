import { useState } from 'react'
import { Link, useLocation } from 'wouter'
import { supabase } from '../lib/supabase'
import styles from './AdminLogin.module.css'

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 's9653@naver.com'

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
        setError('비밀번호가 올바르지 않아요.')
        return
      }
      if (data.user) {
        sessionStorage.setItem('admin_auth', 'true')
        setLocation('/admin')
      }
    } catch {
      setError('오류가 발생했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.root}>
      {/* 배경 장식 */}
      <div className={styles.bgOrb1} />
      <div className={styles.bgOrb2} />

      <div className={styles.card}>
        {/* 로고 */}
        <div className={styles.logoWrap}>
          <div className={styles.logoIcon}>⚙️</div>
          <div>
            <div className={styles.logoTitle}>관리자 패널</div>
            <div className={styles.logoSub}>서로품앗이 컨트롤 센터</div>
          </div>
        </div>

        <div className={styles.divider} />

        <p className={styles.guide}>관리자 비밀번호를 입력하세요</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            🔒 비밀번호
            <div className={styles.pwWrap}>
              <input
                className={styles.input}
                type={showPw ? 'text' : 'password'}
                placeholder="비밀번호 입력"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </label>

          {error && (
            <div className={styles.error} role="alert">
              ⚠️ {error}
            </div>
          )}

          <button className={styles.btn} type="submit" disabled={loading || !password}>
            {loading ? (
              <span className={styles.btnLoading}>확인 중...</span>
            ) : (
              '🔑 로그인'
            )}
          </button>
        </form>

        <Link href="/login" className={styles.backLink}>
          ← 일반 페이지로 돌아가기
        </Link>
      </div>
    </div>
  )
}
