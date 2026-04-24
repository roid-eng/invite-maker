import {
  collection,
  addDoc,
  getCountFromServer,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './index'
import type { RsvpResponse } from '@/types'

type SubmitInput = Omit<RsvpResponse, 'id' | 'createdAt'>

const rsvpCollection = (invitationId: string) =>
  collection(db, 'invitations', invitationId, 'rsvps')

/** RSVP 응답을 서브컬렉션에 저장하고 생성된 문서 ID를 반환한다. */
export async function submitRsvp(
  invitationId: string,
  response: SubmitInput,
): Promise<string> {
  try {
    const ref = await addDoc(rsvpCollection(invitationId), {
      ...response,
      createdAt: serverTimestamp(),
    })
    return ref.id
  } catch (error) {
    throw new Error(
      `참석 응답 저장에 실패했습니다. ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

/** 해당 초대장의 RSVP 응답 수를 반환한다. */
export async function getRsvpCount(invitationId: string): Promise<number> {
  try {
    const snap = await getCountFromServer(rsvpCollection(invitationId))
    return snap.data().count
  } catch (error) {
    throw new Error(
      `참석 응답 수 조회에 실패했습니다. ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

export type RsvpStats = { attend: number; absent: number }

/**
 * RSVP 참석/불참 인원을 실시간으로 구독한다.
 * count 필드(인원 수)를 합산하므로 응답 건수가 아닌 실제 인원 기준이다.
 * @returns 구독 해제 함수
 */
export function subscribeRsvpStats(
  invitationId: string,
  onUpdate: (stats: RsvpStats) => void,
): () => void {
  return onSnapshot(rsvpCollection(invitationId), (snap) => {
    let attend = 0
    let absent = 0
    snap.docs.forEach((d) => {
      const r = d.data() as RsvpResponse
      if (r.type === 'attend') attend += r.count
      else absent += r.count
    })
    onUpdate({ attend, absent })
  })
}
