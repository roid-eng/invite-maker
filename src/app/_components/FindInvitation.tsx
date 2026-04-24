'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { findByManageCode } from '@/lib/firebase/invitations'

export default function FindInvitation() {
  const router = useRouter()
  const [code,    setCode]    = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleFind = async () => {
    if (code.length !== 4 || loading) return
    setError('')
    setLoading(true)
    try {
      const id = await findByManageCode(code.toUpperCase())
      if (!id) { setError('코드를 다시 확인해 주세요.'); return }
      router.push(`/preview/${id}`)
    } catch {
      setError('조회 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="px-4 pb-12">
      <div className="mx-auto max-w-lg rounded-3xl border border-[#F0DDE4] bg-white p-6
                      shadow-[0_2px_12px_rgba(196,96,122,0.07)]">
        <p className="mb-1 text-center font-myeongjo text-[15px] font-bold text-[#3B0A1F]">
          이미 만든 초대장이 있으신가요?
        </p>
        <p className="mb-5 text-center font-dodum text-[11px] tracking-wide text-[#C0A0AA]">
          관리 코드 4자리를 입력하면 초대장을 다시 찾을 수 있어요
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            maxLength={4}
            placeholder="예: A3K9"
            onChange={(e) => {
              setCode(e.target.value.toUpperCase())
              setError('')
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleFind()}
            className="flex-1 rounded-2xl border border-[#E8D8D0] bg-[#FFF5F7]
                       px-4 py-3 text-center font-myeongjo text-[20px] font-bold
                       tracking-[6px] text-[#C4607A] outline-none
                       focus:border-[#C4607A] focus:ring-2 focus:ring-[#C4607A]/20"
          />
          <button
            type="button"
            onClick={handleFind}
            disabled={code.length !== 4 || loading}
            className="flex items-center gap-1.5 rounded-2xl bg-[#C4607A] px-5
                       font-myeongjo text-[13px] font-bold text-white
                       shadow-[0_4px_14px_rgba(196,96,122,0.3)]
                       transition-all hover:bg-[#B0506A]
                       disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <span className="inline-block h-4 w-4 rounded-full border-2
                               border-white/30 border-t-white animate-spin" />
            ) : '찾기'}
          </button>
        </div>

        {error && (
          <p className="mt-3 text-center font-dodum text-[12px] text-red-500">{error}</p>
        )}
      </div>
    </section>
  )
}
