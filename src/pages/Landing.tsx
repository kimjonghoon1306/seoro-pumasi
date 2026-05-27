import { Link } from 'wouter'
import styles from './Landing.module.css'

export default function Landing() {
  return (
    <div className={styles.wrap}>

      {/* ── 히어로 ── */}
      <section className={styles.hero}>
        <div className={styles.heroEmoji}>🌱</div>
        <h1 className={styles.heroTitle}>
          서로 도와주고<br />함께 성장해요!
        </h1>
        <p className={styles.heroDesc}>
          내가 이웃 블로그를 방문하면 포인트를 받고<br />
          그 포인트로 내 블로그에 이웃을 늘릴 수 있어요
        </p>
        <Link href="/login" className={styles.heroBtn}>
          🙋 지금 바로 시작하기 (무료!)
        </Link>
        <p className={styles.heroSub}>회원가입 3분이면 끝나요 😊</p>
      </section>

      {/* ── 3단계 설명 ── */}
      <section className={styles.steps}>
        <h2 className={styles.sectionTitle}>이렇게 하면 돼요!</h2>

        <div className={styles.stepList}>
          <div className={styles.stepCard}>
            <div className={styles.stepNum}>1</div>
            <div className={styles.stepEmoji}>✏️</div>
            <h3 className={styles.stepTitle}>내 블로그 주소를 알려주세요</h3>
            <p className={styles.stepDesc}>
              네이버 블로그 주소를 입력하면<br />준비 완료!
            </p>
          </div>

          <div className={styles.stepArrow}>→</div>

          <div className={styles.stepCard}>
            <div className={styles.stepNum}>2</div>
            <div className={styles.stepEmoji}>💛</div>
            <h3 className={styles.stepTitle}>다른 분 블로그를 방문해 주세요</h3>
            <p className={styles.stepDesc}>
              서로이웃 추가, 공감, 댓글 중<br />하나를 해주면 포인트를 드려요!
            </p>
          </div>

          <div className={styles.stepArrow}>→</div>

          <div className={styles.stepCard}>
            <div className={styles.stepNum}>3</div>
            <div className={styles.stepEmoji}>🤝</div>
            <h3 className={styles.stepTitle}>내 블로그도 이웃이 생겨요!</h3>
            <p className={styles.stepDesc}>
              모은 포인트로<br />내 블로그에 이웃을 요청해요
            </p>
          </div>
        </div>
      </section>

      {/* ── 포인트 설명 ── */}
      <section className={styles.points}>
        <h2 className={styles.sectionTitle}>포인트는 이렇게 쌓여요</h2>
        <div className={styles.pointGrid}>
          <div className={`${styles.pointCard} ${styles.pcGreen}`}>
            <span className={styles.pointEmoji}>🤝</span>
            <span className={styles.pointAction}>서로이웃 추가해주기</span>
            <span className={styles.pointValue}>+10 포인트</span>
          </div>
          <div className={`${styles.pointCard} ${styles.pcYellow}`}>
            <span className={styles.pointEmoji}>💛</span>
            <span className={styles.pointAction}>공감 눌러주기</span>
            <span className={styles.pointValue}>+3 포인트</span>
          </div>
          <div className={`${styles.pointCard} ${styles.pcPink}`}>
            <span className={styles.pointEmoji}>💬</span>
            <span className={styles.pointAction}>댓글 달아주기</span>
            <span className={styles.pointValue}>+5 포인트</span>
          </div>
        </div>
        <p className={styles.pointNote}>
          💡 포인트는 공짜로 받을 수 있어요. 절대 돈이 들지 않아요!
        </p>
      </section>

      {/* ── FAQ ── */}
      <section className={styles.faq}>
        <h2 className={styles.sectionTitle}>자주 묻는 질문</h2>
        <div className={styles.faqList}>
          {FAQS.map((f, i) => (
            <div key={i} className={styles.faqItem}>
              <div className={styles.faqQ}>Q. {f.q}</div>
              <div className={styles.faqA}>A. {f.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.cta}>
        <p className={styles.ctaText}>지금 바로 시작해 보세요!</p>
        <Link href="/login" className={styles.ctaBtn}>
          🌱 무료로 가입하기
        </Link>
      </section>

    </div>
  )
}

const FAQS = [
  {
    q: '컴퓨터를 잘 몰라도 할 수 있나요?',
    a: '네! 네이버 블로그만 있으면 누구나 할 수 있어요. 화면에 나오는 대로 따라하면 돼요.',
  },
  {
    q: '돈이 드나요?',
    a: '전혀 무료예요! 활동하면서 포인트를 쌓고 그 포인트를 쓰는 방식이에요.',
  },
  {
    q: '서로이웃 추가를 어떻게 인증하나요?',
    a: '서로이웃 신청 후 화면을 캡처(사진 찍기)해서 올려주시면 돼요. 어렵지 않아요!',
  },
  {
    q: '스팸 댓글이나 이상한 활동은 없나요?',
    a: '진짜 방문해서 활동한 것만 인정해요. 내 글에 내가 하는 건 안 되고, 진심 어린 활동만 포인트를 드려요.',
  },
]
