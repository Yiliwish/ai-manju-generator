import { useEffect, useState } from 'react'
import { Download, Film, LoaderCircle, Subtitles } from 'lucide-react'
import StageHeader from '../components/StageHeader'
import { STAGES } from '../stages'
import type { Project, Scene, Shot } from '../types'

interface ExportStageProps {
  project: Project
}

const WIDTH = 540
const HEIGHT = 960
const FPS = 30

function loadImage(src?: string): Promise<HTMLImageElement | null> {
  if (!src) return Promise.resolve(null)

  return new Promise((resolve) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = src
  })
}

function drawCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight)
  const imageWidth = image.naturalWidth * scale
  const imageHeight = image.naturalHeight * scale
  context.drawImage(image, (width - imageWidth) / 2, (height - imageHeight) / 2, imageWidth, imageHeight)
}

function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = []
  let line = ''

  for (const character of [...text]) {
    const next = line + character
    if (line && context.measureText(next).width > maxWidth) {
      lines.push(line)
      line = character
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines.slice(0, 4)
}

function drawFrame(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement | null,
  shot: Shot,
  scene: Scene | undefined,
  elapsed: number,
  duration: number,
) {
  context.fillStyle = '#09090b'
  context.fillRect(0, 0, WIDTH, HEIGHT)

  if (image) {
    try {
      drawCover(context, image, WIDTH, HEIGHT)
    } catch {
      // 跨域图片无法绘制时，仍然输出字幕和镜头信息，保证能导出预览片。
    }
  } else {
    const gradient = context.createLinearGradient(0, 0, WIDTH, HEIGHT)
    gradient.addColorStop(0, '#27272a')
    gradient.addColorStop(1, '#09090b')
    context.fillStyle = gradient
    context.fillRect(0, 0, WIDTH, HEIGHT)
  }

  const shade = context.createLinearGradient(0, 0, 0, HEIGHT)
  shade.addColorStop(0, 'rgba(0,0,0,0.42)')
  shade.addColorStop(0.45, 'rgba(0,0,0,0)')
  shade.addColorStop(1, 'rgba(0,0,0,0.82)')
  context.fillStyle = shade
  context.fillRect(0, 0, WIDTH, HEIGHT)

  context.fillStyle = 'rgba(9,9,11,0.7)'
  context.fillRect(24, 24, 170, 42)
  context.fillStyle = '#f4f4f5'
  context.font = '600 20px "Microsoft YaHei", sans-serif'
  context.fillText('第 ' + shot.id + ' 镜', 38, 51)
  context.fillStyle = '#d4d4d8'
  context.font = '16px "Microsoft YaHei", sans-serif'
  context.fillText(scene?.name ?? '未命名场景', 38, 92)

  const subtitle = shot.text.replace(/^（[^）]+）/, '').trim()
  context.font = '22px "Microsoft YaHei", sans-serif'
  const lines = wrapText(context, subtitle || '（无字幕）', WIDTH - 72)
  const lineHeight = 32
  const boxHeight = lines.length * lineHeight + 34
  const boxTop = HEIGHT - boxHeight - 60
  context.fillStyle = 'rgba(0,0,0,0.78)'
  context.fillRect(28, boxTop, WIDTH - 56, boxHeight)
  context.fillStyle = '#ffffff'
  lines.forEach((line, index) => {
    context.fillText(line, 48, boxTop + 30 + index * lineHeight)
  })

  context.fillStyle = 'rgba(255,255,255,0.32)'
  context.fillRect(28, HEIGHT - 24, WIDTH - 56, 4)
  context.fillStyle = '#fb7185'
  context.fillRect(28, HEIGHT - 24, (WIDTH - 56) * Math.min(1, elapsed / duration), 4)
}

async function renderProjectVideo(project: Project): Promise<Blob> {
  if (!project.shots.length) throw new Error('没有可导出的分镜。')
  if (typeof MediaRecorder === 'undefined' || !HTMLCanvasElement.prototype.captureStream) {
    throw new Error('当前浏览器不支持视频录制，请使用 Chromium 内核浏览器。')
  }

  const mimeType = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find((type) =>
    MediaRecorder.isTypeSupported(type),
  )
  if (!mimeType) throw new Error('当前浏览器不支持 WebM 导出。')

  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const context = canvas.getContext('2d')
  if (!context) throw new Error('无法创建视频画布。')

  const stream = canvas.captureStream(FPS)
  const recorder = new MediaRecorder(stream, { mimeType })
  const chunks: BlobPart[] = []
  const recordingDone = new Promise<Blob>((resolve, reject) => {
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data)
    }
    recorder.onerror = () => reject(new Error('视频录制失败，请重试。'))
    recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }))
  })

  recorder.start()
  try {
    for (const shot of project.shots) {
      const scene = project.scenes.find((item) => item.id === shot.sceneId)
      const image = await loadImage(shot.image ?? scene?.masterPlate)
      const duration = Math.max(2, Number(shot.duration) || 4) * 1000
      const startedAt = performance.now()

      while (true) {
        const elapsed = performance.now() - startedAt
        drawFrame(context, image, shot, scene, elapsed, duration)
        if (elapsed >= duration) break
        await new Promise<void>((resolve) => window.setTimeout(resolve, 1000 / FPS))
      }
    }
  } finally {
    recorder.stop()
    stream.getTracks().forEach((track) => track.stop())
  }

  return recordingDone
}

export default function ExportStage({ project }: ExportStageProps) {
  const stage = STAGES.find((s) => s.id === 'export')!
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const previewShot = project.shots[0]
  const previewScene = project.scenes.find((scene) => scene.id === previewShot?.sceneId)
  const previewSrc = previewShot?.image ?? previewScene?.masterPlate

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl)
    }
  }, [videoUrl])

  const handleExport = async () => {
    setIsExporting(true)
    setError(null)
    try {
      const blob = await renderProjectVideo(project)
      setVideoUrl(URL.createObjectURL(blob))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '导出失败，请稍后重试。')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <StageHeader stage={stage} />

      <div className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[300px_1fr]">
          <div className="flex flex-col items-center">
            <div className="relative aspect-[9/16] w-full max-w-[280px] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
              {videoUrl ? (
                <video src={videoUrl} className="h-full w-full object-cover" controls playsInline loop />
              ) : previewSrc ? (
                <img src={previewSrc} alt="第一镜预览" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center px-8 text-center text-xs text-zinc-500">
                  先生成分镜画面，导出时会自动组成竖屏视频
                </div>
              )}
              {!videoUrl && previewSrc && (
                <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center px-4">
                  <p className="rounded bg-black/70 px-3 py-1.5 text-center text-xs leading-snug text-white">
                    点击“生成预览片”查看完整字幕视频
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => void handleExport()}
              disabled={isExporting}
              className="mt-4 flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isExporting ? <LoaderCircle className="size-4 animate-spin" /> : <Film className="size-4" />}
              {isExporting ? '正在录制预览片…' : videoUrl ? '重新生成预览片' : '生成预览片'}
            </button>
            {videoUrl && (
              <a
                href={videoUrl}
                download={(project.title || 'manzao-project') + '.webm'}
                className="mt-2 flex items-center gap-1.5 text-xs text-rose-300 hover:text-rose-200"
              >
                <Download className="size-3.5" />
                下载 WebM 成片
              </a>
            )}
            <p className="mt-2 text-xs text-zinc-500">浏览器端录制 · 1080×1920 比例 · WebM</p>
            {error && (
              <p className="mt-3 max-w-[280px] rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-center text-xs leading-relaxed text-rose-300">
                {error}
              </p>
            )}
          </div>

          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-200">
              <Subtitles className="size-4 text-zinc-500" />
              字幕时间轴
            </h3>
            <ul className="space-y-2">
              {project.shots.map((shot) => (
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
