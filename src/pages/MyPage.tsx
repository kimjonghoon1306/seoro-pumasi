import { useState, useEffect } from 'react'
import { Link } from 'wouter'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import styles from './MyPage.module.css'

/* ── 타입별 포인트 비용 ── */
const EARN_LABELS: Record<string, string> = {
  neighbor: '🤝 서로이웃 추가 완료',
  like:     '💛 공감 누르기 완료',
  comment:  '💬 댓글 달기 완료',
}
const SPEND_COST: Record<string, number> = {
  neighbor: 15, like: 5, comment: 8,
}
const SPEND_LABELS: Record<string, string> = {
  neighbor: '🤝 서로이웃 미션 등록',
  like:     '💛 공감 미션 등록',
  comment:  '💬 댓글 미션 등록',
}

type PointRecord = {
  id: string
  date: string
  type: 'earn' | 'spend'
  amount: number
  label: string
  detail: string
  status?: string
}

function formatDate(d: string) {
  const dt = new Date(d)
  return `${dt.getFullYear()}.${dt.getMonth()+1}.${dt.getDate()}`
}

/* ── 포인트 내역 컴포넌트 ── */
function PointHistory({ userId }: { userId: string }) {
  const [records, setRecords] = useState<PointRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        // 적립 내역 (승인된 인증)
        const { data: completions } = await supabase
          .from('completions')
          .select('id, created_at, status, missions(type, points, blog_url)')
          .eq('user_id', userId)
          .in('status', ['approved', 'pending'])
          .order('created_at', { ascending: false })
          .limit(30)

        // 사용 내역 (내가 등록한 미션)
        const { data: missions } = await supabase
          .from('missions')
          .select('id, created_at, type, total_count, blog_url')
          .eq('owner_id', userId)
          .order('created_at', { ascending: false })
          .limit(30)

        const earnRecords: PointRecord[] = (completions || []).map((c: any) => ({
          id:     `earn_${c.id}`,
          date:   c.created_at,
          type:   'earn' as const,
          amount: c.missions?.points ?? 0,
          label:  EARN_LABELS[c.missions?.type] || '미션 완료',
          detail: c.missions?.blog_url || '',
          status: c.status,
        }))

        const spendRecords: PointRecord[] = (missions || []).map((m: any) => ({
          id:     `spend_${m.id}`,
          date:   m.created_at,
          type:   'spend' as const,
          amount: (SPEND_COST[m.type] || 0) * m.total_count,
          label:  SPEND_LABELS[m.type] || '미션 등록',
          detail: `${m.total_count}회 × ${SPEND_COST[m.type] || 0}P`,
          status: undefined,
        }))

        // 날짜순 합산
        const all = [...earnRecords, ...spendRecords]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        setRecords(all)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userId])

  if (loading) return (
    <div className={styles.historyEmpty}>
      <span>⏳</span><p>불러오는 중...</p>
    </div>
  )

  if (records.length === 0) return (
    <div className={styles.historyEmpty}>
      <span>📭</span>
      <p>아직 포인트 내역이 없어요</p>
      <small>미션을 수행하거나 등록하면 여기에 기록돼요</small>
    </div>
  )

  return (
    <div className={styles.historyList}>
      {records.map(r => (
        <div key={r.id} className={styles.historyRow}>
          <div className={styles.historyIcon}>
            {r.type === 'earn'
              ? (r.status === 'pending' ? '⏳' : '✅')
              : '💸'}
          </div>
          <div className={styles.historyInfo}>
            <div className={styles.historyLabel}>{r.label}</div>
            {r.detail && <div className={styles.historyDetail}>{r.detail}</div>}
            <div className={styles.historyDate}>{formatDate(r.date)}</div>
          </div>
          <div className={`${styles.historyAmount} ${r.type === 'earn' ? styles.historyEarn : styles.historySpend}`}>
            {r.type === 'earn'
              ? (r.status === 'pending' ? `+${r.amount}P 대기` : `+${r.amount}P`)
              : `-${r.amount}P`}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── 메인 컴포넌트 ── */
export default function MyPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<'pw' | 'history'>('pw')

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
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: currentUser.email, password: curPw,
      })
      if (signInErr) { setMsg('❌ 현재 비밀번호가 맞지 않아요.'); return }
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
      <Link href="/dashboard" className="back-btn">← 대시보드로 돌아가기</Link>
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
            <a href={currentUser.blog_url} target="_blank" rel="noreferrer" className={styles.infoBadge}>
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

      {/* 탭 */}
      <div className={styles.tabBar}>
        <button
          className={`${styles.tabBtn} ${tab === 'pw' ? styles.tabBtnActive : ''}`}
          onClick={() => setTab('pw')}
        >
          🔒 비밀번호 변경
        </button>
        <button
          className={`${styles.tabBtn} ${tab === 'history' ? styles.tabBtnActive : ''}`}
          onClick={() => setTab('history')}
        >
          ⭐ 포인트 내역
        </button>
      </div>

      {/* 비밀번호 변경 탭 */}
      {tab === 'pw' && (
        <div className={styles.pwCard}>
          <h2 className={styles.cardTitle}>🔒 비밀번호 변경</h2>
          <p className={styles.cardDesc}>보안을 위해 비밀번호를 주기적으로 바꿔주세요 😊</p>
          <form onSubmit={handleChangePw} className={styles.form}>
            <label className={styles.label}>
              현재 비밀번호
              <div className={styles.pwWrap}>
                <input className={styles.input} type={showCur ? 'text' : 'password'}
                  placeholder="현재 비밀번호를 입력해 주세요"
                  value={curPw} onChange={e => setCurPw(e.target.value)}
                  autoComplete="current-password"/>
                <button type="button" className={styles.eyeBtn} onClick={() => setShowCur(v => !v)}>
                  {showCur ? '🙈' : '👁️'}
                </button>
              </div>
            </label>
            <label className={styles.label}>
              새 비밀번호
              <div className={styles.pwWrap}>
                <input className={styles.input} type={showNew ? 'text' : 'password'}
                  placeholder="새 비밀번호 (8자리 이상)"
                  value={newPw} onChange={e => setNewPw(e.target.value)}
                  autoComplete="new-password"/>
                <button type="button" className={styles.eyeBtn} onClick={() => setShowNew(v => !v)}>
                  {showNew ? '🙈' : '👁️'}
                </button>
              </div>
              <span className={styles.hint}>숫자와 영문자를 섞어 8자리 이상 입력해 주세요</span>
            </label>
            <label className={styles.label}>
              새 비밀번호 확인
              <input className={styles.input} type="password"
                placeholder="새 비밀번호를 한 번 더 입력해 주세요"
                value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                autoComplete="new-password"/>
            </label>
            {msg && (
              <div className={msg.startsWith('✅') ? styles.msgOk : styles.msgErr}>{msg}</div>
            )}
            <button className={styles.submitBtn} type="submit" disabled={loading}>
              {loading ? '변경 중...' : '🔑 비밀번호 변경하기'}
            </button>
          </form>
        </div>
      )}

      {/* 포인트 내역 탭 */}
      {tab === 'history' && (
        <div className={styles.historyCard}>
          <div className={styles.historyHeader}>
            <h2 className={styles.cardTitle}>⭐ 포인트 내역</h2>
            <div className={styles.historyLegend}>
              <span className={styles.legendEarn}>✅ 적립</span>
              <span className={styles.legendPending}>⏳ 승인 대기</span>
              <span className={styles.legendSpend}>💸 사용</span>
            </div>
          </div>
          <PointHistory userId={currentUser.id} />
        </div>
      )}
    </div>
  )
}
