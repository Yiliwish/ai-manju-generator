import { Clock, LayoutGrid } from 'lucide-react'
import StageHeader from '../components/StageHeader'
import { exampleProject } from '../data/exampleProject'
import { STAGES } from '../stages'
import type { ShotType } from '../types'

const sceneName = (id: string) =>
  exampleProject.scenes.find((s) => s.id === id)?.name ?? id

const charName = (id: string) =>
  exampleProject.characters.find((c) => c.id === id)?.name ?? id

const typeBadge: Record<ShotType, string> = {
  对白: 'bg-sky-500/15 text-sky-400',
  旁白: 'bg-amber-500/15 text-amber-400',
  动作: 'bg-rose-500/15 text-rose-400',
  空镜: 'bg-zinc-500/15 text-zinc-400',
}

export default function StoryboardStage() {
  const stage = STAGES.find((s) => s.id === 'storyboard')!
  const total = exampleProject.shots.reduce((sum, s) => sum + s.duration, 0)

  return (
    <div className="flex h-full flex-col">
      <StageHeader stage={stage} />

      <div className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-4xl">
          {/* 汇总 */}
          <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4">
            <span className="flex items-center gap-2 text-sm text-zinc-300">
              <LayoutGrid className="size-4 text-zinc-500" />
              <span className="font-medium tabular-nums">{exampleProject.shots.length}</span>
              镜
            </span>
            <span className="flex items-center gap-2 text-sm text-zinc-300">
              <Clock className="size-4 text-zinc-500" />
              <span className="font-medium tabular-nums">{total}</span> 秒
            </span>
            <span className="ml-auto text-xs text-zinc-500">
              AI 已按场景、角色、对白自动拆解
            </span>
          </div>

          {/* 镜头列表 */}
          <ol className="space-y-3">
            {exampleProject.shots.map((shot) => (
              <li
                key={shot.id}
                className="group rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:border-zinc-700"
              >
                <div className="flex items-start gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-sm font-semibold text-zinc-200 tabular-nums">
                    {shot.id}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeBadge[shot.type]}`}
                      >
                        {shot.type}
                      </span>
                      <span className="rounded-full border border-zinc-800 px-2 py-0.5 text-xs text-zinc-500">
                        {sceneName(shot.sceneId)}
                      </span>
                      <span className="text-xs text-zinc-500 tabular-nums">{shot.duration}s</span>
                      {shot.characters.length > 0 && (
                        <span className="rounded-full border border-zinc-800 px-2 py-0.5 text-xs text-zinc-500">
                          {shot.characters.map(charName).join('、')}
                        </span>
                      )}
                      <span className="ml-auto rounded bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-400 tabular-nums">
                        垫图 {shot.plateWeight}%
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-300">{shot.text}</p>
                    <p className="mt-1.5 text-xs text-zinc-500">{shot.camera}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
