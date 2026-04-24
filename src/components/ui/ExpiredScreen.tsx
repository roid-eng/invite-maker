export default function ExpiredScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5EDE8] px-6 text-center">
      <p className="text-[40px]">📭</p>
      <p className="mt-4 font-myeongjo text-[20px] font-extrabold text-[#3B0A1F]">
        이 초대장은 만료되었습니다
      </p>
      <p className="mt-2 font-dodum text-[13px] leading-relaxed text-[#9E7070]">
        무료 초대장은 행사일 기준 7일 후 자동 만료됩니다.<br />
        프리미엄 플랜은 1년간 유지됩니다.
      </p>
      <a
        href="/"
        className="mt-8 rounded-2xl bg-[#C4607A] px-6 py-3 font-myeongjo
                   text-[14px] font-bold text-white
                   shadow-[0_4px_14px_rgba(196,96,122,0.3)]
                   transition-opacity hover:opacity-90"
      >
        새 초대장 만들기
      </a>
    </div>
  )
}
