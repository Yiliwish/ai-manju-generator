interface RoomSchematicProps {
  /** 0 = 几何锁定，1 = 完全漂移 */
  drift?: number
  label?: string
}

/** 房间示意（正面视图）：门 / 窗 / 桌子，用 drift 表现空间漂移 */
export default function RoomSchematic({ drift = 0, label }: RoomSchematicProps) {
  const d = Math.max(0, Math.min(1, drift))

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg viewBox="0 0 200 150" className="w-full" aria-hidden="true">
        {/* 后墙 */}
        <rect x="10" y="10" width="180" height="120" className="fill-zinc-800" />
        {/* 地板 */}
        <rect x="10" y="130" width="180" height="12" className="fill-zinc-700" />
        {/* 门 */}
        <rect x={18 + d * 34} y="38" width="26" height="92" className="fill-zinc-600" />
        <circle cx={22 + d * 34} cy="84" r="2.5" className="fill-zinc-400" />
        {/* 窗 */}
        <rect x={138 - d * 34} y="34" width="38" height="34" className="fill-zinc-700" />
        <rect x={143 - d * 34} y="39" width="28" height="24" className="fill-zinc-600" />
        {/* 桌子 */}
        <rect x={70 + d * 26} y="108" width="52" height="8" className="fill-zinc-700" />
        <rect x={76 + d * 26} y="116" width="5" height="14" className="fill-zinc-700" />
        <rect x={111 + d * 26} y="116" width="5" height="14" className="fill-zinc-700" />
      </svg>
      {label && <span className="text-[11px] text-zinc-500">{label}</span>}
    </div>
  )
}
