import { Link } from 'wouter'
import styles from './Landing.module.css'

const worlds = [
  { code: '01', name: '체험단', title: '경험하고, 발견하고', description: '좋은 제품과 공간을 먼저 만나고 솔직한 경험을 나눠요.', color: 'mint', character: '/characters/pumi-guide.png', guide: '푸미' },
  { code: '02', name: '퍼블리', title: '아이디어를 콘텐츠로', description: '글·사진·영상이 필요한 사람과 만드는 사람이 만나요.', color: 'coral', character: '/characters/bori-cheer.png', guide: '보리' },
  { code: '03', name: '온파트너', title: '혼자보다 함께 빠르게', description: '작은 업무부터 긴 협업까지 믿을 수 있는 파트너를 찾아요.', color: 'sand', character: '/characters/dodo-checker.png', guide: '도도' },
  { code: '04', name: '온종일팜', title: '생산자와 일상을 연결', description: '농장의 이야기와 제철 먹거리, 필요한 일손을 가까이 연결해요.', color: 'gold', character: '/characters/monggeul-explorer.png', guide: '몽글' },
]

const activities = [
  ['EXPERIENCE', '새로운 경험', '체험하고 후기를 남겨요'],
  ['CREATE', '콘텐츠 만들기', '글·사진·영상을 함께 만들어요'],
  ['CONNECT', '파트너 연결', '필요한 일과 재능을 이어줘요'],
  ['GROW', '같이 키우기', '상품과 브랜드의 성장을 도와요'],
]

const friends = [
  { name: '푸미', role: '당신에게 맞는 시작을 찾아요', image: '/characters/pumi-guide.png', color: 'green' },
  { name: '몽글', role: '새로운 기회를 먼저 발견해요', image: '/characters/monggeul-explorer.png', color: 'brown' },
  { name: '도도', role: '약속과 인증을 꼼꼼히 챙겨요', image: '/characters/dodo-checker.png', color: 'cream' },
  { name: '보리', role: '작은 참여도 크게 응원해요', image: '/characters/bori-cheer.png', color: 'gold' },
]

export default function Landing() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroGrid} aria-hidden="true" />
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}><span /> A NETWORK MADE OF PEOPLE</p>
            <h1>필요한 사람과<br /><em>재미있는 일이</em><br />서로 만나는 곳.</h1>
            <p className={styles.lead}>체험하고, 만들고, 돕고, 함께 성장하는 모든 순간.<br />서로 다른 사람들이 가볍게 연결되는 새로운 참여 커뮤니티예요.</p>
            <div className={styles.heroActions}><Link href="/login" className={styles.primary}>내게 맞는 일 찾기 <span>↗</span></Link><a href="#worlds" className={styles.secondary}>네 개의 월드 보기</a></div>
            <div className={styles.promise}><span>● 경험하는 사람</span><span>● 만드는 사람</span><span>● 키우는 사람</span></div>
          </div>
          <div className={styles.heroVisual} aria-label="서로의 안내 캐릭터 푸미">
            <div className={styles.visualLabel}>YOUR FIRST GUIDE · PUMI</div>
            <div className={styles.heroSpeech}><b>무엇을 하고 싶어?</b><span>관심사만 알려주면 딱 맞는 월드로 데려다줄게!</span></div>
            <div className={styles.heroHalo} />
            <img className={styles.heroCharacter} src="/characters/pumi-guide.png" alt="참여 활동을 안내하는 3D 캐릭터 푸미" width="750" height="900" />
            <div className={styles.activityTicker}><i /> 지금 42명이 새로운 연결을 시작했어요</div>
          </div>
        </div>
      </section>

      <section className={styles.statement}><p>가입하고 구경만 하는 커뮤니티가 아니라</p><h2>누구나 주인공이 되는 참여의 놀이터.</h2></section>

      <section className={styles.worlds} id="worlds">
        <header><div><span className={styles.eyebrow}>CHOOSE YOUR WORLD</span><h2>오늘은 어떤 세계로<br />들어가 볼까요?</h2></div><p>하나만 고를 필요는 없어요.<br />관심이 움직이는 대로 월드를 오가세요.</p></header>
        <div className={styles.worldGrid}>
          {worlds.map(world => <article key={world.name} className={`${styles.worldCard} ${styles[world.color]}`}><div className={styles.worldTop}><span>{world.code}</span><b>{world.name}</b></div><div className={styles.worldCopy}><h3>{world.title}</h3><p>{world.description}</p></div><img src={world.character} alt={`${world.name} 월드를 안내하는 ${world.guide}`} width="750" height="900" loading="lazy" /><Link href="/login" aria-label={`${world.name} 월드 둘러보기`}>월드 둘러보기 <span>↗</span></Link></article>)}
        </div>
      </section>

      <section className={styles.activityBand}>
        {activities.map((activity, index) => <article key={activity[0]}><span>{String(index + 1).padStart(2, '0')} · {activity[0]}</span><h3>{activity[1]}</h3><p>{activity[2]}</p></article>)}
      </section>

      <section className={styles.friendsSection}>
        <div className={styles.friendsTitle}><span className={styles.eyebrow}>MEET THE GUIDES</span><h2>길을 잃을 틈 없이<br />친구들이 나타나요.</h2><p>설명서 대신 캐릭터와 대화하듯<br />다음 할 일을 발견해 보세요.</p></div>
        <div className={styles.friendGrid}>{friends.map(friend => <article key={friend.name} className={`${styles.friendCard} ${styles[friend.color]}`}><div className={styles.friendBubble}>{friend.role}</div><img src={friend.image} alt={`${friend.name} 3D 캐릭터`} width="750" height="900" loading="lazy" /><div><strong>{friend.name}</strong><span>{friend.role}</span></div></article>)}</div>
      </section>

      <section className={styles.how} id="how">
        <div className={styles.howIntro}><span className={styles.eyebrow}>ONE PROFILE, MANY WORLDS</span><h2>한 번 연결하고,<br />하고 싶은 일을 모두.</h2><p>사용자마다 다른 참여 기록과 신뢰가 하나의 프로필에 쌓여요.</p><Link href="/login" className={styles.textLink}>내 프로필 시작하기 →</Link></div>
        <ol className={styles.stepList}><li><span>01</span><div><h3>관심사를 선택해요</h3><p>체험·콘텐츠·협업·농장 중 마음 가는 것을 골라요.</p></div></li><li><span>02</span><div><h3>오늘의 퀘스트를 만나요</h3><p>지금 참여할 수 있는 작고 재미있는 일이 도착해요.</p></div></li><li><span>03</span><div><h3>경험과 재능을 나눠요</h3><p>참여를 완료하고 서로에게 도움이 된 순간을 기록해요.</p></div></li><li><span>04</span><div><h3>나만의 신뢰가 자라요</h3><p>활동 기록이 다음 기회와 새로운 파트너로 이어져요.</p></div></li></ol>
      </section>

      <section className={styles.trust}><img src="/characters/dodo-checker.png" alt="안전한 연결을 돕는 도도" width="600" height="900" loading="lazy" /><div><div className={styles.trustMark}>“</div><blockquote>사람과 사람 사이에<br />좋은 일이 흐르도록.</blockquote><p>도도가 활동 인증과 약속을 챙기고, 모든 월드의 참여 기록을 투명하게 연결해요.</p></div></section>
      <section className={styles.finalCta}><div><span>WHAT WILL YOU DO TODAY?</span><h2>구경하는 사람에서, 참여하는 사람으로.</h2></div><Link href="/login">내 월드 찾기 <span>↗</span></Link></section>
    </div>
  )
}
