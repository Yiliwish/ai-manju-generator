import { Volume2 } from 'lucide-react'
import StageHeader from '../components/StageHeader'
import { exampleProject } from '../data/exampleProject'
import { STAGES } from '../stages'

export default function VoiceStage() {
  const stage = STAGES.find((s) => s.id === 'voice')!

  return (
    <div className="flex h-full flex-col">
      <StageHeader stage={stage} />

      <div className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* 角色配音 */}
          <section>
            <h3 className="mb-3 text-sm font-medium text-zinc-200">角色配音（TTS 多音色）</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {exampleProject.characters.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-sm text-zinc-300">
                    {c.name.slice(0, 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-200">{c.name}</p>
                    <p className="text-xs text-zinc-500">{c.voice}</p>
                  </div>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-800 px-2.5 py-1.5 text-xs text-zinc-300 transition-colors hover:border-zinc-700"
                  >
                    <Volume2 className="size-3.5" />
                    试听
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* 运镜动效 */}
          <section>
            <h3 className="mb-3 text-sm font-medium text-zinc-200">运镜动效</h3>
            <ul className="space-y-2">
              {exampleProject.shots.map((shot) => (
                <li
                  key={shot.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm"
                >
                  <span className="text-zinc-300 tabular-nums">第 {shot.id} 镜</span>
                  <span className="text-zinc-400">{shot.motion}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
