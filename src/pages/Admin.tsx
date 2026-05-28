import { useEffect, useState, useCallback } from 'react'
import { useLocation } from 'wouter'
import { supabase } from '../lib/supabase'
import styles from './Admin.module.css'

/* ── 타입 ── */
interface CompletionRow {
  id: string
  mission_id: string
  user_id: string
  screenshot_url: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  missions: { blog_url: string; type: string; points: number } | null
  users:    { nickname: string; points: number } | null
}

interface Stats {
  pending:  number
  approved: number
  rejected: number
}

type Tab = 'pending' | 'approved' | 'rejected' | 'settings'

const TYPE_LABEL: Record<string, string> = {
  neighbor: '🤝 서로이웃',
  like:     '💛 공감',
  comment:  '💬 댓글',
}

function formatDate(d: string) {
  const dt = new Date(d)
  return `${dt.getMonth()+1}/${dt.getDate()} ${dt.getHours()}:${String(dt.getMinutes()).padStart(2,'0')}`
}

/* ── 컴포넌트 ── */
export default function Admin() {
  const [, setLocation] = useLocation()

  const [rows, setRows]     = useState<CompletionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]       = useState<Tab>('pending')
  const [stats, setStats]   = useState<Stats>({ pending: 0, approved: 0, rejected: 0 })

  // 비밀번호 변경
  const [newPw, setNewPw]         = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfPw, setShowConfPw] = useState(false)
  const [pwMsg, setPwMsg]         = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  // 확인 다이얼로그
  const [confirmAction, setConfirmAction] = useState<{
    row: CompletionRow; type: 'approve' | 'reject'
  } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  /* 인증 확인 */
  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') !== 'true') {
      setLocation('/admin-login')
    }
  }, [setLocation])

  /* 통계 로드 */
  const loadStats = useCallback(async () => {
    const statuses: Array<'pending' | 'approved' | 'rejected'> = ['pending', 'approved', 'rejected']
    const results = await Promise.all(
      statuses.map(s =>
        supabase.from('completions').select('*', { count: 'exact', head: true }).eq('status', s)
      )
    )
    setStats({
      pending:  results[0].count ?? 0,
      approved: results[1].count ?? 0,
      rejected: results[2].count ?? 0,
    })
  }, [])

  /* 목록 로드 */
  const loadData = useCallback(async () => {
    if (tab === 'settings') return
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
  }, [tab])

  useEffect(() => { loadStats() }, [loadStats])
  useEffect(() => { loadData()  }, [loadData])

  /* 승인 */
  async function doApprove(row: CompletionRow) {
    setActionLoading(true)
    try {
      await supabase.from('completions').update({ status: 'approved' }).eq('id', row.id)
      // ★ 포인트 지급
      if (row.users && row.missions) {
        await supabase
          .from('users')
          .update({ points: row.users.points + row.missions.points })
          .eq('id', row.user_id)
      }
      setConfirmAction(null)
      loadData()
      loadStats()
    } finally {
      setActionLoading(false)
    }
  }

  /* 반려 */
  async function doReject(row: CompletionRow) {
    setActionLoading(true)
    try {
      await supabase.from('completions').update({ status: 'rejected' }).eq('id', row.id)
      setConfirmAction(null)
      loadData()
      loadStats()
    } finally {
      setActionLoading(false)
    }
  }

  /* 비밀번호 변경 */
  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwMsg('')
    if (newPw.length < 4)   { setPwMsg('❌ 비밀번호는 4자리 이상이어야 해요.'); return }
    if (newPw !== confirmPw) { setPwMsg('❌ 비밀번호가 일치하지 않아요.'); return }
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

  /* 로그아웃 */
  function logout() {
    sessionStorage.removeItem('admin_auth')
    supabase.auth.signOut()
    setLocation('/admin-login')
  }

  /* 탭 정의 */
  const TABS = [
    { key: 'pending'  as Tab, label: '승인 대기', emoji: '⏳', count: stats.pending  },
    { key: 'approved' as Tab, label: '승인 완료', emoji: '✅', count: stats.approved },
    { key: 'rejected' as Tab, label: '반려됨',    emoji: '❌', count: stats.rejected },
    { key: 'settings' as Tab, label: '설정',      emoji: '⚙️', count: 0             },
  ]

  const currentTab = TABS.find(t => t.key === tab)!

  /* ── 렌더 ── */
  return (
    <div className={styles.root}>

      {/* ─────────── 사이드바 (데스크탑) ─────────── */}
      <aside className={styles.sidebar}>
        <div className={styles.sideTop}>
          {/* 브랜드 */}
          <div className={styles.brand}>
            <div className={styles.brandIconWrap}>⚙️</div>
            <div>
              <div className={styles.brandName}>관리자 패널</div>
              <div className={styles.brandSub}>서로품앗이</div>
            </div>
          </div>

          {/* 통계 요약 */}
          <div className={styles.statSummary}>
            <div className={styles.statItem}>
              <span className={styles.statNum} style={{ color: '#f5c842' }}>{stats.pending}</span>
              <span className={styles.statLab}>대기</span>
            </div>
            <div className={styles.statDivider}/>
            <div className={styles.statItem}>
              <span className={styles.statNum} style={{ color: '#4cc87a' }}>{stats.approved}</span>
              <span className={styles.statLab}>승인</span>
            </div>
            <div className={styles.statDivider}/>
            <div className={styles.statItem}>
              <span className={styles.statNum} style={{ color: '#e8528a' }}>{stats.rejected}</span>
              <span className={styles.statLab}>반려</span>
            </div>
          </div>

          {/* 탭 네비 */}
          <nav className={styles.sideNav}>
            {TABS.map(t => (
              <button
                key={t.key}
                className={`${styles.sideBtn} ${tab === t.key ? styles.sideBtnActive : ''}`}
                onClick={() => setTab(t.key)}
              >
                <span className={styles.sideBtnEmoji}>{t.emoji}</span>
                <span className={styles.sideBtnLabel}>{t.label}</span>
                {t.count > 0 && (
                  <span className={`${styles.badge} ${t.key === 'pending' ? styles.badgePink : styles.badgeGray}`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className={styles.sideBottom}>
          <a
            href="/dashboard"
            className={styles.dashLink}
            target="_blank"
            rel="noreferrer"
          >
            👥 회원 대시보드 열기
          </a>
          <button className={styles.logoutBtn} onClick={logout}>
            🚪 로그아웃
          </button>
        </div>
      </aside>

      {/* ─────────── 모바일 상단 바 ─────────── */}
      <div className={styles.mobileTopBar}>
        <span className={styles.mobileTopTitle}>⚙️ 관리자 패널</span>
        <div className={styles.mobileTopRight}>
          {stats.pending > 0 && (
            <span className={styles.mobilePendingBadge}>대기 {stats.pending}</span>
          )}
          <a href="/dashboard" className={styles.mobileDashBtn}>👥</a>
          <button className={styles.mobileLogoutBtn} onClick={logout}>나가기</button>
        </div>
      </div>

      {/* ─────────── 메인 콘텐츠 ─────────── */}
      <main className={styles.main}>
        <div className={styles.content}>

          {/* 콘텐츠 헤더 */}
          <div className={styles.contentHeader}>
            <div>
              <h1 className={styles.contentTitle}>
                {currentTab.emoji} {currentTab.label}
              </h1>
              {tab !== 'settings' && (
                <p className={styles.contentSub}>
                  {tab === 'pending'  && `${rows.length}건 처리 대기 중`}
                  {tab === 'approved' && `${rows.length}건 승인 완료`}
                  {tab === 'rejected' && `${rows.length}건 반려됨`}
                </p>
              )}
            </div>
            {tab !== 'settings' && (
              <button className={styles.refreshBtn} onClick={loadData}>
                🔄 새로고침
              </button>
            )}
          </div>

          {/* ── 설정 탭 ── */}
          {tab === 'settings' && (
            <div className={styles.settingsWrap}>
              <div className={styles.settingsCard}>
                <h2 className={styles.settingsTitle}>🔑 관리자 비밀번호 변경</h2>
                <form onSubmit={changePassword} className={styles.settingsForm}>
                  <label className={styles.formLabel}>
                    새 비밀번호
                    <div className={styles.pwWrap}>
                      <input
                        className={styles.formInput}
                        type={showNewPw ? 'text' : 'password'}
                        value={newPw}
                        onChange={e => setNewPw(e.target.value)}
                        placeholder="새 비밀번호 (4자리 이상)"
                      />
                      <button type="button" className={styles.eyeBtn}
                        onClick={() => setShowNewPw(v => !v)}>
                        {showNewPw ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </label>
                  <label className={styles.formLabel}>
                    비밀번호 확인
                    <div className={styles.pwWrap}>
                      <input
                        className={styles.formInput}
                        type={showConfPw ? 'text' : 'password'}
                        value={confirmPw}
                        onChange={e => setConfirmPw(e.target.value)}
                        placeholder="비밀번호 다시 입력"
                      />
                      <button type="button" className={styles.eyeBtn}
                        onClick={() => setShowConfPw(v => !v)}>
                        {showConfPw ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </label>
                  {pwMsg && (
                    <div className={pwMsg.startsWith('✅') ? styles.msgOk : styles.msgErr}>
                      {pwMsg}
                    </div>
                  )}
                  <button className={styles.settingsBtn} type="submit" disabled={pwLoading}>
                    {pwLoading ? '변경 중...' : '🔑 비밀번호 변경하기'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ── 목록 탭 ── */}
          {tab !== 'settings' && (
            loading ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyEmoji}>⏳</span>
                <p>불러오는 중...</p>
              </div>
            ) : rows.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyEmoji}>🙈</span>
                <p>해당 항목이 없어요</p>
                {tab === 'pending' && (
                  <span className={styles.emptyHint}>아직 승인 대기 중인 인증이 없어요</span>
                )}
              </div>
            ) : (
              <div className={styles.cardList}>
                {rows.map(row => (
                  <div key={row.id} className={styles.card}>

                    {/* 카드 헤더 */}
                    <div className={styles.cardHeader}>
                      <div className={styles.cardMeta}>
                        <span className={styles.typeTag}>
                          {TYPE_LABEL[row.missions?.type || ''] || '알 수 없음'}
                        </span>
                        <div className={styles.userRow}>
                          <span className={styles.nickname}>
                            👤 {row.users?.nickname || '알 수 없음'}
                          </span>
                          <span className={styles.date}>{formatDate(row.created_at)}</span>
                        </div>
                        <span className={styles.blogUrl}>
                          📝 {row.missions?.blog_url}
                        </span>
                      </div>
                      <div className={styles.cardRight}>
                        <span className={styles.pointBadge}>
                          ⭐ {row.missions?.points ?? 0}P
                        </span>
                        {tab === 'approved' && (
                          <span className={styles.statusChip} data-status="approved">✅ 승인</span>
                        )}
                        {tab === 'rejected' && (
                          <span className={styles.statusChip} data-status="rejected">❌ 반려</span>
                        )}
                      </div>
                    </div>

                    {/* 스크린샷 */}
                    <a
                      href={row.screenshot_url}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.screenshotLink}
                    >
                      <img
                        src={row.screenshot_url}
                        alt="인증 스크린샷"
                        className={styles.screenshot}
                        loading="lazy"
                      />
                      <div className={styles.screenshotOverlay}>
                        🔍 크게 보기
                      </div>
                    </a>

                    {/* 승인/반려 버튼 */}
                    {tab === 'pending' && (
                      <div className={styles.actionRow}>
                        <button
                          className={styles.rejectBtn}
                          onClick={() => setConfirmAction({ row, type: 'reject' })}
                        >
                          ❌ 반려하기
                        </button>
                        <button
                          className={styles.approveBtn}
                          onClick={() => setConfirmAction({ row, type: 'approve' })}
                        >
                          ✅ 승인하기
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </main>

      {/* ─────────── 모바일 하단 탭바 ─────────── */}
      <div className={styles.mobileTabBar}>
        {TABS.map(t => (
          <button
            key={t.key}
            className={`${styles.mobileTab} ${tab === t.key ? styles.mobileTabActive : ''}`}
            onClick={() => setTab(t.key)}
          >
            <span className={styles.mobileTabEmoji}>{t.emoji}</span>
            <span className={styles.mobileTabLabel}>{t.label}</span>
            {t.count > 0 && (
              <span className={styles.mobileBadge}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ─────────── 확인 다이얼로그 ─────────── */}
      {confirmAction && (
        <div
          className={styles.overlay}
          onClick={() => !actionLoading && setConfirmAction(null)}
        >
          <div className={styles.dialog} onClick={e => e.stopPropagation()}>
            <div className={styles.dialogIcon}>
              {confirmAction.type === 'approve' ? '✅' : '❌'}
            </div>
            <h3 className={styles.dialogTitle}>
              {confirmAction.type === 'approve' ? '승인하시겠어요?' : '반려하시겠어요?'}
            </h3>
            <div className={styles.dialogInfo}>
              <span className={styles.dialogUser}>
                👤 {confirmAction.row.users?.nickname}
              </span>
              {confirmAction.type === 'approve' && (
                <span className={styles.dialogPoints}>
                  ⭐ {confirmAction.row.missions?.points}P 지급
                </span>
              )}
            </div>
            <p className={styles.dialogDesc}>
              {confirmAction.type === 'approve'
                ? '승인하면 포인트가 즉시 지급돼요.'
                : '반려하면 취소할 수 없어요.'}
            </p>
            <div className={styles.dialogBtns}>
              <button
                className={styles.dialogCancel}
                onClick={() => setConfirmAction(null)}
                disabled={actionLoading}
              >
                취소
              </button>
              <button
                className={
                  confirmAction.type === 'approve'
                    ? styles.dialogApprove
                    : styles.dialogReject
                }
                onClick={() =>
                  confirmAction.type === 'approve'
                    ? doApprove(confirmAction.row)
                    : doReject(confirmAction.row)
                }
                disabled={actionLoading}
              >
                {actionLoading
                  ? '처리 중...'
                  : confirmAction.type === 'approve'
                  ? '✅ 승인하기'
                  : '❌ 반려하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
