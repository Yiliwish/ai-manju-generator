import { useState } from 'react'
import { Check, ImagePlus, Layers, LoaderCircle, X } from 'lucide-react'
import StageHeader from '../components/StageHeader'
import ImageSlot from '../components/ImageSlot'
import RoomSchematic from '../components/RoomSchematic'
import { STAGES } from '../stages'
import type { Project } from '../types'

interface SceneStageProps {
  project: Project
  onGenerateImage: (sceneId: string) => Promise<void>
  generatingSceneId: string | null
  error: string | null
}

export default function SceneStage({
  project,
  onGenerateImage,
  generatingSceneId,
  error,
}: SceneStageProps) {
  const stage = STAGES.find((s) => s.id === 'scene')!
  const [sceneId, setSceneId] = useState(project.scenes[0]?.id ?? '')
  const scene = project.scenes.find((s) => s.id === sceneId) ?? project.scenes[0]
  const derivedShots = project.shots.filter((s) => s.sceneId === scene?.id)

  if (!scene) return null

  return (
    <div className="flex h-full flex-col">
      <StageHeader stage={stage} />

      <div className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* 概念说明 */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4">
            <div className="flex items-start gap-2.5">
              <Layers className="mt-0.5 size-4 shrink-0 text-rose-400" />
              <p className="text-sm leading-relaxed text-zinc-300">
                <span className="font-medium text-zinc-100">场景母本：</span>
                每个场景先定一张「空场景母本图」，锁住墙、门、家具的几何关系；之后所有镜头用母本垫图派生（55–70%
                锁构图），不再从零重写 —— 根治跨镜头「场景空间漂移」。
              </p>
            </div>
            {error && (
              <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs leading-relaxed text-rose-300">
                {error}
              </p>
            )}
          </div>

          {/* 场景切换 */}
          <div className="flex flex-wrap gap-2">
            {project.scenes.map((s) => (
              <button
                key={s.id}
                onClick={() => setSceneId(s.id)}
                className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                  s.id === sceneId
                    ? 'bg-rose-500 text-white'
                    : 'border border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                {s.name}
                <span
                  className={`ml-1.5 text-xs tabular-nums ${
                    s.id === sceneId ? 'text-rose-100' : 'text-zinc-600'
                  }`}
                >
                  {s.shots.length}
                </span>
              </button>
            ))}
          </div>

          {/* 选中场景详情 */}
          <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
            <div className="space-y-3">
              <div className="aspect-[9/16] overflow-hidden rounded-xl border border-zinc-800">
                <ImageSlot src={scene.masterPlate} label="空场景母本图" />
              </div>
              <button
                type="button"
                onClick={() => void onGenerateImage(scene.id)}
                disabled={generatingSceneId !== null}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-rose-500/40 px-3 py-2.5 text-xs font-medium text-rose-300 transition-colors hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {generatingSceneId === scene.id ? (
                  <LoaderCircle className="size-3.5 animate-spin" />
                ) : (
                  <ImagePlus className="size-3.5" />
                )}
                {generatingSceneId === scene.id
                  ? '正在生成母本…'
                  : scene.masterPlate
                    ? '重新生成场景母本'
                    : '生成场景母本'}
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                <h3 className="text-sm font-medium text-zinc-200">空间几何（锁构图的依据）</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">{scene.geometry}</p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                <h3 className="text-sm font-medium text-zinc-200">派生镜头</h3>
                <ul className="mt-2 space-y-2">
                  {derivedShots.map((shot) => (
                    <li key={shot.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="min-w-0 truncate text-zinc-300">
                        第 {shot.id} 镜 · {shot.text}
                      </span>
                      <span className="shrink-0 rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400 tabular-nums">
                        垫图 {shot.plateWeight}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 一致性对比（核心卖点） */}
          <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="text-sm font-semibold text-zinc-100">
              一致性对比：同一场景跨 3 个镜头
            </h3>
            <p className="mt-1 text-xs text-zinc-500">门 / 窗 / 桌子的位置，是否逐镜保持一致。</p>

            <div className="mt-4 grid gap-6 md:grid-cols-2">
              {/* 无母本 */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <X className="size-4 text-rose-400" />
                  <span className="text-sm font-medium text-zinc-200">无母本 · 从零生成</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <RoomSchematic drift={0} label="镜 1" />
                  <RoomSchematic drift={0.55} label="镜 2" />
                  <RoomSchematic drift={1} label="镜 3" />
                </div>
                <p className="mt-3 text-xs text-zinc-500">家具位置逐镜漂移，观众出戏。</p>
              </div>

              {/* 有母本 */}
              <div className="rounded-lg border border-rose-500/40 bg-zinc-950 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Check className="size-4 text-rose-400" />
                  <span className="text-sm font-medium text-zinc-100">有母本 · 垫图锁构图</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <RoomSchematic drift={0} label="镜 1" />
                  <RoomSchematic drift={0} label="镜 2" />
                  <RoomSchematic drift={0} label="镜 3" />
                </div>
                <p className="mt-3 text-xs text-zinc-400">几何完全一致，只换机位与人物。</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
