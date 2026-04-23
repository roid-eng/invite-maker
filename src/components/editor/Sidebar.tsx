'use client'

import ThemeSelector from './ThemeSelector'
import FeatureToggle from './FeatureToggle'
import type { InvitationState, ChildInfo, InvitationFeatures } from '@/types'

// ─── 행사 유형 옵션 ───────────────────────────────────────────
const EVENT_TYPE_OPTIONS = [
  { value: '七旬', label: '칠순 (七旬)' },
  { value: '還甲', label: '환갑 (還甲)' },
  { value: '八旬', label: '팔순 (八旬)' },
  { value: '古稀', label: '고희 (古稀)' },
]

// KST 기준 오늘 날짜 (date input min 속성용)
function todayKST(): string {
  const d = new Date(Date.now() + 9 * 60 * 60 * 1000)
  return d.toISOString().slice(0, 10)
}

// YYYY-MM-DD → "MM월 DD일까지 회신 부탁드립니다"
function formatDeadlinePreview(iso: string): string {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return iso
  return `${parseInt(match[2], 10)}월 ${parseInt(match[3], 10)}일까지 회신 부탁드립니다`
}

// ─── 내부 헬퍼 컴포넌트 ──────────────────────────────────────

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="mb-3.5 flex items-center gap-2">
      <span className="whitespace-nowrap font-dodum text-[11px] font-bold tracking-[3px] text-[#C4607A]">
        {children}
      </span>
      <div
        className="h-px flex-1"
        style={{ background: 'linear-gradient(to right, rgba(196,96,122,0.2), transparent)' }}
      />
    </div>
  )
}

const inputCls =
  'w-full rounded-lg border-[1.5px] border-[#E8D8D0] bg-[#FFFAF8] px-3 py-2 ' +
  'font-myeongjo text-[13px] text-[#2D1B1B] outline-none ' +
  'focus:border-[#E8899A] transition-colors duration-150'

// ─── Props ────────────────────────────────────────────────────
type Props = {
  state: InvitationState
  onChange: (updates: Partial<InvitationState>) => void
  /** 카카오 주소 검색 API 연동 시 사용 */
  onAddressSearch?: () => void
}

// ─── 컴포넌트 ─────────────────────────────────────────────────
export default function Sidebar({ state, onChange, onAddressSearch }: Props) {

  // 자녀 배열 변경 헬퍼
  const handleChildChange = (idx: number, field: keyof ChildInfo, val: string) => {
    const next = state.children.map((c, i) => (i === idx ? { ...c, [field]: val } : c))
    onChange({ children: next })
  }

  const addChild = () => {
    if (state.children.length >= 4) return
    onChange({ children: [...state.children, { role: '', name: '' }] })
  }

  const removeChild = (idx: number) => {
    onChange({ children: state.children.filter((_, i) => i !== idx) })
  }

  const handleFeatureChange = (key: keyof InvitationFeatures, value: boolean) => {
    onChange({ features: { ...state.features, [key]: value } })
  }

  return (
    <aside
      className="
        fixed inset-x-0 bottom-0 z-40 h-[60vh] overflow-y-auto
        border-t-2 border-[#E8D8D0] bg-white
        shadow-[0_-8px_40px_rgba(100,50,50,0.12)]
        [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
        md:relative md:inset-auto md:z-auto md:h-[calc(100vh-60px)]
        md:w-[320px] md:shrink-0 md:border-r md:border-t-0 md:shadow-none
      "
    >
      {/* 모바일 드래그 핸들 힌트 */}
      <div className="flex justify-center py-2 md:hidden">
        <div className="h-1 w-8 rounded-full bg-[#E8D8D0]" />
      </div>

      <div className="space-y-0 pb-10">

        {/* ── 1. 색상 테마 ── */}
        <section className="border-b border-[#F0E4DC] px-5 py-5">
          <SectionTitle>🎨 색상 테마</SectionTitle>
          <ThemeSelector value={state.theme} onChange={(t) => onChange({ theme: t })} />
        </section>

        {/* ── 2. 주인공 정보 ── */}
        <section className="border-b border-[#F0E4DC] px-5 py-5">
          <SectionTitle>👴 주인공 정보</SectionTitle>

          <div className="mb-3">
            <label className="mb-1 block font-dodum text-[11px] tracking-[1px] text-[#9E7070]">
              성 함 <span className="opacity-50">(최대 10자)</span>
            </label>
            <input
              type="text"
              value={state.name}
              onChange={(e) => onChange({ name: e.target.value.slice(0, 10) })}
              maxLength={10}
              placeholder="예) 김 복 순"
              className={inputCls}
            />
          </div>

          <div className="mb-3">
            <label className="mb-1 block font-dodum text-[11px] tracking-[1px] text-[#9E7070]">
              출생 정보
            </label>
            <input
              type="text"
              value={state.born}
              onChange={(e) => onChange({ born: e.target.value })}
              placeholder="예) 1955년생 · 만 70세"
              className={inputCls}
            />
          </div>

          <div>
            <label className="mb-1 block font-dodum text-[11px] tracking-[1px] text-[#9E7070]">
              행사 종류
            </label>
            <select
              value={state.eventType}
              onChange={(e) => onChange({ eventType: e.target.value })}
              className={inputCls}
            >
              {EVENT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </section>

        {/* ── 3. 초대 문구 ── */}
        <section className="border-b border-[#F0E4DC] px-5 py-5">
          <SectionTitle>✍️ 초대 문구</SectionTitle>
          <label className="mb-1 block font-dodum text-[11px] tracking-[1px] text-[#9E7070]">
            메시지 <span className="opacity-50">({state.message.length}/100자)</span>
          </label>
          <textarea
            value={state.message}
            onChange={(e) => onChange({ message: e.target.value.slice(0, 100) })}
            maxLength={100}
            rows={4}
            placeholder="초대 문구를 입력해 주세요"
            className={`${inputCls} resize-none leading-[1.7]`}
          />
        </section>

        {/* ── 4. 행사 정보 ── */}
        <section className="border-b border-[#F0E4DC] px-5 py-5">
          <SectionTitle>📅 행사 정보</SectionTitle>

          {[
            { label: '날 짜', type: 'date', key: 'date', min: todayKST() },
            { label: '시 간', type: 'time', key: 'time' },
          ].map(({ label, type, key, min }) => (
            <div key={key} className="mb-3">
              <label className="mb-1 block font-dodum text-[11px] tracking-[1px] text-[#9E7070]">{label}</label>
              <input
                type={type}
                value={state[key as 'date' | 'time']}
                onChange={(e) => onChange({ [key]: e.target.value })}
                min={min}
                className={inputCls}
              />
            </div>
          ))}

          <div className="mb-3">
            <label className="mb-1 block font-dodum text-[11px] tracking-[1px] text-[#9E7070]">
              장소명 <span className="opacity-50">(최대 20자)</span>
            </label>
            <input
              type="text"
              value={state.placeName}
              onChange={(e) => onChange({ placeName: e.target.value.slice(0, 20) })}
              maxLength={20}
              placeholder="예) 그랜드 한식당 2층 연회홀"
              className={inputCls}
            />
          </div>

          <div className="mb-3">
            <label className="mb-1 block font-dodum text-[11px] tracking-[1px] text-[#9E7070]">
              장소 주소
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={state.placeAddress}
                onChange={(e) => onChange({ placeAddress: e.target.value })}
                readOnly={!!onAddressSearch}
                placeholder="주소를 검색해 주세요"
                className={`${inputCls} flex-1`}
              />
              {onAddressSearch && (
                <button
                  type="button"
                  onClick={onAddressSearch}
                  className="shrink-0 rounded-lg border-[1.5px] border-[#C4607A] px-3 py-2
                             font-dodum text-[11px] text-[#C4607A] transition-colors
                             hover:bg-[#FDE8EC]"
                >
                  검색
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block font-dodum text-[11px] tracking-[1px] text-[#9E7070]">
              RSVP 마감일
            </label>
            <input
              type="date"
              value={state.deadline}
              onChange={(e) => onChange({ deadline: e.target.value })}
              min={todayKST()}
              className={inputCls}
            />
            {state.deadline && (
              <p className="mt-1 font-dodum text-[10px] text-[#9E7070] opacity-60">
                ※ {formatDeadlinePreview(state.deadline)}
              </p>
            )}
          </div>
        </section>

        {/* ── 5. 자녀 정보 (최대 4명) ── */}
        <section className="border-b border-[#F0E4DC] px-5 py-5">
          <SectionTitle>👨‍👩‍👧 자녀 정보</SectionTitle>

          {state.children.map((child, idx) => (
            <div key={idx} className="mb-2 flex items-center gap-2">
              <input
                type="text"
                dir="ltr"
                value={child.role}
                onChange={(e) => handleChildChange(idx, 'role', e.target.value)}
                placeholder="역할"
                className="w-16 shrink-0 rounded border border-[#E8D8D0] bg-[#FFFAF8]
                           px-2 py-1.5 font-myeongjo text-[13px] text-[#2D1B1B]
                           caret-[#2D1B1B] outline-none focus:border-[#E8899A]"
              />
              <input
                type="text"
                dir="ltr"
                value={child.name}
                onChange={(e) => handleChildChange(idx, 'name', e.target.value)}
                placeholder="이름"
                className="min-w-0 flex-1 rounded border border-[#E8D8D0] bg-[#FFFAF8]
                           px-2 py-1.5 font-myeongjo text-[13px] text-[#2D1B1B]
                           caret-[#2D1B1B] outline-none focus:border-[#E8899A]"
              />
              <button
                type="button"
                onClick={() => removeChild(idx)}
                aria-label={`${idx + 1}번째 자녀 삭제`}
                className="shrink-0 rounded-lg border border-[#E8D8D0] px-2.5 py-1.5
                           text-[#9E7070] transition-colors hover:border-red-200 hover:text-red-400"
              >
                ✕
              </button>
            </div>
          ))}

          {state.children.length < 4 && (
            <button
              type="button"
              onClick={addChild}
              className="mt-1 w-full rounded-lg border border-dashed border-[#E8D8D0]
                         py-2 font-dodum text-[12px] text-[#9E7070]
                         transition-colors hover:border-[#C4607A] hover:text-[#C4607A]"
            >
              + 자녀 추가
            </button>
          )}
        </section>

        {/* ── 6. 기능 설정 ── */}
        <section className="px-5 py-5">
          <SectionTitle>⚙️ 기능 설정</SectionTitle>
          <FeatureToggle features={state.features} onChange={handleFeatureChange} />
        </section>

      </div>
    </aside>
  )
}
