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

interface CharacterImageResponse {
  imageUrl?: string
  error?: string
}

interface ShotVideoResponse {
  taskId?: string
  status?: string
  videoUrl?: string | null
  error?: string | null
}

export async function generateCharacterImage(character: Character, style: string): Promise<string> {
  const response = await fetch('/api/generate-character-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: character.name,
      role: character.role,
      identity: character.identity,
      style,
      sheetLayout: 'front-avatar-back',
    }),
  })

  const payload = await readJson<CharacterImageResponse>(response)
  if (!response.ok || !payload.imageUrl) {
    throw new Error(payload.error ?? '角色图片生成失败，请检查通义万相配置。')
  }
  return payload.imageUrl
}

export async function generateSceneImage(scene: Scene, style: string): Promise<string> {
  const response = await fetch('/api/generate-scene-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: scene.name,
      geometry: scene.geometry,
      style,
    }),
  })

  const payload = await readJson<CharacterImageResponse>(response)
  if (!response.ok || !payload.imageUrl) {
    throw new Error(payload.error ?? '场景母本生成失败，请检查通义万相配置。')
  }
  return payload.imageUrl
}

export async function generateShotImage(
  shot: Shot,
  scene: Scene,
  characters: Character[],
  style: string,
): Promise<string> {
  const response = await fetch('/api/generate-shot-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      shot,
      scene,
      characters,
      style,
    }),
  })

  const payload = await readJson<CharacterImageResponse>(response)
  if (!response.ok || !payload.imageUrl) {
    throw new Error(payload.error ?? '分镜画面生成失败，请检查通义万相配置。')
  }
  return payload.imageUrl
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
