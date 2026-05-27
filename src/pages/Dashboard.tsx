import { Link } from 'wouter'
import { useAuth } from '../hooks/useAuth'
import { useMyMissions, useMyCompletions } from '../hooks/useMissions'
import { MISSION_EMOJI, MISSION_LABELS } from '../types'
import type { MissionType } from '../types'
import styles from './Dashboard.module.css'

// 포인트 → 등급
function getGrade(points: number) {
  if (points >= 1000) return { label: '🌳 숲',  color: '#1a6b45', desc: '최고 등급이에요! 대단해요!' }
  if (points >= 500)  return { label: '🌿 나무', color: '#2d9966', desc: '많은 이웃과 함께하고 있어요' }
  if (points >= 100)  return { label: '🌱 새싹', color: '#4caf50', desc: '잘 하고 계세요!' }
  return                     { label: '🌰 씨앗', color: '#8bc34a', desc: '이제 막 시작했어요. 화이팅!' }
}

// 날짜 한국어 표시
function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

export default function Dashboard() {
  const { user } = useAuth()
  const { missions } = useMyMissions(user?.id)
  const { completions } = useMyCompletions(user?.id)

  if (!user) return null

  const grade = getGrade(user.points)
  const activeMissions  = missions.filter(m => m.status === 'active')
  const doneMissions    = missions.filter(m => m.status === 'done')
  const approvedCount   = completions.filter(c => c.status === 'approved').length
  const pendingCount    = completions.filter(c => c.status === 'pending').length

  return (
    <div className={styles.wrap}>

      {/* ── 인사 + 포인트 배너 ── */}
      <div className={styles.banner}>
        <div className={styles.bannerLeft}>
          <p className={styles.bannerGreet}>안녕하세요, <strong>{user.nickname}</strong>님! 👋</p>
          <p className={styles.bannerBlog}>
            📝 내 블로그:{' '}
            <a href={user.blog_url} target="_blank" rel="noreferrer" className={styles.blogLink}>
              {user.blog_url}
            </a>
          </p>
          <div className={styles.gradeChip} style={{ background: grade.color }}>
            {grade.label} &nbsp;·&nbsp; {grade.desc}
          </div>
        </div>
        <div className={styles.bannerRight}>
          <div className={styles.pointBox}>
            <span className={styles.pointNum}>{user.points.toLocaleString()}</span>
            <span className={styles.pointLabel}>내 포인트</span>
          </div>
        </div>
      </div>

      {/* ── 빠른 행동 버튼 ── */}
      <div className={styles.quickBtns}>
        <Link href="/missions" className={`${styles.quickBtn} ${styles.qbGreen}`}>
          <span className={styles.qbEmoji}>📋</span>
          <span className={styles.qbTitle}>미션 수행하기</span>
          <span className={styles.qbDesc}>다른 분 블로그 방문하고 포인트 받기</span>
        </Link>
        <Link href="/register" className={`${styles.quickBtn} ${styles.qbYellow}`}>
          <span className={styles.qbEmoji}>✏️</span>
          <span className={styles.qbTitle}>미션 올리기</span>
          <span className={styles.qbDesc}>포인트 써서 내 블로그 이웃 늘리기</span>
        </Link>
      </div>

      {/* ── 내 활동 통계 ── */}
      <h2 className={styles.sectionTitle}>📊 내 활동 현황</h2>
      <div className={styles.statGrid}>
        <div className={`${styles.statCard} ${styles.scGreen}`}>
          <span className={styles.statEmoji}>✅</span>
          <span className={styles.statNum}>{approvedCount}</span>
          <span className={styles.statLabel}>완료한 미션</span>
        </div>
        <div className={`${styles.statCard} ${styles.scYellow}`}>
          <span className={styles.statEmoji}>⏳</span>
          <span className={styles.statNum}>{pendingCount}</span>
          <span className={styles.statLabel}>승인 기다리는 중</span>
        </div>
        <div className={`${styles.statCard} ${styles.scPink}`}>
          <span className={styles.statEmoji}>📌</span>
          <span className={styles.statNum}>{activeMissions.length}</span>
          <span className={styles.statLabel}>내가 올린 미션</span>
        </div>
        <div className={`${styles.statCard} ${styles.scGray}`}>
          <span className={styles.statEmoji}>🎉</span>
          <span className={styles.statNum}>{doneMissions.length}</span>
          <span className={styles.statLabel}>완료된 내 미션</span>
        </div>
      </div>

      {/* ── 내가 올린 미션 현황 ── */}
      <h2 className={styles.sectionTitle}>📌 내가 올린 미션</h2>
      {missions.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyEmoji}>🙈</span>
          <p>아직 올린 미션이 없어요</p>
          <Link href="/register" className={styles.emptyBtn}>✏️ 미션 올리러 가기</Link>
        </div>
      ) : (
        <div className={styles.missionList}>
          {missions.slice(0, 5).map(m => (
            <div key={m.id} className={styles.missionRow}>
              <span className={styles.missionEmoji}>{MISSION_EMOJI[m.type as MissionType]}</span>
              <div className={styles.missionInfo}>
                <span className={styles.missionType}>{MISSION_LABELS[m.type as MissionType]}</span>
                <span className={styles.missionDate}>{formatDate(m.created_at)}</span>
              </div>
              <div className={styles.missionProgress}>
                <span className={styles.progressText}>{m.done_count} / {m.total_count} 완료</span>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${(m.done_count / m.total_count) * 100}%` }}
                  />
                </div>
              </div>
              <span className={`${styles.statusBadge} ${m.status === 'active' ? styles.sbActive : styles.sbDone}`}>
                {m.status === 'active' ? '진행 중' : '완료'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── 최근 인증 내역 ── */}
      <h2 className={styles.sectionTitle}>🕐 최근 활동 내역</h2>
      {completions.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyEmoji}>👀</span>
          <p>아직 활동 내역이 없어요</p>
          <Link href="/missions" className={styles.emptyBtn}>📋 미션 수행하러 가기</Link>
        </div>
      ) : (
        <div className={styles.recentList}>
          {completions.map(c => (
            <div key={c.id} className={styles.recentRow}>
              <span className={`${styles.recentStatus} ${
                c.status === 'approved' ? styles.rsApproved :
                c.status === 'rejected' ? styles.rsRejected : styles.rsPending
              }`}>
                {c.status === 'approved' ? '✅ 승인됨' :
                 c.status === 'rejected' ? '❌ 반려됨' : '⏳ 확인 중'}
              </span>
              <span className={styles.recentDate}>{formatDate(c.created_at)}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── 포인트 안내 ── */}
      <div className={styles.pointGuide}>
        <h3 className={styles.guideTitle}>⭐ 포인트 안내</h3>
        <div className={styles.guideGrid}>
          <div className={styles.guideItem}>
            <span>🤝 서로이웃 추가해주면</span>
            <strong>+10 포인트</strong>
          </div>
          <div className={styles.guideItem}>
            <span>💛 공감 눌러주면</span>
            <strong>+3 포인트</strong>
          </div>
          <div className={styles.guideItem}>
            <span>💬 댓글 달아주면</span>
            <strong>+5 포인트</strong>
          </div>
        </div>
      </div>

    </div>
  )
}
