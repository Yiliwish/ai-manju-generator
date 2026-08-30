import { Fingerprint, History, Mic } from 'lucide-react'
import StageHeader from '../components/StageHeader'
import ImageSlot from '../components/ImageSlot'
import { exampleProject } from '../data/exampleProject'
import { STAGES } from '../stages'

export default function CharacterStage() {
  const stage = STAGES.find((s) => s.id === 'character')!

  return (
    <div className="flex h-full flex-col">
      <StageHeader stage={stage} />

      <div className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-4xl space-y-4">
          <p className="text-sm text-zinc-500">
            每个角色用一段固定的「身份串」锁定视觉特征，跨镜头复用，避免 AI 重新发挥导致长相漂移。
          </p>

          {exampleProject.characters.map((c) => (
            <article
              key={c.id}
              className="grid gap-5 rounded-xl border border-zinc-800 bg-zinc-900 p-5 sm:grid-cols-[160px_1fr]"
            >
              {/* 设定图 */}
              <div className="aspect-[3/4] overflow-hidden rounded-lg">
                <ImageSlot src={c.image} label="角色设定图" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-2">
                  <h3 className="text-base font-semibold text-zinc-100">{c.name}</h3>
                  <span className="rounded-full border border-zinc-800 px-2 py-0.5 text-xs text-zinc-500">
                    {c.role}
                  </span>
                </div>

                {/* 身份串 */}
                <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-400">
                    <Fingerprint className="size-3.5" />
                    身份串（跨镜锁定）
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-300">{c.identity}</p>
                </div>

                {/* 状态时间轴 */}
                <div className="mt-3">
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                    <History className="size-3.5" />
                    状态时间轴
                  </div>
                  <ul className="space-y-1">
                    {c.states.map((s) => (
                      <li key={s.shot} className="flex gap-2 text-sm text-zinc-400">
                        <span className="shrink-0 font-medium text-zinc-500 tabular-nums">
                          第 {s.shot} 镜
                        </span>
                        <span className="text-zinc-300">{s.note}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-xs text-zinc-500">
                  <Mic className="size-3.5" />
                  配音：{c.voice ?? '未指定'}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
