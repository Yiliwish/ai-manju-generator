import { useState } from 'react'
import { FileText, Sparkles } from 'lucide-react'
import StageHeader from '../components/StageHeader'
import { STAGES } from '../stages'
import type { Project } from '../types'

interface ImportStageProps {
  project: Project
  onGenerate: (source: string) => Promise<void>
  isGenerating: boolean
  error: string | null
}

export default function ImportStage({ project, onGenerate, isGenerating, error }: ImportStageProps) {
  const stage = STAGES.find((s) => s.id === 'import')!
  const [text, setText] = useState(project.originalExcerpt)
  const isWaitingForAnalysis =
    text.trim().length >= 20 && text.trim() !== project.originalExcerpt.trim()
  const metadata = {
    title: isWaitingForAnalysis ? '待 AI 分析' : project.title,
    source: isWaitingForAnalysis ? '待从文章识别' : project.source,
    style: isWaitingForAnalysis ? '待根据文章分析' : project.style,
  }

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
              粘贴新文章后点击“开始生成”，标题、来源、画风、角色和分镜都会根据文章重新生成。
            </p>
          </section>

          {/* 项目信息 + 操作 */}
          <aside className="flex flex-col gap-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-medium text-zinc-200">项目信息</h3>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[11px] ${
                    isWaitingForAnalysis
                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                      : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  }`}
                >
                  {isWaitingForAnalysis ? '待分析' : '已生成'}
                </span>
              </div>
              <dl className="mt-3 space-y-2.5 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="shrink-0 text-zinc-500">标题</dt>
                  <dd className="text-right text-zinc-200">{metadata.title}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="shrink-0 text-zinc-500">来源</dt>
                  <dd className="text-right text-zinc-200">{metadata.source}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="shrink-0 text-zinc-500">画风</dt>
                  <dd className="text-right text-zinc-200">{metadata.style}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="shrink-0 text-zinc-500">格式</dt>
                  <dd className="text-right text-zinc-200 tabular-nums">
                    {project.aspect} 竖屏
                  </dd>
                </div>
              </dl>
            </div>

            <button
              onClick={() => void onGenerate(text)}
              disabled={isGenerating || text.trim().length < 20}
              className="flex items-center justify-center gap-2 rounded-lg bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles className="size-4" />
              {isGenerating ? '正在生成分镜…' : '开始生成'}
            </button>
            {error ? (
              <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs leading-relaxed text-rose-300">
                {error}
              </p>
            ) : (
              <p className="text-center text-xs text-zinc-500">
                AI 将把原文拆解为逐镜头分镜脚本
              </p>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
