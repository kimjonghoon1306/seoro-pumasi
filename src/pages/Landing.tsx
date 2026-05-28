import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'wouter'
import styles from './Landing.module.css'

/* ── 파티클 배경 ── */
function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let W = canvas.width = canvas.offsetWidth
    let H = canvas.height = canvas.offsetHeight
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.4 + 0.1,
    }))
    let raf: number
    function draw() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, W, H)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(76,200,122,${p.opacity})`; ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    const onResize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize) }
  }, [])
  return <canvas ref={ref} className={styles.particle} />
}

/* ── 시네마틱 슬라이드 데이터 ── */
const SLIDES = [
  { num: '01', emoji: '🌱', tag: '서로품앗이란?',
    title: '블로거들의\n품앗이 커뮤니티',
    desc: '서로 방문하고 응원하며 함께 성장하는\n네이버 블로거들의 따뜻한 공간이에요',
    bg: 'linear-gradient(135deg, #040d08 0%, #061a0e 40%, #0f3d20 100%)',
    accent: '#4cc87a', highlight: '완전 무료' },
  { num: '02', emoji: '🤝', tag: '서로이웃 품앗이',
    title: '이웃을 늘리는\n가장 자연스러운 방법',
    desc: '내가 이웃 추가하면 상대방도 추가해줘요\n진짜 관심 있는 이웃이 자연스럽게 생겨요',
    bg: 'linear-gradient(135deg, #061a0e 0%, #0a2a16 40%, #155228 100%)',
    accent: '#f5c842', highlight: '+10P 적립' },
  { num: '03', emoji: '💛', tag: '공감 품앗이',
    title: '내 글이\n더 많은 사람에게',
    desc: '공감을 주고받으면 검색 노출이 높아져요\n서로의 글이 더 널리 퍼져나가요',
    bg: 'linear-gradient(135deg, #0d0d00 0%, #1a1a00 40%, #3d3000 100%)',
    accent: '#f5c842', highlight: '+3P 적립' },
  { num: '04', emoji: '💬', tag: '댓글 품앗이',
    title: '진심 어린 댓글로\n서로를 응원해요',
    desc: '따뜻한 댓글이 쌓이면 블로그가 더 활성화돼요\n서로의 글에 진심을 담아 응원해 줘요',
    bg: 'linear-gradient(135deg, #000d1a 0%, #001a33 40%, #003366 100%)',
    accent: '#7eb8ff', highlight: '+5P 적립' },
  { num: '05', emoji: '⭐', tag: '포인트로 성장해요',
    title: '활동할수록\n이웃이 늘어나요',
    desc: '모은 포인트로 내 블로그에 미션을 올려요\n다른 분들이 방문하며 진짜 이웃이 생겨요',
    bg: 'linear-gradient(135deg, #0d0500 0%, #1a0a00 40%, #3d2000 100%)',
    accent: '#ff9f40', highlight: '무한 반복' },
]

const TIMER = 5000

/* ── 시네마틱 슬라이더 ── */
function CinematicSlider() {
  const [cur, setCur]       = useState(0)
  const [prev, setPrev]     = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimers = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (progressRef.current) clearInterval(progressRef.current)
  }, [])

  const startTimers = useCallback(() => {
    clearTimers()
    setProgress(0)
    let p = 0
    progressRef.current = setInterval(() => {
      p += (100 / (TIMER / 50))
      if (p >= 100) p = 100
      setProgress(p)
    }, 50)
    intervalRef.current = setInterval(() => {
      setCur(c => { setPrev(c); return (c + 1) % SLIDES.length })
      p = 0; setProgress(0)
    }, TIMER)
  }, [clearTimers])

  useEffect(() => { startTimers(); return clearTimers }, [startTimers, clearTimers])

  function goTo(i: number) {
    if (i === cur) return
    clearTimers(); setPrev(cur); setCur(i); startTimers()
  }

  const slide = SLIDES[cur]
  return (
    <div className={styles.slider}>
      {SLIDES.map((s, i) => (
        <div key={i} className={`${styles.slide} ${
          i === cur  ? styles.slideCurrent :
          i === prev ? styles.slideExitLeft : styles.slideHidden
        }`} style={{ background: s.bg }}>
          <div className={styles.slideGrid}/>
          <div className={styles.slideGlow} style={{ background: s.accent }}/>
          <div className={styles.slideInner}>
            <div className={styles.slideLeft}>
              <div className={styles.slideNumTag}>
                <span className={styles.slideNum}>{s.num}</span>
                <span className={styles.slideTag} style={{ color: s.accent, borderColor: `${s.accent}40` }}>{s.tag}</span>
              </div>
              <h2 className={styles.slideTitle}>
                {s.title.split('\n').map((l, j) => <span key={j}>{l}<br/></span>)}
              </h2>
              <p className={styles.slideDesc}>
                {s.desc.split('\n').map((l, j) => <span key={j}>{l}<br/></span>)}
              </p>
              <div className={styles.slideHighlight} style={{ background: `${s.accent}18`, borderColor: `${s.accent}35`, color: s.accent }}>
                ✨ {s.highlight}
              </div>
              <Link href="/login" className={styles.slideBtn} style={{ background: s.accent, color: '#0a1a12' }}>
                지금 시작하기 →
              </Link>
            </div>
            <div className={styles.slideRight}>
              <div className={styles.slideEmojiWrap} style={{ borderColor: `${s.accent}30`, background: `${s.accent}08` }}>
                <span className={styles.slideEmoji}>{s.emoji}</span>
              </div>
            </div>
          </div>
          <div className={styles.slideCounter}>{i + 1} / {SLIDES.length}</div>
        </div>
      ))}
      <div className={styles.progressTrack}>
        <div className={styles.progressBar} style={{ width: `${progress}%`, background: slide.accent }}/>
      </div>
      <div className={styles.dots}>
        {SLIDES.map((s, i) => (
          <button key={i} className={`${styles.dot} ${i === cur ? styles.dotActive : ''}`}
            style={i === cur ? { background: slide.accent, width: '28px' } : {}}
            onClick={() => goTo(i)} aria-label={`슬라이드 ${i + 1}: ${s.tag}`}/>
        ))}
      </div>
    </div>
  )
}

/* ── 둘러보기 목업 데이터 ── */
const MOCK_MISSIONS = [
  { type: '🤝', label: '서로이웃 추가', done: 3, total: 5,  status: 'active' },
  { type: '💛', label: '공감 누르기',   done: 8, total: 10, status: 'active' },
  { type: '💬', label: '댓글 달기',     done: 5, total: 5,  status: 'done'   },
]
const MOCK_STATS = [
  { emoji: '✅', num: 3, label: '완료한 미션',    color: 'var(--g500)' },
  { emoji: '⏳', num: 1, label: '승인 대기 중',   color: 'var(--gold)' },
  { emoji: '📌', num: 2, label: '내가 올린 미션', color: 'var(--pink)' },
  { emoji: '🎉', num: 1, label: '완료된 미션',    color: 'var(--g400)' },
]

/* ── 둘러보기 모달 ── */
function PreviewModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', esc)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', esc) }
  }, [onClose])

  return (
    <div className={styles.previewOverlay} onClick={onClose}>
      <div className={styles.previewModal} onClick={e => e.stopPropagation()}>

        {/* 상단 배너 */}
        <div className={styles.previewBanner}>
          <span className={styles.previewBannerIcon}>👀</span>
          <span className={styles.previewBannerText}>
            둘러보기 모드예요. 실제 사용은 로그인 후 이용해 주세요.
          </span>
          <button className={styles.previewClose} onClick={onClose} aria-label="닫기">✕</button>
        </div>

        {/* 목업 대시보드 */}
        <div className={styles.previewBody}>

          {/* 배너 */}
          <div className={styles.mockBanner}>
            <div className={styles.mockBannerLeft}>
              <div className={styles.mockGreet}>
                안녕하세요,&nbsp;<span className={styles.mockName}>이웃님</span>님!
              </div>
              <div className={styles.mockGrade}>🌱 새싹 · 잘 하고 계세요!</div>
            </div>
            <div className={styles.mockPointCircle}>
              <span className={styles.mockPointNum}>250</span>
              <span className={styles.mockPointLabel}>포인트</span>
            </div>
          </div>

          {/* 빠른 버튼 */}
          <div className={styles.mockQuickBtns}>
            <div className={styles.mockQbGreen}>
              <span>📋</span>
              <span className={styles.mockQbTitle}>미션 수행하기</span>
              <span className={styles.mockQbDesc}>다른 분 블로그 방문하고 포인트 받기</span>
            </div>
            <div className={styles.mockQbYellow}>
              <span>✏️</span>
              <span className={styles.mockQbTitle}>미션 올리기</span>
              <span className={styles.mockQbDesc}>포인트 써서 내 블로그 이웃 늘리기</span>
            </div>
          </div>

          {/* 통계 */}
          <div className={styles.mockStats}>
            {MOCK_STATS.map((s, i) => (
              <div key={i} className={styles.mockStatCard}>
                <span className={styles.mockStatEmoji}>{s.emoji}</span>
                <span className={styles.mockStatNum} style={{ color: s.color }}>{s.num}</span>
                <span className={styles.mockStatLabel}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* 미션 목록 */}
          <div className={styles.mockSection}>
            <div className={styles.mockSectionTitle}>📌 내가 올린 미션</div>
            <div className={styles.mockMissionList}>
              {MOCK_MISSIONS.map((m, i) => (
                <div key={i} className={styles.mockMissionRow}>
                  <span className={styles.mockMissionEmoji}>{m.type}</span>
                  <div className={styles.mockMissionInfo}>
                    <span className={styles.mockMissionLabel}>{m.label}</span>
                    <div className={styles.mockProgressBar}>
                      <div className={styles.mockProgressFill} style={{ width: `${(m.done / m.total) * 100}%` }}/>
                    </div>
                  </div>
                  <span className={styles.mockMissionCount}>{m.done}/{m.total}</span>
                  <span className={`${styles.mockBadge} ${m.status === 'active' ? styles.mockBadgeActive : styles.mockBadgeDone}`}>
                    {m.status === 'active' ? '진행 중' : '완료'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 하단 CTA */}
        <div className={styles.previewFooter}>
          <p className={styles.previewFooterText}>
            마음에 드시나요? 무료로 가입하고 직접 사용해 보세요!
          </p>
          <div className={styles.previewFooterBtns}>
            <button className={styles.previewCancelBtn} onClick={onClose}>계속 둘러보기</button>
            <a href="/login" className={styles.previewStartBtn}>🚀 지금 시작하기</a>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── 데이터 ── */
const STATS = [
  { num: '5분',   label: '시작까지 걸리는 시간', icon: '⚡' },
  { num: '100%',  label: '완전 무료',            icon: '🎁' },
  { num: '3가지', label: '활동으로 적립',         icon: '🎯' },
]
const POINTS = [
  { emoji: '🤝', action: '서로이웃 추가', earn: '+10P', cost: '15P', color: '#4cc87a' },
  { emoji: '💛', action: '공감 누르기',  earn: '+3P',  cost: '5P',  color: '#f5c842' },
  { emoji: '💬', action: '댓글 달기',    earn: '+5P',  cost: '8P',  color: '#e8528a' },
]
const FAQS = [
  { q: '컴퓨터를 잘 몰라도 할 수 있나요?', a: '네! 네이버 블로그만 있으면 누구나 할 수 있어요. 사용 방법이 매우 간단해요.' },
  { q: '돈이 드나요?', a: '전혀 무료예요! 활동하면서 포인트를 쌓고 그 포인트를 쓰는 방식이라 돈이 들지 않아요.' },
  { q: '스팸이나 이상한 활동은 없나요?', a: '스크린샷을 제출해야 포인트가 쌓여요. 관리자가 직접 확인하고 승인해요.' },
  { q: '모바일에서도 할 수 있나요?', a: '네! PC와 모바일 모두 완벽하게 지원해요. 이동 중에도 편하게 사용해요.' },
]

/* ── 메인 컴포넌트 ── */
export default function Landing() {
  const [previewOpen, setPreviewOpen] = useState(false)

  return (
    <>
      <div className={styles.page}>

        {/* ─── 히어로 ─── */}
        <section className={styles.hero}>
          <ParticleCanvas />
          <div className={styles.heroBg}>
            <div className={styles.heroBgOrb1}/>
            <div className={styles.heroBgOrb2}/>
            <div className={styles.heroBgOrb3}/>
          </div>
          <div className={styles.heroContent}>
            <div className={`${styles.heroBadge} animate-fadeUp`}>
              <span className={styles.heroBadgeDot}/>
              지금 바로 무료로 시작하세요
            </div>
            <h1 className={`${styles.heroTitle} animate-fadeUp delay-100`}>
              <span className={styles.heroTitleLine1}>블로그 이웃,</span>
              <span className={styles.heroTitleLine2}>함께 키워요</span>
            </h1>
            <p className={`${styles.heroDesc} animate-fadeUp delay-200`}>
              내가 이웃 블로그를 방문해 주면 포인트가 쌓이고<br/>
              그 포인트로 내 블로그에 진짜 이웃이 생겨요
            </p>
            <div className={`${styles.heroCtas} animate-fadeUp delay-300`}>
              <Link href="/login" className={styles.heroCtaPrimary}>
                <span>무료로 시작하기</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8H13M8 3L13 8L8 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <button className={styles.heroCtaPreview} onClick={() => setPreviewOpen(true)}>
                👀 둘러보기
              </button>
              <a href="#slider" className={styles.heroCtaSecondary}>어떻게 하나요? ↓</a>
            </div>
            <div className={`${styles.heroStats} animate-fadeUp delay-400`}>
              {STATS.map((s, i) => (
                <div key={i} className={styles.heroStat}>
                  <span className={styles.heroStatIcon}>{s.icon}</span>
                  <span className={styles.heroStatNum}>{s.num}</span>
                  <span className={styles.heroStatLabel}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.heroScroll}>
            <div className={styles.heroScrollLine}/>
            <span>스크롤</span>
          </div>
        </section>

        {/* ─── 시네마틱 슬라이더 ─── */}
        <section className={styles.sliderSection} id="slider">
          <div className={styles.sliderHeader}>
            <span className={styles.eyebrow}>HOW IT WORKS</span>
            <h2 className={styles.sectionTitle}>이렇게 하면 돼요</h2>
            <p className={styles.sectionDesc}>5초마다 자동으로 넘어가요. 직접 눌러도 돼요 😊</p>
          </div>
          <CinematicSlider />
        </section>

        {/* ─── 포인트 ─── */}
        <section className={styles.pointSection}>
          <div className={styles.inner}>
            <div className={styles.sectionHeader}>
              <span className={styles.eyebrow}>POINTS</span>
              <h2 className={styles.sectionTitle}>포인트는 이렇게 쌓여요</h2>
              <p className={styles.sectionDesc}>활동하면 포인트가 쌓이고, 포인트로 내 블로그를 키울 수 있어요</p>
            </div>
            <div className={styles.pointGrid}>
              {POINTS.map((p, i) => (
                <div key={i} className={styles.pointCard} style={{ '--c': p.color } as React.CSSProperties}>
                  <div className={styles.pointEmoji}>{p.emoji}</div>
                  <div className={styles.pointAction}>{p.action}</div>
                  <div className={styles.pointEarn} style={{ color: p.color }}>{p.earn} 받아요</div>
                  <div className={styles.pointDivider}/>
                  <div className={styles.pointCostRow}>
                    <span className={styles.pointCostLabel}>요청 비용</span>
                    <span className={styles.pointCost} style={{ color: p.color }}>{p.cost}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.pointNote}>
              💡 포인트는 완전히 무료로 받을 수 있어요. 돈이 전혀 들지 않아요!
            </div>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section className={styles.faqSection}>
          <div className={styles.faqInner}>
            <div className={styles.sectionHeader}>
              <span className={styles.eyebrow}>FAQ</span>
              <h2 className={styles.sectionTitle}>자주 묻는 질문</h2>
            </div>
            <div className={styles.faqList}>
              {FAQS.map((f, i) => (
                <div key={i} className={styles.faqItem}>
                  <div className={styles.faqQ}>
                    <span className={styles.faqQMark}>Q</span>
                    {f.q}
                  </div>
                  <div className={styles.faqA}>
                    <span className={styles.faqAMark}>A</span>
                    {f.a}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaBg}/>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>지금 바로 시작해 보세요</h2>
            <p className={styles.ctaDesc}>3분이면 설정 완료. 오늘부터 이웃이 늘어나요.</p>
            <div className={styles.ctaBtns}>
              <Link href="/login" className={styles.ctaBtn}>무료로 가입하기 →</Link>
              <button className={styles.ctaPreviewBtn} onClick={() => setPreviewOpen(true)}>
                👀 먼저 둘러보기
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* 둘러보기 모달 */}
      {previewOpen && <PreviewModal onClose={() => setPreviewOpen(false)} />}
    </>
  )
}
