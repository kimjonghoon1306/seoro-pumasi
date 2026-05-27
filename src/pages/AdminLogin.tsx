import { useState } from 'react'
import { useLocation } from 'wouter'
import styles from './AdminLogin.module.css'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [, setLocation]         = useLocation()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const adminPw = import.meta.env.VITE_ADMIN_PASSWORD as string
    if (password === adminPw) {
      sessionStorage.setItem('admin_auth', 'true')
      setLocation('/admin')
    } else {
      setError('비밀번호가 맞지 않아요.')
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
            <input
              className={styles.input}
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
            />
          </label>
          {error && <div className={styles.error}>⚠️ {error}</div>}
          <button className={styles.btn} type="submit">
            로그인
          </button>
        </form>

        <button className={styles.back} onClick={() => setLocation('/login')}>
          ← 일반 로그인으로 돌아가기
        </button>
      </div>
    </div>
  )
}
