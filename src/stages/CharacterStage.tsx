import { Fingerprint, History, ImagePlus, LoaderCircle } from 'lucide-react'
import StageHeader from '../components/StageHeader'
import ImageSlot from '../components/ImageSlot'
import { STAGES } from '../stages'
import type { Project } from '../types'

interface CharacterStageProps {
  project: Project
  onGenerateImage: (characterId: string) => Promise<void>
  generatingCharacterId: string | null
  error: string | null
}

export default function CharacterStage({
  project,
  onGenerateImage,
  generatingCharacterId,
  error,
}: CharacterStageProps) {
  const stage = STAGES.find((s) => s.id === 'character')!

  return (
    <div className="flex h-full flex-col">
      <StageHeader stage={stage} />

      <div className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-4xl space-y-4">
          <p className="text-sm text-zinc-500">
            每个角色固定生成一张三联设定图：正视全身图、头像特写、后视全身图。三栏共用同一段「身份串」，用于后续镜头保持一致。
          </p>
          {error && (
            <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs leading-relaxed text-rose-300">
              {error}
            </p>
          )}

          {project.characters.map((c) => (
            <article
              key={c.id}
              className="grid gap-5 rounded-xl border border-zinc-800 bg-zinc-900 p-5 sm:grid-cols-[160px_1fr]"
            >
              {/* 固定三联设定图：正视图 / 头像 / 后视图 */}
              <div className="aspect-[4/3] overflow-hidden rounded-lg bg-zinc-950">
                <ImageSlot src={c.image} label="三联角色设定图" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-2">
                  <h3 className="text-base font-semibold text-zinc-100">{c.name}</h3>
                  <span className="rounded-full border border-zinc-800 px-2 py-0.5 text-xs text-zinc-500">
                    {c.role}
                  </span>
                  <button
                    type="button"
                    onClick={() => void onGenerateImage(c.id)}
                    disabled={generatingCharacterId !== null}
                    className="ml-auto flex items-center gap-1.5 rounded-lg border border-rose-500/40 px-2.5 py-1.5 text-xs text-rose-300 transition-colors hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {generatingCharacterId === c.id ? (
                      <LoaderCircle className="size-3.5 animate-spin" />
                    ) : (
                      <ImagePlus className="size-3.5" />
                    )}
                    {generatingCharacterId === c.id ? '生成中…' : c.image ? '重新生成三联图' : '生成三联设定图'}
                  </button>
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-zinc-500">
                  <span className="rounded border border-zinc-800 px-1.5 py-0.5">正视全身</span>
                  <span className="rounded border border-zinc-800 px-1.5 py-0.5">头像特写</span>
                  <span className="rounded border border-zinc-800 px-1.5 py-0.5">后视全身</span>
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

              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
