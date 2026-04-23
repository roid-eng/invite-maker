'use client'

import { useCallback, useEffect, useReducer, useRef } from 'react'
import type {
  Category,
  ChildInfo,
  InvitationFeatures,
  InvitationState,
  Theme,
} from '@/types'

// ─── 초기 상태 (칠순 샘플 데이터) ────────────────────────────
const INITIAL_STATE: InvitationState = {
  category:     'chilsung',
  theme:        'rose',
  name:         '김 복 순',
  born:         '1955년생 · 만 70세',
  eventType:    '七旬',
  message:
    '살아온 날들의 무게만큼\n깊어진 사랑과 지혜로\n어머니의 칠순을 맞이하여\n\n그 귀한 날을 함께 나누고자\n삼가 모시옵나이다.',
  date:         '',
  time:         '',
  placeName:    '',
  placeAddress: '',
  deadline:     '',
  children: [
    { role: '장 남', name: '김민준' },
    { role: '장 녀', name: '김지영' },
  ],
  features: {
    showMap:    true,
    showRsvp:   true,
    showFamily: true,
    showPetals: true,
  },
}

// ─── 액션 타입 ────────────────────────────────────────────────

// SET_FIELD: 키–값 쌍의 타입 대응을 유지하는 분산 유니온
type SetFieldAction = {
  [K in keyof InvitationState]: { type: 'SET_FIELD'; key: K; value: InvitationState[K] }
}[keyof InvitationState]

type Action =
  | SetFieldAction
  | { type: 'SET_THEME';    theme: Theme }
  | { type: 'SET_FEATURE';  key: keyof InvitationFeatures; value: boolean }
  | { type: 'ADD_CHILD' }
  | { type: 'REMOVE_CHILD'; index: number }
  | { type: 'RESET';        category?: Category }

// ─── Reducer ──────────────────────────────────────────────────
function reducer(state: InvitationState, action: Action): InvitationState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.key]: action.value }

    case 'SET_THEME':
      return { ...state, theme: action.theme }

    case 'SET_FEATURE':
      return { ...state, features: { ...state.features, [action.key]: action.value } }

    case 'ADD_CHILD':
      if (state.children.length >= 4) return state
      return { ...state, children: [...state.children, { role: '', name: '' }] }

    case 'REMOVE_CHILD':
      return {
        ...state,
        children: state.children.filter((_, i) => i !== action.index),
      }

    case 'RESET':
      return { ...INITIAL_STATE, category: action.category ?? state.category }

    default:
      return state
  }
}

// ─── localStorage 유틸 ────────────────────────────────────────
const storageKey = (category: Category) => `invite_maker_draft_${category}`

function loadFromStorage(category: Category): InvitationState {
  if (typeof window === 'undefined') {
    return { ...INITIAL_STATE, category }
  }
  try {
    const raw = localStorage.getItem(storageKey(category))
    if (!raw) return { ...INITIAL_STATE, category }

    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) {
      return { ...INITIAL_STATE, category }
    }
    // INITIAL_STATE와 merge: 스키마 변경 시 신규 필드에 기본값 보장
    return { ...INITIAL_STATE, ...(parsed as Partial<InvitationState>), category }
  } catch {
    return { ...INITIAL_STATE, category }
  }
}

function saveToStorage(state: InvitationState): void {
  try {
    localStorage.setItem(storageKey(state.category), JSON.stringify(state))
  } catch {
    // 저장 실패 무시 (스토리지 용량 초과 등)
  }
}

// ─── 반환 타입 ────────────────────────────────────────────────
export type UseInvitationReturn = {
  state: InvitationState
  dispatch: React.Dispatch<Action>
  // 편의 함수
  setTheme: (theme: Theme) => void
  setField: <K extends keyof InvitationState>(key: K, value: InvitationState[K]) => void
  toggleFeature: (key: keyof InvitationFeatures) => void
  // Sidebar의 onChange 시그니처와 일치
  update: (updates: Partial<InvitationState>) => void
  // 자녀 배열 전용 (Sidebar에서 직접 사용 가능)
  addChild: () => void
  removeChild: (index: number) => void
  updateChild: (index: number, field: keyof ChildInfo, value: string) => void
  reset: () => void
}

// ─── Hook ─────────────────────────────────────────────────────
export function useInvitation(category: Category = 'chilsung'): UseInvitationReturn {
  const [state, dispatch] = useReducer(
    reducer,
    category,
    loadFromStorage, // lazy init: SSR 포함 첫 렌더 시에만 호출
  )

  // 카테고리 prop 변경 감지 → RESET (라우트 이동 시 대비)
  const prevCategoryRef = useRef(category)
  useEffect(() => {
    if (prevCategoryRef.current !== category) {
      prevCategoryRef.current = category
      dispatch({ type: 'RESET', category })
    }
  }, [category])

  // 상태 변경 시 localStorage 자동 저장
  useEffect(() => {
    saveToStorage(state)
  }, [state])

  // ─── 편의 함수 ─────────────────────────────────────────────
  const setTheme = useCallback(
    (theme: Theme) => dispatch({ type: 'SET_THEME', theme }),
    [],
  )

  const setField = useCallback(
    <K extends keyof InvitationState>(key: K, value: InvitationState[K]) =>
      dispatch({ type: 'SET_FIELD', key, value } as SetFieldAction),
    [],
  )

  const toggleFeature = useCallback(
    (key: keyof InvitationFeatures) =>
      dispatch({ type: 'SET_FEATURE', key, value: !state.features[key] }),
    [state.features],
  )

  // Partial<InvitationState>를 받아 SET_FIELD를 순차 dispatch
  // React 18 automatic batching으로 단일 리렌더 보장
  const update = useCallback((updates: Partial<InvitationState>) => {
    for (const k of Object.keys(updates) as Array<keyof InvitationState>) {
      const v = updates[k]
      if (v !== undefined) {
        // k와 v의 쌍이 Partial<InvitationState>에서 왔으므로 타입 안전
        dispatch({ type: 'SET_FIELD', key: k, value: v } as SetFieldAction)
      }
    }
  }, [])

  const addChild = useCallback(
    () => dispatch({ type: 'ADD_CHILD' }),
    [],
  )

  const removeChild = useCallback(
    (index: number) => dispatch({ type: 'REMOVE_CHILD', index }),
    [],
  )

  const updateChild = useCallback(
    (index: number, field: keyof ChildInfo, value: string) => {
      const next = state.children.map((c, i) =>
        i === index ? { ...c, [field]: value } : c,
      )
      dispatch({ type: 'SET_FIELD', key: 'children', value: next })
    },
    [state.children],
  )

  const reset = useCallback(
    () => dispatch({ type: 'RESET', category }),
    [category],
  )

  return {
    state,
    dispatch,
    setTheme,
    setField,
    toggleFeature,
    update,
    addChild,
    removeChild,
    updateChild,
    reset,
  }
}
