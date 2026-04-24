import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  collection,
  query,
  where,
  limit,
  getDocs,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { nanoid } from 'nanoid'
import { db } from './index'
import type { InvitationData } from '@/types'

type CreateInput = Omit<InvitationData, 'id' | 'createdAt' | 'viewCount' | 'meta' | 'manageCode' | 'expiresAt'>

/**
 * 초대장을 Firestore에 저장하고 생성된 ID와 관리 코드를 반환한다.
 * ID는 nanoid(10), 관리 코드는 nanoid(4).toUpperCase()로 생성한다.
 */
export async function createInvitation(data: CreateInput): Promise<{ id: string; manageCode: string }> {
  const id         = nanoid(10)
  const manageCode = nanoid(4).toUpperCase()
  const ref        = doc(db, 'invitations', id)

  // 무료: 행사일 + 7일 / 파싱 실패 시 생성일 기준 90일 fallback
  const eventDate = new Date(data.date)
  const expiresAt = isNaN(eventDate.getTime())
    ? Timestamp.fromDate(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000))
    : Timestamp.fromDate(new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate() + 7))

  try {
    await setDoc(ref, {
      category:     data.category,
      theme:        data.theme,
      name:         data.name,
      date:         data.date,
      time:         data.time,
      placeName:    data.placeName,
      placeAddress: data.placeAddress,
      ...(data.born        && { born:        data.born }),
      ...(data.eventType   && { eventType:   data.eventType }),
      ...(data.message     && { message:     data.message }),
      ...(data.deadline    && { deadline:    data.deadline }),
      ...(data.children    && { children:    data.children }),
      ...(data.features    && { features:    data.features }),
      manageCode,
      expiresAt,
      viewCount: 0,
      createdAt: serverTimestamp(),
    })
    return { id, manageCode }
  } catch (error) {
    throw new Error(
      `초대장 저장에 실패했습니다. ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

/** ID로 초대장을 조회한다. 존재하지 않으면 null을 반환한다. */
export async function getInvitation(id: string): Promise<InvitationData | null> {
  const ref = doc(db, 'invitations', id)

  try {
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    return { id: snap.id, ...(snap.data() as Omit<InvitationData, 'id'>) }
  } catch (error) {
    throw new Error(
      `초대장 조회에 실패했습니다. ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

/**
 * 관리 코드로 초대장 ID를 조회한다.
 * 일치하는 문서가 없으면 null을 반환한다.
 */
export async function findByManageCode(code: string): Promise<string | null> {
  try {
    const q    = query(collection(db, 'invitations'), where('manageCode', '==', code), limit(1))
    const snap = await getDocs(q)
    if (snap.empty) return null
    return snap.docs[0].id
  } catch (error) {
    throw new Error(
      `초대장 조회에 실패했습니다. ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

/** 조회수를 1 증가시킨다. */
export async function incrementViews(id: string): Promise<void> {
  const ref = doc(db, 'invitations', id)

  try {
    await updateDoc(ref, { viewCount: increment(1) })
  } catch (error) {
    throw new Error(
      `조회수 업데이트에 실패했습니다. ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}
