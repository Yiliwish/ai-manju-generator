import type { Stage } from '../stages'

interface StageHeaderProps {
  stage: Stage
}

export default function StageHeader({ stage }: StageHeaderProps) {
  return (
    <header className="border-b border-zinc-800 px-8 py-5">
      <div className="flex items-baseline gap-3">
        <span className="text-sm font-medium text-rose-400 tabular-nums">{stage.index} / 7</span>
        <h2 className="text-xl font-semibold text-balance text-zinc-100">{stage.name}</h2>
        <span className="rounded-full border border-zinc-800 px-2 py-0.5 text-xs text-zinc-500">
          {stage.pipeline}
        </span>
        {stage.highlight && (
          <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-xs font-medium text-rose-400">
            一致性核心
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-pretty text-zinc-500">{stage.subtitle}</p>
    </header>
  )
}
