import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import styles from './MyPage.module.css'

export default function MyPage() {
  const { user } = useAuth()

  const [curPw, setCurPw]         = useState('')
  const [newPw, setNewPw]         = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showCur, setShowCur]     = useState(false)
  const [showNew, setShowNew]     = useState(false)
  const [msg, setMsg]             = useState('')
  const [loading, setLoading]     = useState(false)

  if (!user) return null
  const currentUser = user

  async function handleChangePw(e: React.FormEvent) {
    e.preventDefault()
    setMsg('')

    if (!curPw)             { setMsg('❌ 현재 비밀번호를 입력해 주세요.'); return }
    if (newPw.length < 8)   { setMsg('❌ 새 비밀번호는 8자리 이상이어야 해요.'); return }
    if (newPw !== confirmPw){ setMsg('❌ 새 비밀번호가 서로 다르게 입력됐어요.'); return }
    if (curPw === newPw)    { setMsg('❌ 현재 비밀번호와 같아요. 다른 비밀번호를 입력해 주세요.'); return }

    setLoading(true)
    try {
      // 현재 비밀번호로 재인증
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: curPw,
      })
      if (signInErr) { setMsg('❌ 현재 비밀번호가 맞지 않아요.'); return }

      // 비밀번호 변경
      const { error: updateErr } = await supabase.auth.updateUser({ password: newPw })
      if (updateErr) throw updateErr

      setMsg('✅ 비밀번호가 성공적으로 변경됐어요!')
      setCurPw(''); setNewPw(''); setConfirmPw('')
    } catch {
      setMsg('❌ 변경 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrap}>

      {/* 내 정보 */}
      <div className={styles.infoCard}>
        <div className={styles.avatar}>{currentUser.nickname[0]}</div>
        <div className={styles.infoDetail}>
          <h2 className={styles.nickname}>{currentUser.nickname}님</h2>
          <div className={styles.infoBadges}>
            <div className={styles.infoBadge}>
              <span className={styles.badgeIcon}>📧</span>
              <span className={styles.badgeLabel}>이메일</span>
              <span className={styles.badgeValue}>{currentUser.email}</span>
            </div>
            <a href={currentUser.blog_url} target="_blank" rel="noreferrer"
              className={styles.infoBadge}>
              <span className={styles.badgeIcon}>📝</span>
              <span className={styles.badgeLabel}>블로그</span>
              <span className={styles.badgeBlog}>내 블로그 바로가기 →</span>
            </a>
          </div>
        </div>
        <div className={styles.pointBox}>
          <span className={styles.pointNum}>{currentUser.points.toLocaleString()}</span>
          <span className={styles.pointLabel}>보유 포인트</span>
        </div>
      </div>

      {/* 비밀번호 변경 */}
      <div className={styles.pwCard}>
        <h2 className={styles.cardTitle}>🔒 비밀번호 변경</h2>
        <p className={styles.cardDesc}>
          보안을 위해 비밀번호를 주기적으로 바꿔주세요 😊
        </p>

        <form onSubmit={handleChangePw} className={styles.form}>
          <label className={styles.label}>
            현재 비밀번호
            <div className={styles.pwWrap}>
              <input
                className={styles.input}
                type={showCur ? 'text' : 'password'}
                placeholder="현재 비밀번호를 입력해 주세요"
                value={curPw}
                onChange={e => setCurPw(e.target.value)}
                autoComplete="current-password"
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowCur(v => !v)}>
                {showCur ? '🙈' : '👁️'}
              </button>
            </div>
          </label>

          <label className={styles.label}>
            새 비밀번호
            <div className={styles.pwWrap}>
              <input
                className={styles.input}
                type={showNew ? 'text' : 'password'}
                placeholder="새 비밀번호 (8자리 이상)"
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                autoComplete="new-password"
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowNew(v => !v)}>
                {showNew ? '🙈' : '👁️'}
              </button>
            </div>
            <span className={styles.hint}>숫자와 영문자를 섞어 8자리 이상 입력해 주세요</span>
          </label>

          <label className={styles.label}>
            새 비밀번호 확인
            <input
              className={styles.input}
              type="password"
              placeholder="새 비밀번호를 한 번 더 입력해 주세요"
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              autoComplete="new-password"
            />
          </label>

          {msg && (
            <div className={msg.startsWith('✅') ? styles.msgOk : styles.msgErr}>
              {msg}
            </div>
          )}

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? '변경 중...' : '🔑 비밀번호 변경하기'}
          </button>
        </form>
      </div>

    </div>
  )
}
