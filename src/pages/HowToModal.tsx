import { useState, useEffect } from 'react'
import styles from './HowToModal.module.css'

/* ── 카테고리별 단계 데이터 ── */
const CATEGORIES = [
  {
    key: 'neighbor',
    emoji: '🤝',
    label: '서로이웃 추가',
    color: '#4cc87a',
    earnPoint: '+10P',
    spendPoint: '15P',
    summary: '상대방 블로그에 서로이웃을 신청하면 포인트가 쌓여요',
    steps: [
      {
        icon: '📋',
        title: '미션 목록에서 선택',
        desc: '상단 메뉴 "미션 목록"을 클릭하고 🤝 서로이웃 추가 미션을 골라요.',
      },
      {
        icon: '🔗',
        title: '블로그 주소 클릭',
        desc: '미션 카드의 블로그 주소를 클릭해서 해당 블로그로 이동해요.',
      },
      {
        icon: '👆',
        title: '이웃추가 버튼 클릭',
        desc: '블로그 상단 또는 오른쪽에 있는 "이웃추가" 버튼을 클릭해요.',
      },
      {
        icon: '🤝',
        title: '서로이웃 선택 후 신청',
        desc: '이웃 추가 창에서 반드시 "서로이웃"을 선택하고 신청 완료 해요.\n(일반이웃 X, 서로이웃 ✅)',
      },
      {
        icon: '📸',
        title: '화면 캡처',
        desc: '서로이웃 신청이 완료된 화면을 캡처해요. 내 닉네임과 상대방 블로그가 함께 보여야 해요.',
      },
      {
        icon: '✅',
        title: '인증하기 버튼 클릭',
        desc: '미션 목록으로 돌아와서 "인증하기" 버튼을 누르고 캡처한 사진을 올려요.',
      },
    ],
    tips: [
      '❌ 서로이웃이 아닌 일반이웃 신청은 인증이 반려될 수 있어요',
      '✅ 캡처 화면에 신청 완료 메시지가 보여야 해요',
      '⏳ 관리자 확인 후 승인되면 포인트가 지급돼요',
    ],
  },
  {
    key: 'like',
    emoji: '💛',
    label: '공감 누르기',
    color: '#f5c842',
    earnPoint: '+3P',
    spendPoint: '5P',
    summary: '상대방 블로그 글에 공감을 눌러주면 포인트가 쌓여요',
    steps: [
      {
        icon: '📋',
        title: '미션 목록에서 선택',
        desc: '상단 메뉴 "미션 목록"을 클릭하고 💛 공감 누르기 미션을 골라요.',
      },
      {
        icon: '🔗',
        title: '블로그 주소 클릭',
        desc: '미션 카드의 블로그 주소를 클릭해서 해당 블로그로 이동해요.',
      },
      {
        icon: '📄',
        title: '게시글 선택',
        desc: '블로그에서 아무 게시글이나 클릭해서 글을 열어요.',
      },
      {
        icon: '💛',
        title: '공감 버튼 클릭',
        desc: '게시글 하단이나 상단에 있는 공감 버튼(♥)을 클릭해요. 숫자가 올라가면 완료!',
      },
      {
        icon: '📸',
        title: '화면 캡처',
        desc: '공감이 눌린 상태가 보이는 화면을 캡처해요. 공감 숫자가 올라간 게 보여야 해요.',
      },
      {
        icon: '✅',
        title: '인증하기 버튼 클릭',
        desc: '미션 목록으로 돌아와서 "인증하기" 버튼을 누르고 캡처한 사진을 올려요.',
      },
    ],
    tips: [
      '✅ 공감 버튼이 눌린 상태(색깔 채워짐)가 캡처에 보여야 해요',
      '❌ 이미 공감을 눌렀던 글은 취소 후 다시 눌러도 인정돼요',
      '⏳ 관리자 확인 후 승인되면 포인트가 지급돼요',
    ],
  },
  {
    key: 'comment',
    emoji: '💬',
    label: '댓글 달기',
    color: '#e8528a',
    earnPoint: '+5P',
    spendPoint: '8P',
    summary: '상대방 블로그 글에 30자 이상 댓글을 달면 포인트가 쌓여요',
    steps: [
      {
        icon: '📋',
        title: '미션 목록에서 선택',
        desc: '상단 메뉴 "미션 목록"을 클릭하고 💬 댓글 달기 미션을 골라요.',
      },
      {
        icon: '🔗',
        title: '블로그 주소 클릭',
        desc: '미션 카드의 블로그 주소를 클릭해서 해당 블로그로 이동해요.',
      },
      {
        icon: '📄',
        title: '게시글 선택',
        desc: '블로그에서 아무 게시글이나 클릭해서 글을 열어요.',
      },
      {
        icon: '✍️',
        title: '댓글 작성 (30자 이상)',
        desc: '게시글 하단 댓글 창에 진심 어린 댓글을 30자 이상 작성해요.\n글 내용과 관련된 댓글을 달아주세요.',
      },
      {
        icon: '📸',
        title: '화면 캡처',
        desc: '내가 작성한 댓글이 등록된 화면을 캡처해요. 내 닉네임과 댓글 내용이 보여야 해요.',
      },
      {
        icon: '✅',
        title: '인증하기 버튼 클릭',
        desc: '미션 목록으로 돌아와서 "인증하기" 버튼을 누르고 캡처한 사진을 올려요.',
      },
    ],
    tips: [
      '✅ 댓글은 반드시 30자 이상이어야 해요',
      '❌ "좋아요", "잘 봤어요" 같은 짧은 댓글은 반려될 수 있어요',
      '✅ 글 내용에 맞는 진심 어린 댓글을 달아주세요',
      '⏳ 관리자 확인 후 승인되면 포인트가 지급돼요',
    ],
  },
]

type Props = { onClose: () => void }

export default function HowToModal({ onClose }: Props) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', esc)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', esc) }
  }, [onClose])

  const cat = CATEGORIES[active]

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        {/* 헤더 */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerEmoji}>📖</span>
            <div>
              <h2 className={styles.headerTitle}>서로품앗이 사용방법</h2>
              <p className={styles.headerDesc}>카테고리를 선택하면 자세한 방법을 알려드려요</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">✕</button>
        </div>

        {/* 카테고리 탭 */}
        <div className={styles.tabs}>
          {CATEGORIES.map((c, i) => (
            <button
              key={c.key}
              className={`${styles.tab} ${i === active ? styles.tabActive : ''}`}
              style={i === active ? { borderColor: c.color, color: c.color } : {}}
              onClick={() => setActive(i)}
            >
              <span className={styles.tabEmoji}>{c.emoji}</span>
              <span className={styles.tabLabel}>{c.label}</span>
              <span className={styles.tabPoint} style={i === active ? { background: `${c.color}20`, color: c.color } : {}}>
                {c.earnPoint}
              </span>
            </button>
          ))}
        </div>

        {/* 본문 */}
        <div className={styles.body}>

          {/* 요약 */}
          <div className={styles.summary} style={{ background: `${cat.color}10`, borderColor: `${cat.color}30` }}>
            <span className={styles.summaryEmoji}>{cat.emoji}</span>
            <div>
              <div className={styles.summaryTitle} style={{ color: cat.color }}>{cat.label}</div>
              <div className={styles.summaryDesc}>{cat.summary}</div>
              <div className={styles.summaryPoints}>
                <span className={styles.earnBadge} style={{ background: `${cat.color}18`, color: cat.color }}>
                  활동하면 {cat.earnPoint} 적립
                </span>
                <span className={styles.spendBadge}>
                  미션 등록 시 {cat.spendPoint} 소모
                </span>
              </div>
            </div>
          </div>

          {/* 단계별 방법 */}
          <div className={styles.stepsTitle}>📋 단계별 방법</div>
          <div className={styles.steps}>
            {cat.steps.map((s, i) => (
              <div key={i} className={styles.step}>
                <div className={styles.stepLeft}>
                  <div className={styles.stepNum} style={{ background: cat.color }}>{i + 1}</div>
                  {i < cat.steps.length - 1 && <div className={styles.stepLine}/>}
                </div>
                <div className={styles.stepRight}>
                  <div className={styles.stepHeader}>
                    <span className={styles.stepIcon}>{s.icon}</span>
                    <span className={styles.stepTitle}>{s.title}</span>
                  </div>
                  <p className={styles.stepDesc}>
                    {s.desc.split('\n').map((line, j) => (
                      <span key={j}>{line}{j < s.desc.split('\n').length - 1 && <br/>}</span>
                    ))}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 주의사항 */}
          <div className={styles.tipsSection}>
            <div className={styles.tipsTitle}>⚠️ 꼭 확인하세요</div>
            <div className={styles.tipsList}>
              {cat.tips.map((t, i) => (
                <div key={i} className={styles.tip}>{t}</div>
              ))}
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className={styles.footer}>
          <button className={styles.closeFooterBtn} onClick={onClose}>닫기</button>
          <a href="/missions" className={styles.goBtn} style={{ background: cat.color, color: '#0a1a12' }}>
            {cat.emoji} {cat.label} 미션 하러 가기 →
          </a>
        </div>
      </div>
    </div>
  )
}
