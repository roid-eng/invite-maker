import {
  collection,
  addDoc,
  getCountFromServer,
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
