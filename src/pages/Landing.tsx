import { useEffect, useRef } from 'react'
import { Link } from 'wouter'
import styles from './Landing.module.css'

function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let W = canvas.width = canvas.offsetWidth
    let H = canvas.height = canvas.offsetHeight
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
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
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(76,200,122,${p.opacity})`; ctx.fill()
      })
      for (let i = 0; i < particles.length; i++) {
        for (let j = i+1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx*dx + dy*dy)
          if (dist < 100) {
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(76,200,122,${0.12*(1-dist/100)})`; ctx.lineWidth = 0.5; ctx.stroke()
          }
        }
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    const onResize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize) }
  }, [])
  return <canvas ref={ref} className={styles.particle} />
}

const CINEMATIC = [
  {
    num: '01', color: '#4cc87a', title: '내 블로그 등록',
    desc: '네이버 블로그 주소만 입력하면 준비 완료! 3분이면 시작할 수 있어요.',
    icon: (
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="50" stroke="#4cc87a" strokeWidth="1" strokeDasharray="6 4" opacity="0.3"/>
        <circle cx="60" cy="60" r="35" stroke="#4cc87a" strokeWidth="1.5" fill="rgba(76,200,122,0.05)"/>
        <circle cx="60" cy="60" r="18" fill="rgba(76,200,122,0.15)" stroke="#4cc87a" strokeWidth="2"/>
        <path d="M52 60 L57 65 L68 54" stroke="#4cc87a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="60" cy="15" r="5" fill="#f5c842"/>
        <circle cx="105" cy="60" r="5" fill="#e8528a"/>
        <circle cx="60" cy="105" r="5" fill="#4cc87a"/>
        <circle cx="15" cy="60" r="5" fill="#f5c842"/>
      </svg>
    ),
  },
  {
    num: '02', color: '#f5c842', title: '미션 수행하기',
    desc: '다른 블로그에 서로이웃, 공감, 댓글을 달면 포인트가 쌓여요.',
    icon: (
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="15" y="35" width="38" height="50" rx="8" stroke="#4cc87a" strokeWidth="1.5" fill="rgba(76,200,122,0.06)"/>
        <rect x="67" y="35" width="38" height="50" rx="8" stroke="#e8528a" strokeWidth="1.5" fill="rgba(232,82,138,0.06)"/>
        <path d="M25 60 L45 60" stroke="#4cc87a" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M25 68 L38 68" stroke="#4cc87a" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
        <path d="M75 60 L95 60" stroke="#e8528a" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M75 68 L88 68" stroke="#e8528a" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
        <path d="M53 55 L67 55" stroke="#f5c842" strokeWidth="2" strokeLinecap="round"/>
        <path d="M62 49 L68 55 L62 61" stroke="#f5c842" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="97" cy="35" r="12" fill="#f5c842"/>
        <path d="M91 35 L94 38 L103 29" stroke="#0a2a16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    num: '03', color: '#e8528a', title: '인증하고 포인트 적립',
    desc: '활동 화면을 캡처해서 제출하면 포인트가 바로 쌓여요.',
    icon: (
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="25" y="20" width="70" height="80" rx="10" stroke="#e8528a" strokeWidth="1.5" fill="rgba(232,82,138,0.05)"/>
        <rect x="35" y="35" width="50" height="35" rx="6" stroke="#e8528a" strokeWidth="1" fill="rgba(232,82,138,0.08)"/>
        <path d="M35 80 L60 57 L75 70 L85 60" stroke="#4cc87a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="75" cy="42" r="6" fill="rgba(245,200,66,0.3)" stroke="#f5c842" strokeWidth="1.5"/>
        <circle cx="90" cy="90" r="18" fill="#f5c842"/>
        <path d="M83 90 L87 94 L97 84" stroke="#0a2a16" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    num: '04', color: '#4cc87a', title: '이웃이 늘어나요',
    desc: '모은 포인트로 내 블로그에 실제 이웃이 생겨요. 블로그가 성장해요!',
    icon: (
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 95 Q35 50 55 65 Q75 80 95 25" stroke="#4cc87a" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <circle cx="95" cy="25" r="6" fill="#f5c842"/>
        {[20,40,60,80,95].map((x, i) => {
          const heights = [8, 20, 35, 55, 70]
          return <rect key={i} x={x-6} y={95-heights[i]} width="12" height={heights[i]}
            rx="3" fill={['rgba(76,200,122,0.3)','rgba(76,200,122,0.5)','rgba(76,200,122,0.7)','rgba(245,200,66,0.7)','#f5c842'][i]}/>
        })}
        <path d="M15 97 L105 97" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    num: '05', color: '#f5c842', title: '함께 성장해요',
    desc: '서로 돕는 커뮤니티 안에서 모두의 블로그가 함께 성장합니다.',
    icon: (
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="22" fill="rgba(245,200,66,0.15)" stroke="#f5c842" strokeWidth="2"/>
        <circle cx="60" cy="60" r="10" fill="#f5c842"/>
        {[0,51.4,102.9,154.3,205.7,257.1].map((deg, i) => {
          const rad = (deg * Math.PI) / 180
          const r = 42, x = 60 + r * Math.cos(rad), y = 60 + r * Math.sin(rad)
          const colors = ['#4cc87a','#f5c842','#e8528a','#4cc87a','#f5c842','#e8528a']
          return (
            <g key={i}>
              <line x1="60" y1="60" x2={x} y2={y} stroke={colors[i]} strokeWidth="1" opacity="0.3"/>
              <circle cx={x} cy={y} r="8" fill={colors[i]} opacity="0.85"/>
            </g>
          )
        })}
      </svg>
    ),
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
      <section className={styles.hero}>
        <ParticleCanvas />
        <div className={styles.heroBg}>
          <div className={styles.heroBgOrb1}/><div className={styles.heroBgOrb2}/><div className={styles.heroBgOrb3}/>
        </div>
        <div className={styles.heroContent}>
          <div className={`${styles.heroBadge} animate-fadeUp`}>
            <span className={styles.heroBadgeDot}/>지금 바로 무료로 시작하세요
          </div>
          <h1 className={`${styles.heroTitle} animate-fadeUp delay-100`}>
            <span className={styles.heroTitleLine1}>블로그 이웃,</span>
            <span className={styles.heroTitleLine2}>함께 키워요</span>
          </h1>
          <p className={`${styles.heroDesc} animate-fadeUp delay-200`}>
            내가 이웃 블로그를 방문해 주면 포인트가 쌓이고<br/>그 포인트로 내 블로그에 진짜 이웃이 생겨요
          </p>
          <div className={`${styles.heroCtas} animate-fadeUp delay-300`}>
            <Link href="/login" className={styles.heroCtaPrimary}>
              <span>무료로 시작하기</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M8 3L13 8L8 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <a href="#cinematic" className={styles.heroCtaSecondary}>어떻게 하나요?</a>
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
        <div className={styles.heroScroll}><div className={styles.heroScrollLine}/><span>스크롤</span></div>
      </section>

      {/* 시네마틱 */}
      <section className={styles.cinematic} id="cinematic">
        <div className={styles.cinematicInner}>
          <div className={`${styles.cinematicHeader} reveal`}>
            <span className={styles.cinematicEyebrow}>HOW IT WORKS</span>
            <h2 className={styles.cinematicTitle}>이렇게 하면 돼요</h2>
            <p className={styles.cinematicSubtitle}>5단계로 완성되는 블로그 성장 스토리</p>
          </div>
          <div className={styles.cinematicSteps}>
            {CINEMATIC.map((step, i) => (
              <div key={i} className={`${styles.cinematicStep} ${i%2===1?styles.stepReverse:''} ${i%2===0?'reveal-left':'reveal-right'}`}>
                <div className={styles.stepVisual} style={{ '--accent': step.color } as React.CSSProperties}>
                  <div className={styles.stepNum}>{step.num}</div>
                  <div className={styles.stepIconWrap}>{step.icon}</div>
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

      {/* 포인트 */}
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
              <div key={i} className={`${styles.pointCard} reveal`} style={{ '--c': p.color } as React.CSSProperties}>
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
          <div className={`${styles.pointNote} reveal`}>💡 포인트는 완전히 무료로 받을 수 있어요. 돈이 전혀 들지 않아요!</div>
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.faqSection}>
        <div className={styles.faqInner}>
          <div className={`${styles.pointHeader} reveal`}>
            <span className={styles.cinematicEyebrow}>FAQ</span>
            <h2 className={styles.cinematicTitle}>자주 묻는 질문</h2>
          </div>
          <div className={styles.faqList}>
            {[
              { q: '컴퓨터를 잘 몰라도 할 수 있나요?', a: '네! 네이버 블로그만 있으면 누구나 할 수 있어요.' },
              { q: '돈이 드나요?', a: '전혀 무료예요! 활동하면서 포인트를 쌓고 그 포인트를 쓰는 방식이에요.' },
              { q: '스팸이나 이상한 활동은 없나요?', a: '진짜 방문해서 활동한 것만 인정해요. 내 글에 내가 하는 건 안 돼요.' },
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

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaInner}>
          <div className={styles.ctaBg}/>
          <h2 className={`${styles.ctaTitle} reveal`}>지금 바로 시작해 보세요</h2>
          <p className={`${styles.ctaDesc} reveal`}>3분이면 설정 완료. 오늘부터 이웃이 늘어나요.</p>
          <Link href="/login" className={`${styles.ctaBtn} reveal`}>무료로 가입하기 →</Link>
        </div>
      </section>
    </div>
  )
}
