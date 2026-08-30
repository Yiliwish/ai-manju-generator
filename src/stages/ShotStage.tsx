import StageHeader from '../components/StageHeader'
import ImageSlot from '../components/ImageSlot'
import { exampleProject } from '../data/exampleProject'
import { STAGES } from '../stages'

const sceneName = (id: string) =>
  exampleProject.scenes.find((s) => s.id === id)?.name ?? id

export default function ShotStage() {
  const stage = STAGES.find((s) => s.id === 'shot')!

  return (
    <div className="flex h-full flex-col">
      <StageHeader stage={stage} />

      <div className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-6xl">
          <p className="mb-5 text-sm text-zinc-500">
            每个镜头从对应场景的母本图垫图派生，空间保持一致，只换机位与主体。
          </p>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {exampleProject.shots.map((shot) => (
              <figure
                key={shot.id}
                className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900"
              >
                <div className="aspect-[9/16]">
                  <ImageSlot src={shot.image} label="派生画面" />
                </div>
                <figcaption className="p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-300">第 {shot.id} 镜</span>
                    <span className="text-zinc-500">{sceneName(shot.sceneId)}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-500">{shot.motion}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
