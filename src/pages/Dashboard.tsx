import { Link } from 'wouter'
import { useAuth } from '../hooks/useAuth'
import { useMyMissions, useMyCompletions } from '../hooks/useMissions'
import { MISSION_EMOJI, MISSION_LABELS } from '../types'
import type { Mission, Completion, MissionType } from '../types'
import { useState, useEffect } from 'react'
import styles from './Dashboard.module.css'

function getGrade(p: number) {
  if (p >= 1000) return { label: '🌳 숲',  desc: '최고 등급!' }
  if (p >= 500)  return { label: '🌿 나무', desc: '성장 중이에요' }
  if (p >= 100)  return { label: '🌱 새싹', desc: '잘 하고 계세요!' }
  return               { label: '🌰 씨앗', desc: '이제 시작해요!' }
}
function formatDate(d: string) {
  const date = new Date(d)
  return `${date.getMonth()+1}/${date.getDate()}`
}

/* ── 슬라이드 데이터 ── */
const SLIDES = [
  {
    emoji: '🌱',
    tag: '서로품앗이란?',
    title: '블로거들의\n품앗이 커뮤니티',
    desc: '서로 방문하고, 응원하며, 함께 성장하는\n네이버 블로거들의 따뜻한 공간이에요',
    bg: 'linear-gradient(135deg, #061a0e 0%, #0f3d20 50%, #1a6b45 100%)',
    accent: '#4cc87a',
  },
  {
    emoji: '🤝',
    tag: '서로이웃 품앗이',
    title: '이웃을 늘리는\n가장 따뜻한 방법',
    desc: '내가 이웃 추가하면 상대방도 추가해줘요\n진짜 관심 있는 이웃이 자연스럽게 생겨요',
    bg: 'linear-gradient(135deg, #0a2a16 0%, #155228 50%, #22a05a 100%)',
    accent: '#f5c842',
  },
  {
    emoji: '💛',
    tag: '공감 품앗이',
    title: '내 글이\n더 많은 사람에게',
    desc: '공감을 주고받으면 검색 노출이 높아져요\n서로의 글이 더 널리 퍼져나가요',
    bg: 'linear-gradient(135deg, #1a1a00 0%, #3d3000 50%, #7a6000 100%)',
    accent: '#f5c842',
  },
  {
    emoji: '💬',
    tag: '댓글 품앗이',
    title: '진심 어린 댓글로\n서로를 응원해요',
    desc: '30자 이상의 진심 어린 댓글을 달아주세요\n블로그가 더 활성화되고 함께 성장해요',
    bg: 'linear-gradient(135deg, #0d1a2e 0%, #1a3050 50%, #2a5080 100%)',
    accent: '#7eb8ff',
  },
  {
    emoji: '⭐',
    tag: '포인트 시스템',
    title: '활동할수록\n이웃이 늘어나요',
    desc: '서로이웃 +10P · 공감 +3P · 댓글 +5P\n모은 포인트로 내 미션을 올려 이웃을 늘려요',
    bg: 'linear-gradient(135deg, #1a0a00 0%, #3d2000 50%, #7a4000 100%)',
    accent: '#ff9f40',
  },
]

function CinematicSlider() {
  const [cur, setCur] = useState(0)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimating(true)
      setTimeout(() => {
        setCur(c => (c + 1) % SLIDES.length)
        setAnimating(false)
      }, 400)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  function goTo(i: number) {
    if (i === cur) return
    setAnimating(true)
    setTimeout(() => { setCur(i); setAnimating(false) }, 300)
  }

  const slide = SLIDES[cur]

  return (
    <div className={styles.slider}>
      <div
        className={`${styles.slide} ${animating ? styles.slideOut : styles.slideIn}`}
        style={{ background: slide.bg }}
      >
        {/* 배경 격자 패턴 */}
        <div className={styles.slideGrid}/>

        {/* 슬라이드 번호 */}
        <div className={styles.slideCount}>{cur + 1} / {SLIDES.length}</div>

        {/* 진행 바 */}
        <div className={styles.progressTrack}>
          <div
            className={styles.progressBar}
            style={{ background: slide.accent }}
            key={cur}
          />
        </div>

        {/* 콘텐츠 */}
        <div className={styles.slideContent}>
          <div className={styles.slideLeft}>
            <span className={styles.slideTag} style={{ color: slide.accent, borderColor: slide.accent + '40' }}>
              {slide.emoji} {slide.tag}
            </span>
            <h2 className={styles.slideTitle}>
              {slide.title.split('\n').map((line, i) => (
                <span key={i}>{line}{i < slide.title.split('\n').length - 1 && <br/>}</span>
              ))}
            </h2>
            <p className={styles.slideDesc}>
              {slide.desc.split('\n').map((line, i) => (
                <span key={i}>{line}{i < slide.desc.split('\n').length - 1 && <br/>}</span>
              ))}
            </p>
            <div className={styles.slideCta}>
              <Link href="/missions" className={styles.slideBtn} style={{ background: slide.accent, color: '#0a1a12' }}>
                미션 수행하기 →
              </Link>
            </div>
          </div>
          <div className={styles.slideRight}>
            <div className={styles.slideEmoji} style={{ borderColor: slide.accent + '30', background: slide.accent + '10' }}>
              {slide.emoji}
            </div>
          </div>
        </div>

        {/* 도트 네비 */}
        <div className={styles.dots}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === cur ? styles.dotActive : ''}`}
              style={i === cur ? { background: slide.accent } : {}}
              onClick={() => goTo(i)}
              aria-label={`슬라이드 ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── 메인 컴포넌트 ── */
export default function Dashboard() {
  const { user } = useAuth()
  const { missions }    = useMyMissions(user?.id)
  const { completions } = useMyCompletions(user?.id)

  if (!user) return null
  const currentUser = user

  const grade          = getGrade(currentUser.points)
  const activeMissions = missions.filter((m: Mission) => m.status === 'active')
  const doneMissions   = missions.filter((m: Mission) => m.status === 'done')
  const approvedCount  = completions.filter((c: Completion) => c.status === 'approved').length
  const pendingCount   = completions.filter((c: Completion) => c.status === 'pending').length

  return (
    <div className={styles.page}>

      {/* 배너 */}
      <div className={`${styles.banner} animate-fadeUp`}>
        <div className={styles.bannerBg}/>
        <div className={styles.bannerOrb}/>
        <div className={styles.bannerLeft}>
          <div className={styles.bannerGreet}>
            안녕하세요,&nbsp;
            <span className={styles.bannerName}>{currentUser.nickname}</span>님!
          </div>
          <p className={styles.bannerBlog}>
            📝&nbsp;
            <a href={currentUser.blog_url} target="_blank" rel="noreferrer" className={styles.bannerBlogLink}>
              {currentUser.blog_url}
            </a>
          </p>
          <div className={styles.bannerGrade}>
            <span className={styles.gradeLabel}>{grade.label}</span>
            <span>·</span>
            <span>{grade.desc}</span>
          </div>
        </div>
        <div className={styles.bannerRight}>
          <div className={styles.pointCircle}>
            <span className={styles.pointNum}>{currentUser.points.toLocaleString()}</span>
            <span className={styles.pointLabel}>포인트</span>
          </div>
          <Link href="/register" className={styles.bannerBtn}>미션 올리기 →</Link>
        </div>
      </div>

      {/* 빠른 버튼 */}
      <div className={`${styles.quickBtns} animate-fadeUp delay-100`}>
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

      {/* 통계 */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>📊 내 활동 현황</h2>
        </div>
        <div className={`${styles.statGrid} animate-fadeUp delay-200`}>
          {[
            { emoji: '✅', num: approvedCount,        label: '완료한 미션',    accent: 'var(--g500)' },
            { emoji: '⏳', num: pendingCount,          label: '승인 대기 중',   accent: 'var(--gold)' },
            { emoji: '📌', num: activeMissions.length, label: '내가 올린 미션', accent: 'var(--pink)' },
            { emoji: '🎉', num: doneMissions.length,   label: '완료된 내 미션', accent: 'var(--g400)' },
          ].map((s, i) => (
            <div key={i} className={styles.statCard} style={{ '--accent': s.accent } as React.CSSProperties}>
              <span className={styles.statEmoji}>{s.emoji}</span>
              <span className={styles.statNum}>{s.num}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 시네마틱 슬라이더 */}
      <CinematicSlider />

      {/* ── 2열 하단 레이아웃 ── */}
      <div className={styles.cols}>

        {/* 내가 올린 미션 */}
        <div className={`${styles.section} ${styles.colMain} reveal`}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>📌 내가 올린 미션</h2>
            <Link href="/register" className={styles.sectionMore}>+ 새 미션 올리기</Link>
          </div>
          {missions.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyEmoji}>🙈</span>
              <p>아직 올린 미션이 없어요</p>
              <Link href="/register" className={styles.emptyBtn}>✏️ 미션 올리러 가기</Link>
            </div>
          ) : (
            <div className={styles.missionList}>
              {missions.slice(0, 5).map((m: Mission) => (
                <div key={m.id} className={styles.missionRow}>
                  <span className={styles.missionEmoji}>{MISSION_EMOJI[m.type as MissionType]}</span>
                  <div className={styles.missionInfo}>
                    <span className={styles.missionType}>{MISSION_LABELS[m.type as MissionType]}</span>
                    <span className={styles.missionDate}>{formatDate(m.created_at)}</span>
                  </div>
                  <div className={styles.missionProgress}>
                    <span className={styles.progressText}>{m.done_count} / {m.total_count}</span>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${(m.done_count/m.total_count)*100}%` }}/>
                    </div>
                  </div>
                  <span className={`${styles.statusBadge} ${m.status==='active'?styles.sbActive:styles.sbDone}`}>
                    {m.status==='active'?'진행 중':'완료'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 오른쪽: 최근 활동 + 포인트 안내 */}
        <div className={styles.colSide}>
          <div className={`${styles.section} reveal`}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>🕐 최근 활동 내역</h2>
            </div>
            {completions.length === 0 ? (
              <div className={styles.empty}>
                <span className={styles.emptyEmoji}>👀</span>
                <p>아직 활동 내역이 없어요</p>
                <Link href="/missions" className={styles.emptyBtn}>📋 미션 수행하러 가기</Link>
              </div>
            ) : (
              <div className={styles.recentList}>
                {completions.map((c: Completion) => (
                  <div key={c.id} className={styles.recentRow}>
                    <span className={`${styles[c.status==='approved'?'rsApproved':c.status==='rejected'?'rsRejected':'rsPending']}`}>
                      {c.status==='approved'?'✅ 승인됨':c.status==='rejected'?'❌ 반려됨':'⏳ 확인 중'}
                    </span>
                    <span className={styles.recentDate}>{formatDate(c.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={`${styles.section} reveal`}>
            <div className={styles.pointGuide}>
              <h3 className={styles.guideTitle}>⭐ 포인트 안내</h3>
              <div className={styles.guideGrid}>
                {[
                  { icon: '🤝', label: '서로이웃 추가해주면', pt: '+10P' },
                  { icon: '💛', label: '공감 눌러주면',       pt: '+3P'  },
                  { icon: '💬', label: '댓글 달아주면',       pt: '+5P'  },
                ].map((g, i) => (
                  <div key={i} className={styles.guideItem}>
                    <span>{g.icon} {g.label}</span>
                    <strong>{g.pt}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
