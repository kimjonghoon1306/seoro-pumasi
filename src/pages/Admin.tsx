import { useEffect, useState } from 'react'
import { useLocation, Link } from 'wouter'
import { supabase } from '../lib/supabase'
import styles from './Admin.module.css'

interface CompletionRow {
  id: string
  mission_id: string
  user_id: string
  screenshot_url: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  missions: { blog_url: string; type: string; points: number } | null
  users: { nickname: string; points: number } | null
}

const TYPE_LABEL: Record<string, string> = {
  neighbor: '🤝 서로이웃',
  like:     '💛 공감',
  comment:  '💬 댓글',
}

function formatDate(d: string) {
  const date = new Date(d)
  return `${date.getMonth()+1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2,'0')}`
}

type Tab = 'pending' | 'approved' | 'rejected' | 'settings'

export default function Admin() {
  const [, setLocation] = useLocation()
  const [rows, setRows]       = useState<CompletionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState<Tab>('pending')

  // 비밀번호 변경
  const [newPw, setNewPw]         = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwMsg, setPwMsg]         = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') !== 'true') {
      setLocation('/admin-login')
    }
  }, [setLocation])

  useEffect(() => {
    if (tab !== 'settings') loadData()
  }, [tab])

  async function loadData() {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('completions')
        .select('*, missions(blog_url, type, points), users(nickname, points)')
        .eq('status', tab)
        .order('created_at', { ascending: false })
      setRows((data as CompletionRow[]) || [])
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  async function approve(row: CompletionRow) {
    await supabase.from('completions').update({ status: 'approved' }).eq('id', row.id)
    loadData()
  }

  async function reject(row: CompletionRow) {
    await supabase.from('completions').update({ status: 'rejected' }).eq('id', row.id)
    if (row.users && row.missions) {
      await supabase
        .from('users')
        .update({ points: Math.max(0, row.users.points - row.missions.points) })
        .eq('id', row.user_id)
    }
    loadData()
  }

  async function changeAdminPassword(e: React.FormEvent) {
    e.preventDefault()
    setPwMsg('')
    if (newPw.length < 4)   { setPwMsg('❌ 새 비밀번호는 4자리 이상이어야 해요.'); return }
    if (newPw !== confirmPw) { setPwMsg('❌ 새 비밀번호가 서로 달라요.'); return }
    setPwLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPw })
      if (error) throw error
      setPwMsg('✅ 비밀번호가 변경됐어요!')
      setNewPw(''); setConfirmPw('')
    } catch {
      setPwMsg('❌ 변경 중 문제가 생겼어요.')
    } finally {
      setPwLoading(false)
    }
  }

  function logout() {
    sessionStorage.removeItem('admin_auth')
    supabase.auth.signOut()
    setLocation('/login')
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>⚙️ 관리자 페이지</h1>
          <p className={styles.desc}>인증 승인 및 설정 관리</p>
        </div>
        <Link href="/dashboard" className={styles.dashBtn}>회원 대시보드 →</Link>
        <button className={styles.logoutBtn} onClick={logout}>로그아웃</button>
      </div>

      <div className={styles.tabs}>
        {([
          { key: 'pending',  label: '⏳ 승인 대기' },
          { key: 'approved', label: '✅ 승인 완료' },
          { key: 'rejected', label: '❌ 반려됨' },
          { key: 'settings', label: '🔑 설정' },
        ] as { key: Tab; label: string }[]).map(t => (
          <button key={t.key} className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'settings' && (
        <div className={styles.settingsCard}>
          <h2 className={styles.settingsTitle}>🔑 관리자 비밀번호 변경</h2>
          <form onSubmit={changeAdminPassword} className={styles.settingsForm}>
            <label className={styles.label}>
              새 비밀번호
              <input className={styles.input} type="password" value={newPw}
                onChange={e => setNewPw(e.target.value)} placeholder="새 비밀번호 (4자리 이상)" />
            </label>
            <label className={styles.label}>
              새 비밀번호 확인
              <input className={styles.input} type="password" value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)} placeholder="새 비밀번호 다시 입력" />
            </label>
            {pwMsg && <div className={pwMsg.startsWith('✅') ? styles.msgOk : styles.msgErr}>{pwMsg}</div>}
            <button className={styles.settingsBtn} type="submit" disabled={pwLoading}>
              {pwLoading ? '변경 중...' : '🔑 비밀번호 변경하기'}
            </button>
          </form>
        </div>
      )}

      {tab !== 'settings' && (
        loading ? (
          <div className={styles.center}>⏳ 불러오는 중...</div>
        ) : rows.length === 0 ? (
          <div className={styles.center}><div style={{ fontSize: 48 }}>🙈</div><p>해당 항목이 없어요</p></div>
        ) : (
          <div className={styles.list}>
            {rows.map(row => (
              <div key={row.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.cardInfo}>
                    <span className={styles.missionType}>{TYPE_LABEL[row.missions?.type || '']}</span>
                    <span className={styles.nickname}>👤 {row.users?.nickname || '알 수 없음'}</span>
                    <span className={styles.blogUrl}>📝 {row.missions?.blog_url}</span>
                    <span className={styles.date}>{formatDate(row.created_at)}</span>
                  </div>
                  <span className={styles.pointBadge}>⭐ {row.missions?.points}P</span>
                </div>
                <a href={row.screenshot_url} target="_blank" rel="noreferrer">
                  <img src={row.screenshot_url} alt="인증 스크린샷" className={styles.screenshot} />
                </a>
                <p className={styles.screenshotHint}>📷 이미지 클릭하면 크게 볼 수 있어요</p>
                {tab === 'pending' && (
                  <div className={styles.btnRow}>
                    <button className={styles.approveBtn} onClick={() => approve(row)}>✅ 승인하기</button>
                    <button className={styles.rejectBtn}  onClick={() => reject(row)}>❌ 반려하기</button>
                  </div>
                )}
                {tab === 'approved' && <div className={styles.statusOk}>✅ 승인 완료</div>}
                {tab === 'rejected' && <div className={styles.statusNo}>❌ 반려됨</div>}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
