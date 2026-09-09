import { Film, ImagePlus, LoaderCircle } from 'lucide-react'
import StageHeader from '../components/StageHeader'
import ImageSlot from '../components/ImageSlot'
import { STAGES } from '../stages'
import type { Project } from '../types'

interface ShotStageProps {
  project: Project
  onGenerateImage: (shotId: number) => Promise<void>
  generatingShotId: number | null
  error: string | null
  onGenerateVideo: (shotId: number) => Promise<void>
  generatingVideoId: number | null
  videoProgress: string | null
  videoError: string | null
}

export default function ShotStage({
  project,
  onGenerateImage,
  generatingShotId,
  error,
  onGenerateVideo,
  generatingVideoId,
  videoProgress,
  videoError,
}: ShotStageProps) {
  const stage = STAGES.find((s) => s.id === 'shot')!
  const sceneName = (id: string) => project.scenes.find((s) => s.id === id)?.name ?? id

  return (
    <div className="flex h-full flex-col">
      <StageHeader stage={stage} />

      <div className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-6xl">
          <p className="mb-5 text-sm text-zinc-500">
            每个镜头从对应场景的母本图垫图派生，空间保持一致，只换机位与主体。
          </p>
          {error && (
            <p className="mb-5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs leading-relaxed text-rose-300">
              {error}
            </p>
          )}
          {videoError && (
            <p className="mb-5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-200">
              {videoError}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {project.shots.map((shot) => (
              <figure
                key={shot.id}
                className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900"
              >
                <div className="aspect-[9/16] bg-zinc-950">
                  {shot.video ? (
                    <video
                      src={shot.video}
                      className="h-full w-full object-cover"
                      controls
                      playsInline
                      loop
                    />
                  ) : (
                    <ImageSlot src={shot.image} label="派生画面" />
                  )}
                </div>
                <figcaption className="p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-300">第 {shot.id} 镜</span>
                    <span className="text-zinc-500">{sceneName(shot.sceneId)}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-500">{shot.motion}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => void onGenerateImage(shot.id)}
                      disabled={generatingShotId !== null || generatingVideoId !== null}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-700 px-2 py-2 text-[11px] text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {generatingShotId === shot.id ? (
                        <LoaderCircle className="size-3.5 animate-spin" />
                      ) : (
                        <ImagePlus className="size-3.5" />
                      )}
                      {generatingShotId === shot.id
                        ? '生成中…'
                        : shot.image
                          ? '重生成首帧'
                          : '生成首帧'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void onGenerateVideo(shot.id)}
                      disabled={generatingShotId !== null || generatingVideoId !== null}
                      className="flex items-center justify-center gap-1.5 rounded-lg bg-rose-500/15 px-2 py-2 text-[11px] text-rose-300 transition-colors hover:bg-rose-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {generatingVideoId === shot.id ? (
                        <LoaderCircle className="size-3.5 animate-spin" />
                      ) : (
                        <Film className="size-3.5" />
                      )}
                      {generatingVideoId === shot.id
                        ? videoProgress ?? '视频生成中…'
                        : shot.video
                          ? '重新生成视频'
                          : '生成动态视频'}
                    </button>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
