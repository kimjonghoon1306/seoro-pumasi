import { useState, useEffect } from 'react'
import { Link, useLocation } from 'wouter'
import { supabase } from '../lib/supabase'
import styles from './FindPassword.module.css'

export default function ResetPassword() {
  const [newPw, setNewPw]         = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showNew, setShowNew]     = useState(false)
  const [showConf, setShowConf]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [done, setDone]           = useState(false)
  const [ready, setReady]         = useState(false)
  const [, setLocation]           = useLocation()

  // Supabase가 URL 해시에서 세션을 자동으로 복구
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true)
      } else {
        // 세션 없으면 로그인 페이지로
        setLocation('/login')
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        setReady(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [setLocation])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (newPw.length < 8)    { setError('비밀번호는 8자리 이상이어야 해요.'); return }
    if (newPw !== confirmPw) { setError('비밀번호가 일치하지 않아요.'); return }

    setLoading(true)
    try {
      const { error: err } = await supabase.auth.updateUser({ password: newPw })
      if (err) throw err
      setDone(true)
    } catch {
      setError('비밀번호 변경 중 문제가 생겼어요. 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  // 완료
  if (done) return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.doneEmoji}>🎉</div>
        <h2 className={styles.doneTitle}>비밀번호 변경 완료!</h2>
        <p className={styles.doneDesc}>
          새 비밀번호로 변경됐어요.<br />
          로그인 페이지에서 다시 로그인해 주세요 😊
        </p>
        <Link href="/login" className={styles.backBtn}>→ 로그인하러 가기</Link>
      </div>
    </div>
  )

  // 세션 확인 중
  if (!ready) return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.icon}>⏳</div>
        <h2 className={styles.title}>확인 중이에요...</h2>
        <p className={styles.desc}>잠시만 기다려 주세요.</p>
      </div>
    </div>
  )

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.icon}>🔑</div>
        <h2 className={styles.title}>새 비밀번호 설정</h2>
        <p className={styles.desc}>
          사용할 새 비밀번호를 입력해 주세요
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            새 비밀번호
            <div style={{ position: 'relative' }}>
              <input
                className={styles.input}
                type={showNew ? 'text' : 'password'}
                placeholder="새 비밀번호 (8자리 이상)"
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                autoFocus
                style={{ paddingRight: '52px' }}
              />
              <button type="button"
                style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', background:'transparent', fontSize:'20px', padding:'4px', cursor:'pointer', border:'none' }}
                onClick={() => setShowNew(v => !v)}>
                {showNew ? '🙈' : '👁️'}
              </button>
            </div>
          </label>

          <label className={styles.label}>
            비밀번호 확인
            <div style={{ position: 'relative' }}>
              <input
                className={styles.input}
                type={showConf ? 'text' : 'password'}
                placeholder="비밀번호 한 번 더 입력"
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                style={{ paddingRight: '52px' }}
              />
              <button type="button"
                style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', background:'transparent', fontSize:'20px', padding:'4px', cursor:'pointer', border:'none' }}
                onClick={() => setShowConf(v => !v)}>
                {showConf ? '🙈' : '👁️'}
              </button>
            </div>
          </label>

          {error && <div className={styles.error}>⚠️ {error}</div>}

          <button className={styles.btn} type="submit" disabled={loading || !newPw || !confirmPw}>
            {loading ? '변경 중...' : '✅ 비밀번호 변경하기'}
          </button>
        </form>
      </div>
    </div>
  )
}
