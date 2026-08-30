import { STAGES, type StageId } from '../stages'
import { Sparkles } from 'lucide-react'

interface SidebarProps {
  active: StageId
  onSelect: (id: StageId) => void
}

export default function Sidebar({ active, onSelect }: SidebarProps) {
  return (
    <aside className="flex h-dvh w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900">
      {/* 品牌 */}
      <div className="border-b border-zinc-800 px-5 py-5">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-rose-500/15 text-rose-400">
            <Sparkles className="size-4" />
          </span>
          <div>
            <h1 className="text-base font-semibold text-balance text-zinc-100">漫造</h1>
            <p className="text-xs text-zinc-500">AI 漫剧生成器</p>
          </div>
        </div>
      </div>

      {/* 管线导航 */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
          漫剧管线
        </p>
        <ul className="space-y-1">
          {STAGES.map((stage) => {
            const isActive = stage.id === active
            const Icon = stage.icon
            return (
              <li key={stage.id}>
                <button
                  onClick={() => onSelect(stage.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                    isActive
                      ? 'bg-zinc-800 text-zinc-100'
                      : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                  }`}
                >
                  <span
                    className={`flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-medium tabular-nums ${
                      isActive
                        ? 'bg-rose-500 text-white'
                        : 'bg-zinc-800 text-zinc-500 group-hover:text-zinc-300'
                    }`}
                  >
                    {stage.index}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="flex items-center gap-1.5 text-sm font-medium">
                      {stage.name}
                      {stage.highlight && (
                        <span className="rounded bg-rose-500/15 px-1 py-0.5 text-[10px] font-medium text-rose-400">
                          核心
                        </span>
                      )}
                    </span>
                    <span className="truncate text-[11px] text-zinc-500">{stage.pipeline}</span>
                  </span>
                  <Icon
                    className={`size-4 shrink-0 ${isActive ? 'text-rose-400' : 'text-zinc-600'}`}
                  />
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* 脚注 */}
      <div className="border-t border-zinc-800 px-5 py-3">
        <p className="text-[11px] leading-relaxed text-zinc-600">
          求职作品集 · 聚焦「一致性」难题
        </p>
      </div>
    </aside>
  )
}
