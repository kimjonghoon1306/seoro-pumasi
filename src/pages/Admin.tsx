import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
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

export default function Admin() {
  const [, setLocation] = useLocation()
  const [rows, setRows]       = useState<CompletionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState<'pending' | 'approved' | 'rejected'>('pending')

  // 관리자 인증 확인
  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') !== 'true') {
      setLocation('/admin-login')
    }
  }, [setLocation])

  useEffect(() => { loadData() }, [tab])

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
    try {
      await supabase.from('completions').update({ status: 'approved' }).eq('id', row.id)
      await loadData()
    } catch { /* 에러 무시 */ }
  }

  async function reject(row: CompletionRow) {
    try {
      // 상태 변경
      await supabase.from('completions').update({ status: 'rejected' }).eq('id', row.id)
      // 포인트 회수
      if (row.users && row.missions) {
        await supabase
          .from('users')
          .update({ points: Math.max(0, row.users.points - row.missions.points) })
          .eq('id', row.user_id)
      }
      await loadData()
    } catch { /* 에러 무시 */ }
  }

  function logout() {
    sessionStorage.removeItem('admin_auth')
    setLocation('/login')
  }

  return (
    <div className={styles.wrap}>

      {/* 헤더 */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>⚙️ 관리자 페이지</h1>
          <p className={styles.desc}>인증 승인 및 회원 관리</p>
        </div>
        <button className={styles.logoutBtn} onClick={logout}>로그아웃</button>
      </div>

      {/* 탭 */}
      <div className={styles.tabs}>
        {(['pending','approved','rejected'] as const).map(t => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'pending'  && '⏳ 승인 대기'}
            {t === 'approved' && '✅ 승인 완료'}
            {t === 'rejected' && '❌ 반려됨'}
          </button>
        ))}
      </div>

      {/* 목록 */}
      {loading ? (
        <div className={styles.center}>⏳ 불러오는 중...</div>
      ) : rows.length === 0 ? (
        <div className={styles.center}>
          <div style={{ fontSize: 48 }}>🙈</div>
          <p>해당 항목이 없어요</p>
        </div>
      ) : (
        <div className={styles.list}>
          {rows.map(row => (
            <div key={row.id} className={styles.card}>
              {/* 상단 정보 */}
              <div className={styles.cardTop}>
                <div className={styles.cardInfo}>
                  <span className={styles.missionType}>
                    {TYPE_LABEL[row.missions?.type || ''] || row.missions?.type}
                  </span>
                  <span className={styles.nickname}>
                    👤 {row.users?.nickname || '알 수 없음'}
                  </span>
                  <span className={styles.blogUrl}>
                    📝 {row.missions?.blog_url}
                  </span>
                  <span className={styles.date}>{formatDate(row.created_at)}</span>
                </div>
                <span className={styles.pointBadge}>
                  ⭐ {row.missions?.points}P
                </span>
              </div>

              {/* 스크린샷 */}
              <a href={row.screenshot_url} target="_blank" rel="noreferrer">
                <img
                  src={row.screenshot_url}
                  alt="인증 스크린샷"
                  className={styles.screenshot}
                />
              </a>
              <p className={styles.screenshotHint}>📷 이미지 클릭하면 크게 볼 수 있어요</p>

              {/* 버튼 */}
              {tab === 'pending' && (
                <div className={styles.btnRow}>
                  <button className={styles.approveBtn} onClick={() => approve(row)}>
                    ✅ 승인하기
                  </button>
                  <button className={styles.rejectBtn} onClick={() => reject(row)}>
                    ❌ 반려하기
                  </button>
                </div>
              )}
              {tab === 'approved' && <div className={styles.statusOk}>✅ 승인 완료</div>}
              {tab === 'rejected' && <div className={styles.statusNo}>❌ 반려됨 (포인트 회수됨)</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
