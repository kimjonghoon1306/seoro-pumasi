import { useEffect, useState, useCallback } from 'react'
import { useLocation } from 'wouter'
import { supabase } from '../lib/supabase'
import { useTheme } from '../lib/theme'
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
  pending: number; approved: number; rejected: number
}
interface SiteStats {
  users: number; missions: number; completions: number; activeMissions: number; approvalRate: number; participationRate: number
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
  const [, setLocation]   = useLocation()
  const { theme, toggleTheme } = useTheme()

  const [rows, setRows]         = useState<CompletionRow[]>([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState<Tab>('pending')
  const [stats, setStats]       = useState<Stats>({ pending: 0, approved: 0, rejected: 0 })
  const [siteStats, setSiteStats] = useState<SiteStats>({ users: 0, missions: 0, completions: 0, activeMissions: 0, approvalRate: 0, participationRate: 0 })
  const [siteLoading, setSiteLoading] = useState(false)

  // 비밀번호 변경
  const [newPw, setNewPw]           = useState('')
  const [confirmPw, setConfirmPw]   = useState('')
  const [showNewPw, setShowNewPw]   = useState(false)
  const [showConfPw, setShowConfPw] = useState(false)
  const [pwMsg, setPwMsg]           = useState('')
  const [pwLoading, setPwLoading]   = useState(false)

  // 확인 다이얼로그
  const [confirmAction, setConfirmAction] = useState<{
    row: CompletionRow; type: 'approve' | 'reject'
  } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedIds, setSelectedIds]     = useState<Set<string>>(new Set())

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

  /* 사이트 전체 현황 */
  const loadSiteStats = useCallback(async () => {
    setSiteLoading(true)
    try {
      const [u, m, c, active, approved] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('missions').select('*', { count: 'exact', head: true }),
        supabase.from('completions').select('*', { count: 'exact', head: true }),
        supabase.from('missions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('completions').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      ])
      const users = u.count ?? 0
      const completions = c.count ?? 0
      setSiteStats({
        users,
        missions:    m.count ?? 0,
        completions,
        activeMissions: active.count ?? 0,
        approvalRate: completions ? Math.round(((approved.count ?? 0) / completions) * 100) : 0,
        participationRate: users ? Math.round((completions / users) * 10) / 10 : 0,
      })
    } finally {
      setSiteLoading(false)
    }
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
    } catch { setRows([]) }
    finally  { setLoading(false) }
  }, [tab])

  useEffect(() => { loadStats() }, [loadStats])
  useEffect(() => { loadData(); setSelectedIds(new Set()) }, [loadData])
  useEffect(() => {
    if (tab === 'settings') loadSiteStats()
  }, [tab, loadSiteStats])

  /* 승인 */
  async function doApprove(row: CompletionRow) {
    setActionLoading(true)
    try {
      await supabase.from('completions').update({ status: 'approved' }).eq('id', row.id)
      if (row.users && row.missions) {
        await supabase
          .from('users')
          .update({ points: row.users.points + row.missions.points })
          .eq('id', row.user_id)
      }
      setConfirmAction(null)
      loadData(); loadStats()
    } finally { setActionLoading(false) }
  }

  /* 반려 */
  async function doReject(row: CompletionRow) {
    setActionLoading(true)
    try {
      await supabase.from('completions').update({ status: 'rejected' }).eq('id', row.id)
      setConfirmAction(null)
      loadData(); loadStats()
    } finally { setActionLoading(false) }
  }


  /* 체크박스 토글 */
  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  function toggleAll() {
    if (selectedIds.size === rows.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(rows.map(r => r.id)))
  }

  /* 일괄 승인 */
  async function bulkApprove() {
    if (selectedIds.size === 0) return
    setActionLoading(true)
    try {
      const targets = rows.filter(r => selectedIds.has(r.id))
      await Promise.all(targets.map(async row => {
        await supabase.from('completions').update({ status: 'approved' }).eq('id', row.id)
        if (row.users && row.missions) {
          await supabase.from('users')
            .update({ points: row.users.points + row.missions.points })
            .eq('id', row.user_id)
        }
      }))
      setSelectedIds(new Set())
      loadData(); loadStats()
    } finally { setActionLoading(false) }
  }

  /* 일괄 반려 */
  async function bulkReject() {
    if (selectedIds.size === 0) return
    setActionLoading(true)
    try {
      const ids = Array.from(selectedIds)
      await supabase.from('completions').update({ status: 'rejected' }).in('id', ids)
      setSelectedIds(new Set())
      loadData(); loadStats()
    } finally { setActionLoading(false) }
  }

  /* 비밀번호 변경 */
  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwMsg('')
    if (newPw.length < 4)    { setPwMsg('❌ 비밀번호는 4자리 이상이어야 해요.'); return }
    if (newPw !== confirmPw) { setPwMsg('❌ 비밀번호가 일치하지 않아요.'); return }
    setPwLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPw })
      if (error) throw error
      setPwMsg('✅ 비밀번호가 변경됐어요!')
      setNewPw(''); setConfirmPw('')
    } catch { setPwMsg('❌ 변경 중 문제가 생겼어요.') }
    finally  { setPwLoading(false) }
  }

  /* 로그아웃 */
  function logout() {
    sessionStorage.removeItem('admin_auth')
    supabase.auth.signOut()
    setLocation('/admin-login')
  }

  const TABS = [
    { key: 'pending'  as Tab, label: '승인 대기', emoji: '⏳', count: stats.pending  },
    { key: 'approved' as Tab, label: '승인 완료', emoji: '✅', count: stats.approved },
    { key: 'rejected' as Tab, label: '반려됨',    emoji: '❌', count: stats.rejected },
    { key: 'settings' as Tab, label: '설정',      emoji: '⚙️', count: 0             },
  ]
  const currentTab = TABS.find(t => t.key === tab)!

  return (
    <div className={styles.root}>

      {/* ── 사이드바 ── */}
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

          {/* 테마 토글 */}
          <button className={styles.sideThemeBtn} onClick={toggleTheme}>
            <span>{theme === 'light' ? '🌙' : '☀️'}</span>
            <span>{theme === 'light' ? '다크 모드' : '라이트 모드'}</span>
          </button>

          {/* 운영 팁 */}
          <div className={styles.sideTip}>
            <div className={styles.sideTipTitle}>💡 운영 팁</div>
            <ul className={styles.sideTipList}>
              <li>스크린샷 클릭하면 크게 볼 수 있어요</li>
              <li>승인 전 반드시 확인해 주세요</li>
              <li>반려 시 재신청 가능해요</li>
            </ul>
          </div>
        </div>

        <div className={styles.sideBottom}>
          <a href="/dashboard" className={styles.dashLink} target="_blank" rel="noreferrer">
            👥 회원 대시보드 열기
          </a>
          <button className={styles.logoutBtn} onClick={logout}>
            🚪 로그아웃
          </button>
        </div>
      </aside>

      {/* ── 모바일 상단 바 ── */}
      <div className={styles.mobileTopBar}>
        <span className={styles.mobileTopTitle}>⚙️ 관리자 패널</span>
        <div className={styles.mobileTopRight}>
          {stats.pending > 0 && (
            <span className={styles.mobilePendingBadge}>대기 {stats.pending}</span>
          )}
          {/* 테마 버튼 */}
          <button className={styles.mobileThemeBtn} onClick={toggleTheme} aria-label="테마 전환">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <a href="/dashboard" className={styles.mobileDashBtn}>👥</a>
          <button className={styles.mobileLogoutBtn} onClick={logout}>나가기</button>
        </div>
      </div>

      {/* ── 메인 콘텐츠 ── */}
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
              <button className={styles.refreshBtn} onClick={loadData}>🔄 새로고침</button>
            )}
          </div>

          {/* 일괄 처리 툴바 — pending 탭 + 항목 있을 때만 */}
          {tab === 'pending' && rows.length > 0 && (
            <div className={styles.bulkBar}>
              <label className={styles.bulkCheck}>
                <input
                  type="checkbox"
                  checked={selectedIds.size === rows.length && rows.length > 0}
                  onChange={toggleAll}
                />
                <span>전체 선택 ({selectedIds.size}/{rows.length})</span>
              </label>
              {selectedIds.size > 0 && (
                <div className={styles.bulkActions}>
                  <span className={styles.bulkCount}>{selectedIds.size}건 선택됨</span>
                  <button
                    className={styles.bulkRejectBtn}
                    onClick={bulkReject}
                    disabled={actionLoading}
                  >
                    ❌ 선택 반려
                  </button>
                  <button
                    className={styles.bulkApproveBtn}
                    onClick={bulkApprove}
                    disabled={actionLoading}
                  >
                    ✅ 선택 승인
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── 설정 탭 ── */}
          {tab === 'settings' && (
            <div className={styles.settingsGrid}>

              {/* 비밀번호 변경 */}
              <div className={styles.settingsCard}>
                <h2 className={styles.settingsTitle}>🔑 관리자 비밀번호 변경</h2>
                <form onSubmit={changePassword} className={styles.settingsForm}>
                  <label className={styles.formLabel}>
                    새 비밀번호
                    <div className={styles.pwWrap}>
                      <input className={styles.formInput} type={showNewPw ? 'text' : 'password'}
                        value={newPw} onChange={e => setNewPw(e.target.value)}
                        placeholder="새 비밀번호 (4자리 이상)" />
                      <button type="button" className={styles.eyeBtn}
                        onClick={() => setShowNewPw(v => !v)}>
                        {showNewPw ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </label>
                  <label className={styles.formLabel}>
                    비밀번호 확인
                    <div className={styles.pwWrap}>
                      <input className={styles.formInput} type={showConfPw ? 'text' : 'password'}
                        value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                        placeholder="비밀번호 다시 입력" />
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

              {/* 사이트 전체 현황 */}
              <div className={styles.settingsCard}>
                <div className={styles.settingsCardHeader}>
                  <h2 className={styles.settingsTitle}>📊 사이트 전체 현황</h2>
                  <button className={styles.reloadBtn} onClick={loadSiteStats}>🔄</button>
                </div>
                {siteLoading ? (
                  <div className={styles.siteStatsLoading}>⏳ 불러오는 중...</div>
                ) : (
                  <div className={styles.siteStatsGrid}>
                    <div className={styles.siteStatCard}>
                      <span className={styles.siteStatEmoji}>👥</span>
                      <span className={styles.siteStatNum}>{siteStats.users.toLocaleString()}</span>
                      <span className={styles.siteStatLab}>전체 회원</span>
                    </div>
                    <div className={styles.siteStatCard}>
                      <span className={styles.siteStatEmoji}>📋</span>
                      <span className={styles.siteStatNum}>{siteStats.missions.toLocaleString()}</span>
                      <span className={styles.siteStatLab}>전체 미션</span>
                    </div>
                    <div className={styles.siteStatCard}>
                      <span className={styles.siteStatEmoji}>🚀</span>
                      <span className={styles.siteStatNum}>{siteStats.activeMissions.toLocaleString()}</span>
                      <span className={styles.siteStatLab}>활성 미션</span>
                    </div>
                    <div className={styles.siteStatCard} style={{ '--sc': 'var(--gold)' } as React.CSSProperties}>
                      <span className={styles.siteStatEmoji}>⏳</span>
                      <span className={styles.siteStatNum} style={{ color: 'var(--gold)' }}>{stats.pending}</span>
                      <span className={styles.siteStatLab}>승인 대기</span>
                    </div>
                    <div className={styles.siteStatCard}>
                      <span className={styles.siteStatEmoji}>📈</span>
                      <span className={styles.siteStatNum} style={{ color: 'var(--g400)' }}>{siteStats.approvalRate}%</span>
                      <span className={styles.siteStatLab}>인증 승인율</span>
                    </div>
                    <div className={styles.siteStatCard}>
                      <span className={styles.siteStatEmoji}>🔁</span>
                      <span className={styles.siteStatNum} style={{ color: 'var(--pink)' }}>{siteStats.participationRate}</span>
                      <span className={styles.siteStatLab}>회원당 평균 참여</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 테마 설정 */}
              <div className={styles.settingsCard}>
                <h2 className={styles.settingsTitle}>🎨 화면 설정</h2>
                <div className={styles.themeToggleWrap}>
                  <div className={styles.themeToggleInfo}>
                    <span className={styles.themeToggleIcon}>{theme === 'light' ? '☀️' : '🌙'}</span>
                    <div>
                      <div className={styles.themeToggleName}>
                        {theme === 'light' ? '라이트 모드' : '다크 모드'}
                      </div>
                      <div className={styles.themeToggleDesc}>
                        {theme === 'light' ? '밝은 화면으로 보고 있어요' : '어두운 화면으로 보고 있어요'}
                      </div>
                    </div>
                  </div>
                  <button className={styles.themeToggleBtn} onClick={toggleTheme}>
                    {theme === 'light' ? '🌙 어둡게' : '☀️ 밝게'}
                  </button>
                </div>
              </div>

              {/* 운영 가이드 */}
              <div className={styles.settingsCard}>
                <h2 className={styles.settingsTitle}>📋 운영 가이드</h2>
                <div className={styles.guideList}>
                  {[
                    { icon: '✅', title: '승인 기준', desc: '스크린샷에 실제 활동(이웃 추가·공감·댓글)이 명확히 보일 때 승인해 주세요.' },
                    { icon: '❌', title: '반려 기준', desc: '스크린샷이 흐리거나 활동 내용이 불분명하거나 타 블로그 캡처일 경우 반려해 주세요.' },
                    { icon: '⏳', title: '처리 기한', desc: '인증 신청 후 48시간 이내에 처리하는 것을 권장해요.' },
                    { icon: '🔑', title: '보안', desc: '비밀번호는 주기적으로 변경하고 외부에 공유하지 마세요.' },
                  ].map((g, i) => (
                    <div key={i} className={styles.guideItem}>
                      <span className={styles.guideItemIcon}>{g.icon}</span>
                      <div>
                        <div className={styles.guideItemTitle}>{g.title}</div>
                        <div className={styles.guideItemDesc}>{g.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ── 목록 탭 ── */}
          {tab !== 'settings' && (
            loading ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIllustration}>
                  <div className={styles.emptyIllustCircle}>⏳</div>
                </div>
                <p className={styles.emptyText}>불러오는 중...</p>
              </div>
            ) : rows.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIllustration}>
                  <div className={styles.emptyIllustCircle}>
                    {tab === 'pending' ? '🌿' : tab === 'approved' ? '🌳' : '🌱'}
                  </div>
                  <div className={styles.emptyDots}>
                    <span/><span/><span/>
                  </div>
                </div>
                <p className={styles.emptyText}>
                  {tab === 'pending'  && '대기 중인 인증이 없어요'}
                  {tab === 'approved' && '승인 완료된 인증이 없어요'}
                  {tab === 'rejected' && '반려된 인증이 없어요'}
                </p>
                <p className={styles.emptyHint}>
                  {tab === 'pending' && '새 인증이 들어오면 여기에 표시돼요'}
                  {tab === 'approved' && '승인한 인증 목록이 여기에 쌓여요'}
                  {tab === 'rejected' && '반려한 인증 목록이 여기에 쌓여요'}
                </p>
                <div className={styles.emptyStats}>
                  <div className={styles.emptyStatItem}>
                    <span>⏳ 대기</span><strong>{stats.pending}</strong>
                  </div>
                  <div className={styles.emptyStatItem}>
                    <span>✅ 승인</span><strong style={{ color: 'var(--g400)' }}>{stats.approved}</strong>
                  </div>
                  <div className={styles.emptyStatItem}>
                    <span>❌ 반려</span><strong style={{ color: 'var(--pink)' }}>{stats.rejected}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.cardList}>
                {rows.map(row => (
                  <div key={row.id} className={`${styles.card} ${tab === 'pending' && selectedIds.has(row.id) ? styles.cardSelected : ''}`}>
                    {tab === 'pending' && (
                      <label className={styles.cardCheckbox}>
                        <input type="checkbox"
                          checked={selectedIds.has(row.id)}
                          onChange={() => toggleSelect(row.id)}/>
                        <span className={styles.cardCheckLabel}>선택</span>
                      </label>
                    )}
                    <div className={styles.cardHeader}>
                      <div className={styles.cardMeta}>
                        <span className={styles.typeTag}>
                          {TYPE_LABEL[row.missions?.type || ''] || '알 수 없음'}
                        </span>
                        <div className={styles.userRow}>
                          <span className={styles.nickname}>👤 {row.users?.nickname || '알 수 없음'}</span>
                          <span className={styles.date}>{formatDate(row.created_at)}</span>
                        </div>
                        <span className={styles.blogUrl}>📝 {row.missions?.blog_url}</span>
                      </div>
                      <div className={styles.cardRight}>
                        <span className={styles.pointBadge}>⭐ {row.missions?.points ?? 0}P</span>
                        {tab === 'approved' && (
                          <span className={styles.statusChip} data-status="approved">✅ 승인</span>
                        )}
                        {tab === 'rejected' && (
                          <span className={styles.statusChip} data-status="rejected">❌ 반려</span>
                        )}
                      </div>
                    </div>

                    <a href={row.screenshot_url} target="_blank" rel="noreferrer"
                      className={styles.screenshotLink}>
                      <img src={row.screenshot_url} alt="인증 스크린샷"
                        className={styles.screenshot} loading="lazy" />
                      <div className={styles.screenshotOverlay}>🔍 크게 보기</div>
                    </a>

                    {tab === 'pending' && (
                      <div className={styles.actionRow}>
                        <button className={styles.rejectBtn}
                          onClick={() => setConfirmAction({ row, type: 'reject' })}>
                          ❌ 반려하기
                        </button>
                        <button className={styles.approveBtn}
                          onClick={() => setConfirmAction({ row, type: 'approve' })}>
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

      {/* ── 모바일 하단 탭바 ── */}
      <div className={styles.mobileTabBar}>
        {TABS.map(t => (
          <button key={t.key}
            className={`${styles.mobileTab} ${tab === t.key ? styles.mobileTabActive : ''}`}
            onClick={() => setTab(t.key)}>
            <span className={styles.mobileTabEmoji}>{t.emoji}</span>
            <span className={styles.mobileTabLabel}>{t.label}</span>
            {t.count > 0 && <span className={styles.mobileBadge}>{t.count}</span>}
          </button>
        ))}
      </div>

      {/* ── 확인 다이얼로그 ── */}
      {confirmAction && (
        <div className={styles.overlay} onClick={() => !actionLoading && setConfirmAction(null)}>
          <div className={styles.dialog} onClick={e => e.stopPropagation()}>
            <div className={styles.dialogIcon}>
              {confirmAction.type === 'approve' ? '✅' : '❌'}
            </div>
            <h3 className={styles.dialogTitle}>
              {confirmAction.type === 'approve' ? '승인하시겠어요?' : '반려하시겠어요?'}
            </h3>
            <div className={styles.dialogInfo}>
              <span className={styles.dialogUser}>👤 {confirmAction.row.users?.nickname}</span>
              {confirmAction.type === 'approve' && (
                <span className={styles.dialogPoints}>⭐ {confirmAction.row.missions?.points}P 지급</span>
              )}
            </div>
            <p className={styles.dialogDesc}>
              {confirmAction.type === 'approve'
                ? '승인하면 포인트가 즉시 지급돼요.'
                : '반려하면 취소할 수 없어요.'}
            </p>
            <div className={styles.dialogBtns}>
              <button className={styles.dialogCancel}
                onClick={() => setConfirmAction(null)} disabled={actionLoading}>
                취소
              </button>
              <button
                className={confirmAction.type === 'approve' ? styles.dialogApprove : styles.dialogReject}
                onClick={() => confirmAction.type === 'approve'
                  ? doApprove(confirmAction.row) : doReject(confirmAction.row)}
                disabled={actionLoading}>
                {actionLoading ? '처리 중...'
                  : confirmAction.type === 'approve' ? '✅ 승인하기' : '❌ 반려하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
