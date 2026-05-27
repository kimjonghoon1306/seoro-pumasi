import { useState } from 'react'
import { Link } from 'wouter'
import { supabase } from '../lib/supabase'
import styles from './FindPassword.module.css'

export default function FindPassword() {
  const [email, setEmail]   = useState('')
  const [done, setDone]     = useState(false)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email.trim()) { setError('이메일 주소를 입력해 주세요.'); return }
    if (!email.includes('@')) { setError('이메일 주소 형식이 맞지 않아요. (예: abc@naver.com)'); return }
    setLoading(true)
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (err) throw err
      setDone(true)
    } catch {
      setError('이메일 전송 중 문제가 생겼어요. 이메일 주소를 다시 확인해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  if (done) return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.doneEmoji}>📧</div>
        <h2 className={styles.doneTitle}>이메일을 보냈어요!</h2>
        <p className={styles.doneDesc}>
          <strong>{email}</strong> 로<br />
          비밀번호 재설정 링크를 보냈어요.<br />
          이메일을 확인해 주세요 😊
        </p>
        <p className={styles.doneNote}>
          이메일이 안 보이면 스팸함도 확인해 주세요!
        </p>
        <Link href="/login" className={styles.backBtn}>← 로그인 페이지로</Link>
      </div>
    </div>
  )

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.icon}>🔑</div>
        <h2 className={styles.title}>비밀번호 찾기</h2>
        <p className={styles.desc}>
          가입하신 이메일 주소를 입력하면<br />
          비밀번호 재설정 링크를 보내드려요
        </p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            📧 가입하신 이메일 주소
            <input
              className={styles.input}
              type="email"
              placeholder="예) abc@naver.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoFocus
            />
          </label>
          {error && <div className={styles.error}>⚠️ {error}</div>}
          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? '전송 중...' : '📨 재설정 이메일 보내기'}
          </button>
        </form>
        <Link href="/login" className={styles.back}>← 로그인으로 돌아가기</Link>
      </div>
    </div>
  )
}
