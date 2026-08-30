import { useState } from 'react'
import { FileText, Sparkles } from 'lucide-react'
import StageHeader from '../components/StageHeader'
import { exampleProject } from '../data/exampleProject'
import { STAGES, type StageId } from '../stages'

interface ImportStageProps {
  onNavigate: (id: StageId) => void
}

export default function ImportStage({ onNavigate }: ImportStageProps) {
  const stage = STAGES.find((s) => s.id === 'import')!
  const [text, setText] = useState(exampleProject.originalExcerpt)

  return (
    <div className="flex h-full flex-col">
      <StageHeader stage={stage} />

      <div className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_320px]">
          {/* 原文 */}
          <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <label
              htmlFor="source"
              className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-200"
            >
              <FileText className="size-4 text-zinc-500" />
              小说原文
            </label>
            <textarea
              id="source"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={13}
              className="w-full resize-y rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-sm leading-relaxed text-zinc-200 outline-none transition-colors focus:border-rose-500/60"
              placeholder="粘贴小说章节，或输入原创故事……"
            />
            <p className="mt-2 text-xs text-zinc-500">
              当前已载入示例项目《{exampleProject.title}》节选，可直接开始体验。
            </p>
          </section>

          {/* 项目信息 + 操作 */}
          <aside className="flex flex-col gap-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <h3 className="text-sm font-medium text-zinc-200">项目信息</h3>
              <dl className="mt-3 space-y-2.5 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="shrink-0 text-zinc-500">标题</dt>
                  <dd className="text-right text-zinc-200">{exampleProject.title}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="shrink-0 text-zinc-500">来源</dt>
                  <dd className="text-right text-zinc-200">{exampleProject.source}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="shrink-0 text-zinc-500">画风</dt>
                  <dd className="text-right text-zinc-200">{exampleProject.style}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="shrink-0 text-zinc-500">格式</dt>
                  <dd className="text-right text-zinc-200 tabular-nums">
                    {exampleProject.aspect} 竖屏
                  </dd>
                </div>
              </dl>
            </div>

            <button
              onClick={() => onNavigate('storyboard')}
              className="flex items-center justify-center gap-2 rounded-lg bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-600"
            >
              <Sparkles className="size-4" />
              开始生成
            </button>
            <p className="text-center text-xs text-zinc-500">
              AI 将把原文拆解为逐镜头分镜脚本
            </p>
          </aside>
        </div>
      </div>
    </div>
  )
}
