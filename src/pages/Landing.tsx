import { useEffect, useRef } from 'react'
import { Link } from 'wouter'
import styles from './Landing.module.css'

// 파티클 캔버스
function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = canvas.width  = canvas.offsetWidth
    let H = canvas.height = canvas.offsetHeight
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.1,
    }))

    let raf: number
    function draw() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, W, H)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(76,200,122,${p.opacity})`
        ctx.fill()
      })
      // 연결선
      for (let i = 0; i < particles.length; i++) {
        for (let j = i+1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx*dx + dy*dy)
          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(76,200,122,${0.12 * (1 - dist/100)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      raf = requestAnimationFrame(draw)
    }
    draw()

    const onResize = () => {
      W = canvas.width  = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
    }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize) }
  }, [])
  return <canvas ref={ref} className={styles.particle} />
}

const CINEMATIC = [
  {
    num: '01',
    icon: (
      <svg viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="28" stroke="#4cc87a" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4"/>
        <path d="M20 32 C20 25 25 20 32 20 C39 20 44 25 44 32 C44 39 39 44 32 44" stroke="#4cc87a" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <circle cx="32" cy="32" r="6" fill="#f5c842" opacity="0.9"/>
        <path d="M32 44 L28 52 M32 44 L36 52" stroke="#4cc87a" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="20" cy="32" r="3" fill="#e8528a"/>
        <circle cx="44" cy="32" r="3" fill="#e8528a"/>
      </svg>
    ),
    title: '내 블로그 등록',
    desc: '네이버 블로그 주소만 입력하면 준비 완료! 3분이면 시작할 수 있어요.',
    color: '#4cc87a',
  },
  {
    num: '02',
    icon: (
      <svg viewBox="0 0 64 64" fill="none">
        <path d="M12 32 L52 32" stroke="#f5c842" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4"/>
        <rect x="8" y="20" width="20" height="24" rx="4" stroke="#4cc87a" strokeWidth="1.5" fill="rgba(76,200,122,0.08)"/>
        <rect x="36" y="20" width="20" height="24" rx="4" stroke="#e8528a" strokeWidth="1.5" fill="rgba(232,82,138,0.08)"/>
        <path d="M28 32 L36 32" stroke="#f5c842" strokeWidth="2" strokeLinecap="round" markerEnd="url(#arr)"/>
        <text x="14" y="35" fontSize="10" fill="#4cc87a" fontWeight="600">내 블로그</text>
        <text x="40" y="35" fontSize="8" fill="#e8528a" fontWeight="600">이웃 블로그</text>
        <circle cx="52" cy="20" r="8" fill="#f5c842" opacity="0.9"/>
        <text x="52" y="24" fontSize="10" fill="#0a2a16" fontWeight="700" textAnchor="middle">+P</text>
      </svg>
    ),
    title: '미션 수행하기',
    desc: '다른 블로그에 서로이웃, 공감, 댓글을 달면 포인트가 쌓여요.',
    color: '#f5c842',
  },
  {
    num: '03',
    icon: (
      <svg viewBox="0 0 64 64" fill="none">
        <path d="M32 12 L32 52" stroke="#e8528a" strokeWidth="1" strokeDasharray="2 2" opacity="0.3"/>
        <circle cx="32" cy="32" r="14" stroke="#e8528a" strokeWidth="1.5" fill="rgba(232,82,138,0.06)"/>
        <path d="M24 32 L29 37 L40 26" stroke="#4cc87a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="32" cy="12" r="4" fill="#4cc87a"/>
        <circle cx="52" cy="24" r="4" fill="#f5c842"/>
        <circle cx="52" cy="44" r="4" fill="#e8528a"/>
      </svg>
    ),
    title: '인증하고 포인트 적립',
    desc: '활동 화면을 캡처해서 제출하면 포인트가 바로 쌓여요.',
    color: '#e8528a',
  },
  {
    num: '04',
    icon: (
      <svg viewBox="0 0 64 64" fill="none">
        <path d="M8 44 Q20 20 32 28 Q44 36 56 12" stroke="#4cc87a" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <circle cx="56" cy="12" r="5" fill="#f5c842"/>
        <path d="M8 44 L14 38 M8 44 L14 50" stroke="#4cc87a" strokeWidth="1.5" strokeLinecap="round"/>
        {[16, 28, 40, 56].map((x, i) => (
          <rect key={i} x={x-4} y={52-(i*6)} width="8" height={i*6+4} rx="2"
            fill={['#4cc87a','#22a05a','#f5c842','#e8528a'][i]} opacity="0.8"/>
        ))}
      </svg>
    ),
    title: '이웃이 늘어나요',
    desc: '모은 포인트로 내 블로그에 실제 이웃이 생겨요. 블로그가 성장해요!',
    color: '#4cc87a',
  },
  {
    num: '05',
    icon: (
      <svg viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="20" stroke="url(#c5g)" strokeWidth="1.5" fill="rgba(76,200,122,0.04)"/>
        {[0,60,120,180,240,300].map((deg, i) => {
          const r = 20, rad = (deg * Math.PI) / 180
          const x = 32 + r * Math.cos(rad), y = 32 + r * Math.sin(rad)
          return <circle key={i} cx={x} cy={y} r={4} fill={['#4cc87a','#f5c842','#e8528a','#4cc87a','#f5c842','#e8528a'][i]}/>
        })}
        <circle cx="32" cy="32" r="7" fill="#f5c842" opacity="0.9"/>
        <text x="32" y="36" fontSize="9" fill="#0a2a16" fontWeight="700" textAnchor="middle">나</text>
        <defs>
          <linearGradient id="c5g" x1="0" y1="0" x2="64" y2="64">
            <stop stopColor="#4cc87a"/><stop offset="1" stopColor="#e8528a"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    title: '함께 성장해요',
    desc: '서로 돕는 커뮤니티 안에서 모두의 블로그가 함께 성장합니다.',
    color: '#f5c842',
  },
]

const STATS = [
  { num: '5분', label: '시작까지 걸리는 시간', icon: '⚡' },
  { num: '100%', label: '완전 무료', icon: '🎁' },
  { num: '3가지', label: '활동으로 포인트 적립', icon: '🎯' },
]

export default function Landing() {
  return (
    <div className={styles.page}>

      {/* ── 히어로 ── */}
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
            <a href="#cinematic" className={styles.heroCtaSecondary}>
              어떻게 하나요?
            </a>
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

      {/* ── 시네마틱 섹션 ── */}
      <section className={styles.cinematic} id="cinematic">
        <div className={styles.cinematicInner}>
          <div className={`${styles.cinematicHeader} reveal`}>
            <span className={styles.cinematicEyebrow}>HOW IT WORKS</span>
            <h2 className={styles.cinematicTitle}>이렇게 하면 돼요</h2>
            <p className={styles.cinematicSubtitle}>
              5단계로 완성되는 블로그 성장 스토리
            </p>
          </div>

          <div className={styles.cinematicSteps}>
            {CINEMATIC.map((step, i) => (
              <div
                key={i}
                className={`${styles.cinematicStep} ${i % 2 === 1 ? styles.stepReverse : ''} ${i % 2 === 0 ? 'reveal-left' : 'reveal-right'}`}
              >
                <div className={styles.stepVisual} style={{ '--accent': step.color } as React.CSSProperties}>
                  <div className={styles.stepNum}>{step.num}</div>
                  <div className={styles.stepIconWrap}>
                    {step.icon}
                  </div>
                  <div className={styles.stepGlow} style={{ background: step.color }}/>
                </div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle} style={{ color: step.color }}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 포인트 섹션 ── */}
      <section className={styles.pointSection}>
        <div className={styles.pointInner}>
          <div className={`${styles.pointHeader} reveal`}>
            <span className={styles.cinematicEyebrow}>POINTS</span>
            <h2 className={styles.cinematicTitle}>포인트는 이렇게 쌓여요</h2>
          </div>
          <div className={styles.pointGrid}>
            {[
              { emoji: '🤝', action: '서로이웃 추가', earn: '+10P', cost: '15P', color: '#4cc87a' },
              { emoji: '💛', action: '공감 누르기',  earn: '+3P',  cost: '5P',  color: '#f5c842' },
              { emoji: '💬', action: '댓글 달기',    earn: '+5P',  cost: '8P',  color: '#e8528a' },
            ].map((p, i) => (
              <div key={i} className={`${styles.pointCard} reveal`} style={{ animationDelay: `${i*100}ms`, '--c': p.color } as React.CSSProperties}>
                <div className={styles.pointEmoji}>{p.emoji}</div>
                <div className={styles.pointAction}>{p.action}</div>
                <div className={styles.pointEarn} style={{ color: p.color }}>{p.earn}</div>
                <div className={styles.pointCostRow}>
                  <span className={styles.pointCostLabel}>요청 비용</span>
                  <span className={styles.pointCost}>{p.cost}</span>
                </div>
              </div>
            ))}
          </div>
          <div className={`${styles.pointNote} reveal`}>
            💡 포인트는 완전히 무료로 받을 수 있어요. 돈이 전혀 들지 않아요!
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className={styles.faqSection}>
        <div className={styles.faqInner}>
          <div className={`${styles.pointHeader} reveal`}>
            <span className={styles.cinematicEyebrow}>FAQ</span>
            <h2 className={styles.cinematicTitle}>자주 묻는 질문</h2>
          </div>
          <div className={styles.faqList}>
            {[
              { q: '컴퓨터를 잘 몰라도 할 수 있나요?', a: '네! 네이버 블로그만 있으면 누구나 할 수 있어요. 화면에 나오는 대로 따라하면 돼요.' },
              { q: '돈이 드나요?', a: '전혀 무료예요! 활동하면서 포인트를 쌓고 그 포인트를 쓰는 방식이에요.' },
              { q: '스팸이나 이상한 활동은 없나요?', a: '진짜 방문해서 활동한 것만 인정해요. 내 글에 내가 하는 건 안 되고, 진심 어린 활동만 포인트를 드려요.' },
              { q: '모바일에서도 할 수 있나요?', a: '네! PC와 모바일 모두 완벽하게 지원해요.' },
            ].map((f, i) => (
              <div key={i} className={`${styles.faqItem} reveal`}>
                <div className={styles.faqQ}><span className={styles.faqQMark}>Q</span>{f.q}</div>
                <div className={styles.faqA}>{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaInner}>
          <div className={styles.ctaBg}/>
          <h2 className={`${styles.ctaTitle} reveal`}>지금 바로 시작해 보세요</h2>
          <p className={`${styles.ctaDesc} reveal`}>3분이면 설정 완료. 오늘부터 이웃이 늘어나요.</p>
          <Link href="/login" className={`${styles.ctaBtn} reveal`}>
            무료로 가입하기 →
          </Link>
        </div>
      </section>
    </div>
  )
}
