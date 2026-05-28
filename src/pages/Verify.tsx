import { useEffect, useState } from 'react'
import { useLocation, useParams, Link } from 'wouter'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { MISSION_EMOJI, MISSION_LABELS } from '../types'
import type { Mission, MissionType } from '../types'
import styles from './Verify.module.css'

export default function Verify() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [, setLocation] = useLocation()

  const [mission, setMission]   = useState<Mission | null>(null)
  const [file, setFile]         = useState<File | null>(null)
  const [preview, setPreview]   = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError]       = useState('')
  const [done, setDone]         = useState(false)

  useEffect(() => {
    if (!id) return
    async function load() {
      try {
        const { data } = await supabase
          .from('missions')
          .select('*')
          .eq('id', id)
          .single()
        setMission(data as Mission)
      } catch {
        setMission(null)
      } finally {
        setFetching(false)
      }
    }
    load()
  }, [id])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!file)    { setError('스크린샷을 먼저 올려주세요.'); return }
    if (!user)    { setError('로그인이 필요해요.'); return }
    if (!mission) { setError('미션 정보를 찾을 수 없어요.'); return }

    setLoading(true)
    try {
      // 1. Supabase Storage에 스크린샷 업로드
      const ext      = file.name.split('.').pop()
      const filePath = `${user.id}/${id}_${Date.now()}.${ext}`

      const { error: uploadErr } = await supabase.storage
        .from('screenshots')
        .upload(filePath, file, { upsert: true })
      if (uploadErr) throw uploadErr

      // 2. 공개 URL 가져오기
      const { data: urlData } = supabase.storage
        .from('screenshots')
        .getPublicUrl(filePath)

      // 3. completions 테이블에 인증 등록
      const { error: compErr } = await supabase.from('completions').insert({
        mission_id:     mission.id,
        user_id:        user.id,
        screenshot_url: urlData.publicUrl,
        status:         'pending',
      })
      if (compErr) throw compErr

      // 4. 미션 done_count 증가 + 완료 시 status → done 자동 처리
      const newDoneCount = mission.done_count + 1
      const isCompleted  = newDoneCount >= mission.total_count
      const { error: missionErr } = await supabase
        .from('missions')
        .update({
          done_count: newDoneCount,
          ...(isCompleted ? { status: 'done' } : {}),
        })
        .eq('id', mission.id)
      if (missionErr) throw missionErr

      // 포인트는 관리자 승인 시 지급 (Admin.tsx approve()에서 처리)

      setDone(true)
    } catch (err: unknown) {
      const msg = (err as Error).message || ''
      if (msg.includes('duplicate') || msg.includes('unique')) {
        setError('이미 이 미션을 완료하셨어요! 다른 미션을 수행해 주세요.')
      } else {
        setError('제출 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.')
      }
    } finally {
      setLoading(false)
    }
  }

  // 완료 화면
  if (done) return (
    <div className={styles.doneWrap}>
      <div className={styles.doneEmoji}>🎉</div>
      <h2 className={styles.doneTitle}>인증 완료!</h2>
      <p className={styles.doneDesc}>
        인증이 접수됐어요!<br />
        관리자 확인 후 승인되면 포인트가 지급돼요 😊
      </p>
      <div className={styles.doneBtns}>
        <button className={styles.doneBtn} onClick={() => setLocation('/missions')}>
          📋 다른 미션 수행하기
        </button>
        <button className={`${styles.doneBtn} ${styles.doneBtnGray}`} onClick={() => setLocation('/dashboard')}>
          🏠 내 현황 보기
        </button>
      </div>
    </div>
  )

  if (fetching) return (
    <div className={styles.center}>
      <span style={{ fontSize: 48 }}>⏳</span>
      <p>미션 불러오는 중이에요...</p>
    </div>
  )

  if (!mission) return (
    <div className={styles.center}>
      <span style={{ fontSize: 48 }}>😅</span>
      <p>미션을 찾을 수 없어요.</p>
      <button className={styles.doneBtn} onClick={() => setLocation('/missions')}>
        미션 목록으로
      </button>
    </div>
  )

  const mType = mission.type as MissionType

  return (
    <div className={styles.wrap}>
      <Link href="/missions" className="back-btn">← 미션 목록으로 돌아가기</Link>
      <div className={styles.missionBox}>
        <div className={`${styles.typeBadge} ${styles['type_' + mission.type]}`}>
          {MISSION_EMOJI[mType]} {MISSION_LABELS[mType]}
        </div>
        <a href={mission.blog_url} target="_blank" rel="noreferrer" className={styles.blogUrl}>
          🔗 {mission.blog_url}
        </a>
        <div className={styles.pointInfo}>
          이 미션 완료 시 <strong>⭐ +{mission.points} 포인트</strong> 적립!
        </div>
      </div>

      {/* 단계 안내 */}
      <div className={styles.guide}>
        <h2 className={styles.guideTitle}>📌 이렇게 하면 돼요!</h2>
        <div className={styles.guideSteps}>
          <div className={styles.guideStep}>
            <span className={styles.guideNum}>1</span>
            <div>
              <strong>위 블로그 주소를 클릭</strong>해서 방문해 주세요
            </div>
          </div>
          <div className={styles.guideStep}>
            <span className={styles.guideNum}>2</span>
            <div>
              {mType === 'neighbor' && <><strong>서로이웃 신청</strong> 버튼을 눌러주세요</>}
              {mType === 'like'     && <>블로그 글에 <strong>공감♥</strong> 버튼을 눌러주세요</>}
              {mType === 'comment'  && <>블로그 글에 <strong>댓글을 30자 이상</strong> 달아주세요</>}
            </div>
          </div>
          <div className={styles.guideStep}>
            <span className={styles.guideNum}>3</span>
            <div>
              활동한 화면을 <strong>캡처(사진 찍기)</strong>해 주세요
            </div>
          </div>
          <div className={styles.guideStep}>
            <span className={styles.guideNum}>4</span>
            <div>
              아래에 <strong>캡처 사진을 올리고</strong> 제출 버튼을 눌러주세요
            </div>
          </div>
        </div>
      </div>

      {/* 업로드 폼 */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.formTitle}>📸 캡처 사진 올리기</h2>

        <label className={styles.uploadArea}>
          {preview ? (
            <img src={preview} alt="미리보기" className={styles.preview} />
          ) : (
            <div className={styles.uploadPlaceholder}>
              <span className={styles.uploadEmoji}>📁</span>
              <span className={styles.uploadText}>여기를 눌러서 사진을 선택해 주세요</span>
              <span className={styles.uploadSub}>JPG, PNG, GIF 파일 가능해요</span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            className={styles.fileInput}
            onChange={handleFileChange}
          />
        </label>

        {preview && (
          <button
            type="button"
            className={styles.reuploadBtn}
            onClick={() => { setFile(null); setPreview(null) }}
          >
            🔄 다른 사진으로 바꾸기
          </button>
        )}

        {error && <div className={styles.error}>⚠️ {error}</div>}

        <button
          className={styles.submitBtn}
          type="submit"
          disabled={loading || !file}
        >
          {loading ? '제출 중...' : '✅ 인증 제출하기'}
        </button>
      </form>

    </div>
  )
}
