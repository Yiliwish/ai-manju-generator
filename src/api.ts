import type { Character, Project, Scene, Shot } from './types'

interface GenerateResponse {
  project?: Project
  error?: string
}

async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text()
  if (!text.trim()) return {} as T

  try {
    return JSON.parse(text) as T
  } catch {
    return {} as T
  }
}

function getApiError(
  response: Response,
  payload: { error?: string | null } | null,
  fallback: string,
) {
  if (payload?.error) return payload.error
  if (response.status >= 500) {
    return 'AI 后端没有正常返回结果。请先在项目目录运行 npm run api，再重新生成。'
  }
  return fallback
}

export async function generateProject(source: string): Promise<Project> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source }),
  })

  const payload = await readJson<GenerateResponse>(response)
  if (!response.ok || !payload?.project) {
    throw new Error(getApiError(response, payload, '生成失败，请检查 API 配置后重试。'))
  }
  return payload.project
}

interface ImageTaskResponse {
  taskId?: string
  status?: string
  imageUrl?: string | null
  error?: string | null
}

interface ShotVideoResponse {
  taskId?: string
  status?: string
  videoUrl?: string | null
  error?: string | null
}

export async function generateCharacterImage(character: Character, style: string): Promise<string> {
  return generateImageTask(
    '/api/generate-character-image',
    {
      name: character.name,
      role: character.role,
      identity: character.identity,
      style,
      sheetLayout: 'front-avatar-back',
    },
    '角色图片生成失败，请检查通义万相配置。',
  )
}

export async function generateSceneImage(scene: Scene, style: string): Promise<string> {
  return generateImageTask(
    '/api/generate-scene-image',
    {
      name: scene.name,
      geometry: scene.geometry,
      style,
    },
    '场景母本生成失败，请检查通义万相配置。',
  )
}

export async function generateShotImage(
  shot: Shot,
  scene: Scene,
  characters: Character[],
  style: string,
): Promise<string> {
  return generateImageTask(
    '/api/generate-shot-image',
    {
      shot,
      scene,
      characters,
      style,
    },
    '分镜画面生成失败，请检查通义万相配置。',
  )
}

async function generateImageTask(path: string, body: unknown, fallback: string): Promise<string> {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const payload = await readJson<ImageTaskResponse>(response)
  if (!response.ok || !payload.taskId) {
    throw new Error(payload.error ?? fallback)
  }

  if (payload.imageUrl) return payload.imageUrl

  for (let attempt = 0; attempt < 36; attempt += 1) {
    await new Promise((resolve) => window.setTimeout(resolve, 5_000))
    const statusResponse = await fetch(
      `/api/image-task-status?taskId=${encodeURIComponent(payload.taskId)}`,
    )
    const statusPayload = await readJson<ImageTaskResponse>(statusResponse)
    if (!statusResponse.ok) {
      throw new Error(statusPayload.error ?? '图片状态查询失败，请稍后重试。')
    }

    const status = statusPayload.status ?? 'UNKNOWN'
    if (status === 'SUCCEEDED' && statusPayload.imageUrl) return statusPayload.imageUrl
    if (['FAILED', 'CANCELED', 'UNKNOWN'].includes(status)) {
      throw new Error(statusPayload.error ?? `图片生成${status === 'CANCELED' ? '已取消' : '失败'}。`)
    }
  }

  throw new Error('图片生成等待超时。任务可能仍在后台运行，请稍后重试。')
}

export async function generateShotVideo(
  shot: Shot,
  scene: Scene,
  characters: Character[],
  style: string,
  imageUrl: string,
  onStatus?: (status: string) => void,
): Promise<string> {
  const response = await fetch('/api/generate-shot-video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      shot,
      scene,
      characters,
      style,
      imageUrl,
    }),
  })

  const payload = await readJson<ShotVideoResponse>(response)
  if (!response.ok || !payload.taskId) {
    throw new Error(payload.error ?? '视频任务创建失败，请检查万相视频配置。')
  }

  onStatus?.(payload.status ?? 'PENDING')
  if (payload.videoUrl) return payload.videoUrl

  for (let attempt = 0; attempt < 40; attempt += 1) {
    await new Promise((resolve) => window.setTimeout(resolve, 15_000))
    const statusResponse = await fetch(
      `/api/shot-video-status?taskId=${encodeURIComponent(payload.taskId)}`,
    )
    const statusPayload = await readJson<ShotVideoResponse>(statusResponse)
    if (!statusResponse.ok) {
      throw new Error(statusPayload.error ?? '视频状态查询失败，请稍后重试。')
    }

    const status = statusPayload.status ?? 'UNKNOWN'
    onStatus?.(status)
    if (status === 'SUCCEEDED' && statusPayload.videoUrl) return statusPayload.videoUrl
    if (['FAILED', 'CANCELED', 'UNKNOWN'].includes(status)) {
      throw new Error(statusPayload.error ?? `视频生成${status === 'CANCELED' ? '已取消' : '失败'}。`)
    }
  }

  throw new Error('视频生成等待超时。任务可能仍在后台运行，请稍后重试查询。')
}
