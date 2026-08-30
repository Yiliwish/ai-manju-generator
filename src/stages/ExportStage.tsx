import { Download, Subtitles } from 'lucide-react'
import StageHeader from '../components/StageHeader'
import { exampleProject } from '../data/exampleProject'
import { STAGES } from '../stages'

export default function ExportStage() {
  const stage = STAGES.find((s) => s.id === 'export')!

  return (
    <div className="flex h-full flex-col">
      <StageHeader stage={stage} />

      <div className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[300px_1fr]">
          {/* 竖屏成片预览 */}
          <div className="flex flex-col items-center">
            <div className="relative aspect-[9/16] w-full max-w-[280px] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
              <video
                src="images/video-03.mp4"
                className="h-full w-full object-cover"
                controls
                playsInline
                loop
                muted
              />
              {/* 字幕叠加 */}
              <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center px-4">
                <p className="rounded bg-black/70 px-3 py-1.5 text-center text-sm leading-snug text-white">
                  闹钟唱道：“大扫除。”清洁鼠从墙洞里钻出来……
                </p>
              </div>
            </div>

            <button
              type="button"
              className="mt-4 flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-600"
            >
              <Download className="size-4" />
              导出成片
            </button>
            <p className="mt-2 text-xs text-zinc-500">1080×1920 竖屏 · MP4</p>
          </div>

          {/* 字幕时间轴 */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-200">
              <Subtitles className="size-4 text-zinc-500" />
              字幕时间轴
            </h3>
            <ul className="space-y-2">
              {exampleProject.shots.map((shot) => (
                <li
                  key={shot.id}
                  className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5"
                >
                  <span className="mt-0.5 shrink-0 text-xs text-zinc-500 tabular-nums">
                    {shot.id}
                  </span>
                  <p className="flex-1 text-sm leading-relaxed text-zinc-300">{shot.text}</p>
                  <span className="mt-0.5 shrink-0 text-xs text-zinc-500 tabular-nums">
                    {shot.duration}s
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
