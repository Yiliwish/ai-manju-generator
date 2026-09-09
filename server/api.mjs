import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

function loadEnvFile() {
  for (const filename of ['.env.local', '.env']) {
    const filePath = path.resolve(process.cwd(), filename)
    if (!fs.existsSync(filePath)) continue
    const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/)
    for (const line of lines) {
      const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*)\s*$/)
      if (!match || process.env[match[1]]) continue
      process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '')
    }
  }
}

loadEnvFile()

const PORT = Number(process.env.PORT ?? 8787)
const API_KEY = process.env.DEEPSEEK_API_KEY
const BASE_URL = (process.env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com').replace(/\/$/, '')
const MODEL = process.env.DEEPSEEK_MODEL ?? 'deepseek-v4-flash'
const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY
const DASHSCOPE_BASE_URL = (process.env.DASHSCOPE_BASE_URL ?? 'https://dashscope.aliyuncs.com').replace(/\/$/, '')
const DASHSCOPE_IMAGE_MODEL = process.env.DASHSCOPE_IMAGE_MODEL ?? 'qwen-image-3.0-pro'
const DASHSCOPE_VIDEO_MODEL = process.env.DASHSCOPE_VIDEO_MODEL ?? 'MiniMax/MiniMax-H3'
const DASHSCOPE_REGION = process.env.DASHSCOPE_REGION ?? 'beijing'
const DASHSCOPE_WORKSPACE_ID = process.env.DASHSCOPE_WORKSPACE_ID
const VIDEO_REGION = DASHSCOPE_REGION.startsWith('cn-') ? DASHSCOPE_REGION : `cn-${DASHSCOPE_REGION}`
const DASHSCOPE_WORKSPACE_BASE_URL = DASHSCOPE_WORKSPACE_ID
  ? `https://${DASHSCOPE_WORKSPACE_ID}.${VIDEO_REGION}.maas.aliyuncs.com`
  : ''
const DASHSCOPE_IMAGE_BASE_URL = (
  process.env.DASHSCOPE_IMAGE_BASE_URL ?? (DASHSCOPE_WORKSPACE_BASE_URL || DASHSCOPE_BASE_URL)
).replace(/\/$/, '')
const DASHSCOPE_VIDEO_BASE_URL = (
  process.env.DASHSCOPE_VIDEO_BASE_URL ?? DASHSCOPE_WORKSPACE_BASE_URL
).replace(/\/$/, '')
const DIST_DIR = path.resolve(process.cwd(), process.env.DIST_DIR ?? 'dist-vite')
const HOST = process.env.HOST ?? (process.env.PORT ? '0.0.0.0' : '127.0.0.1')

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

function serveStatic(pathname, res) {
  let decodedPath
  try {
    decodedPath = decodeURIComponent(pathname)
  } catch {
    sendJson(res, 400, { error: '无效的页面路径。' })
    return
  }

  const requestedPath = decodedPath === '/' ? '/index.html' : decodedPath
  const candidate = path.resolve(DIST_DIR, `.${requestedPath}`)
  const safeRoot = `${DIST_DIR}${path.sep}`
  const filePath = candidate.startsWith(safeRoot) && fs.existsSync(candidate)
    ? candidate
    : path.join(DIST_DIR, 'index.html')

  if (!fs.existsSync(filePath)) {
    sendJson(res, 404, { error: '前端构建产物不存在，请先运行 npm run build。' })
    return
  }

  const extension = path.extname(filePath).toLowerCase()
  res.writeHead(200, {
    'Content-Type': MIME_TYPES[extension] ?? 'application/octet-stream',
    'Cache-Control': extension === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
  })
  fs.createReadStream(filePath).pipe(res)
}

const projectShape = `{
  "id": "短英文标识",
  "title": "作品标题",
  "source": "原文来源或用户原创",
  "style": "视觉风格与镜头规格",
  "aspect": "9:16",
  "originalExcerpt": "原文摘要",
  "characters": [{
    "id": "短英文标识",
    "name": "角色名",
    "role": "角色定位",
    "identity": "可复用的视觉身份串",
    "states": [{"shot": 1, "note": "该镜头中的状态"}]
  }],
  "scenes": [{
    "id": "短英文标识",
    "name": "场景名",
    "geometry": "墙、门、家具和空间关系",
    "shots": [1]
  }],
  "shots": [{
    "id": 1,
    "sceneId": "上面 scenes 中的 id",
    "characters": ["上面 characters 中的 id"],
    "duration": 5,
    "type": "对白",
    "text": "该镜头的对白或旁白",
    "camera": "景别、机位与镜头运动",
    "plateWeight": 60,
    "motion": "画面动效"
  }]
}`

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  res.end(JSON.stringify(payload))
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string') return JSON.parse(req.body)

  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > 2_000_000) throw new Error('原文过长，请先压缩到 200 万字节以内。')
    chunks.push(chunk)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

function parseProject(content) {
  const cleaned = content.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  const project = JSON.parse(cleaned)
  if (!project || typeof project !== 'object') throw new Error('模型没有返回项目对象。')
  if (!project.title || !Array.isArray(project.characters) || !Array.isArray(project.scenes) || !Array.isArray(project.shots)) {
    throw new Error('模型返回的数据缺少角色、场景或分镜。')
  }
  if (project.shots.length === 0) throw new Error('模型没有生成任何镜头。')
  return project
}

function buildPrompt(source) {
  return `你是专业的 AI 漫剧编剧和分镜导演。请把下面的小说原文拆成可直接交给前端使用的漫剧项目 JSON。

硬性要求：
1. 只输出 JSON，不要 Markdown、解释、前后缀。
2. 必须严格包含以下字段和嵌套结构：\n${projectShape}
3. 生成 4 到 12 个镜头；每个镜头 id 唯一，sceneId 必须引用已生成的场景 id。
4. type 只能是“对白”“旁白”“动作”“空镜”之一；duration 为 2 到 12 的数字；plateWeight 为 55 到 70 的数字。
5. 角色、场景和镜头之间的 id 必须互相对应；没有角色或图片时使用空数组，不要虚构 image URL。
6. identity 要具体到发型、服装、体态、材质、主色和关键识别点，便于后续生图保持一致。
7. geometry 要描述固定的墙、门、窗、家具和空间关系，便于后续生成场景母本。
8. originalExcerpt 用 80 到 200 字概括原文，不要原样复制整段小说。
9. title 必须根据本次输入文章的核心内容重新提炼，不能沿用任何示例项目标题，尤其不能固定返回“细雨即将来临”。
10. source 只能根据文章中明确出现的作者、作品名或来源判断；如果文章没有来源信息，填写“用户原创（来源未注明）”，不要臆造作者。
11. style 必须根据本次文章的题材、情绪和叙事气质重新判断，不能沿用示例项目的“末世番剧 · 暗调”或其他固定画风；aspect 固定为“9:16”。

小说原文：
${source}`
}

function buildCharacterImagePrompt({ name, role, identity, style }) {
  return `为 AI 漫剧角色“${name}”生成一张固定版式的三联角色设定图。

角色定位：${role}
身份串：${identity}
整体画风：${style}

固定版式要求：横向三栏、从左到右必须依次包含——
1. 正视图：角色正面站立的全身图，完整显示头到脚，双脚和服装下摆不能被裁切；
2. 头像：同一角色的头肩近景头像，清晰展示脸型、眼睛、发型和关键识别点；
3. 后视图：同一角色背对镜头站立的全身图，完整显示头到脚，清晰展示发型背面、服装背面和配饰背面。

三栏中的角色必须是同一个人/同一个实体，脸部、发型、体型、服装、配色和配饰完全一致。正视图与后视图要保持同样的站姿和比例。背景使用纯白或极浅灰，人物边缘清晰、无复杂阴影，方便后续抠图和作为跨镜一致性参考。画面比例 4:3，三栏之间留出清晰间距。不要侧视图，不要额外人物，不要文字，不要标题，不要水印，不要边框，不要拼写错误，不要裁切头脚。`
}

function buildSceneImagePrompt({ name, geometry, style }) {
  return `为 AI 漫剧场景“${name}”生成一张空场景母本图。

空间几何（必须严格遵守）：${geometry}
整体画风：${style}

要求：9:16 竖构图，固定机位，平视或略微广角，完整展示场景空间关系。画面中只能有场景环境，不要人物、动物、车辆或其他未在空间几何中描述的主体。墙、门、窗、家具、通道和主要物件的位置必须清晰、稳定、可复用，方便后续镜头垫图锁构图。使用干净的电影级光线和清晰透视，避免过度景深、严重遮挡和杂乱前景。不要文字、不要标题、不要水印、不要边框、不要 logo。`
}

function buildShotImagePrompt({ shot, scene, characters, style }) {
  const characterText = Array.isArray(characters) && characters.length > 0
    ? characters.map((character) => `${character.name}：${character.identity}`).join('\n')
    : '本镜头不出现角色，只表现环境和氛围。'

  return `为 AI 漫剧生成第 ${shot.id} 镜的 9:16 竖屏画面。

整体画风：${style}
场景名称：${scene.name}
场景空间几何（必须保持）：${scene.geometry}
本镜头角色身份串（必须保持外观一致）：
${characterText}
镜头内容：${shot.text}
镜头语言：${shot.camera}
动作与动效：${shot.motion ?? '自然、克制的环境动效'}

要求：使用电影级构图和清晰透视，严格遵守场景的墙、门、窗、家具和主要物件位置；角色只能使用给定身份串中的外观，不要新增角色。画面适合后续图生视频，主体动作明确、空间层次清楚、光影统一。输出 9:16 竖屏图像，不要文字、字幕、标题、水印、logo、边框，不要多余人物，不要改变场景结构。`
}

function buildShotVideoPrompt({ shot, scene, characters, style }) {
  const characterText = Array.isArray(characters) && characters.length > 0
    ? characters.map((character) => `${character.name}：${character.identity}`).join('\n')
    : '本镜头不出现角色。'

  return `将这张 9:16 漫剧分镜首帧图生成真实动态视频。

整体画风：${style}
场景空间几何：${scene?.geometry ?? '保持首帧中的空间结构不变'}
角色身份串：
${characterText}
镜头内容：${shot.text}
镜头语言：${shot.camera}
动作与动效：${shot.motion ?? '保持主体稳定，加入自然、克制的环境运动'}

要求：严格保持首帧中的角色外观、场景结构、服装、构图和色彩，不要变脸、变形、换场景或新增人物。按照镜头语言完成自然的表情、动作、环境和镜头运动，画面连续稳定，适合 AI 漫剧镜头。不要文字、字幕、水印、logo。`
}

function extractImageUrl(payload) {
  const content = payload?.output?.choices?.[0]?.message?.content
  if (!Array.isArray(content)) return null
  const imagePart = content.find((item) => item?.type === 'image' || item?.image)
  return typeof imagePart?.image === 'string' ? imagePart.image : null
}

async function requestDashscopeImage(prompt, size) {
  if (!DASHSCOPE_API_KEY) {
    throw new Error('未配置 DASHSCOPE_API_KEY。请在 .env.local 中填写通义万相 API key。')
  }
  if (!DASHSCOPE_WORKSPACE_ID && !process.env.DASHSCOPE_IMAGE_BASE_URL) {
    throw new Error('未配置 DASHSCOPE_WORKSPACE_ID。qwen-image-3.0-pro 图片任务需要业务空间 ID。')
  }

  const upstream = await fetch(`${DASHSCOPE_IMAGE_BASE_URL}/api/v1/services/aigc/image-generation/generation`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${DASHSCOPE_API_KEY}`,
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'enable',
    },
    body: JSON.stringify({
      model: DASHSCOPE_IMAGE_MODEL,
      input: {
        messages: [{
          role: 'user',
          content: [{ text: prompt }],
        }],
      },
      parameters: {
        size,
        n: 1,
        prompt_extend: true,
        prompt_extend_mode: 'direct',
        enable_thinking: false,
        watermark: false,
      },
    }),
  })

  const payload = await upstream.json()
  if (!upstream.ok) {
    const detail = payload?.message ?? payload?.error?.message ?? `通义万相请求失败（HTTP ${upstream.status}）。`
    throw new Error(detail)
  }

  const taskId = payload?.output?.task_id
  if (!taskId) throw new Error('通义万相没有返回图片任务 ID，请检查模型、Workspace 和地域配置。')
  return {
    taskId,
    status: payload?.output?.task_status ?? 'PENDING',
  }
}

async function generateCharacterImage(body) {
  const requiredFields = ['name', 'role', 'identity', 'style']
  if (requiredFields.some((field) => typeof body?.[field] !== 'string' || !body[field].trim())) {
    throw new Error('角色图片生成缺少角色设定信息。')
  }

  return requestDashscopeImage(buildCharacterImagePrompt(body), '2048*1536')
}

async function generateSceneImage(body) {
  const requiredFields = ['name', 'geometry', 'style']
  if (requiredFields.some((field) => typeof body?.[field] !== 'string' || !body[field].trim())) {
    throw new Error('场景母本生成缺少场景设定信息。')
  }

  return requestDashscopeImage(buildSceneImagePrompt(body), '1152*2048')
}

async function generateShotImage(body) {
  if (!body?.shot || !body?.scene || typeof body.style !== 'string' || !body.style.trim()) {
    throw new Error('分镜画面生成缺少镜头、场景或画风信息。')
  }

  return requestDashscopeImage(buildShotImagePrompt(body), '1152*2048')
}

async function getImageTaskStatus(taskId) {
  if (!DASHSCOPE_API_KEY) {
    throw new Error('未配置 DASHSCOPE_API_KEY。请在 .env.local 中填写通义万相 API key。')
  }
  if (!DASHSCOPE_WORKSPACE_ID && !process.env.DASHSCOPE_IMAGE_BASE_URL) {
    throw new Error('未配置 DASHSCOPE_WORKSPACE_ID。qwen-image-3.0-pro 图片任务需要业务空间 ID。')
  }

  const upstream = await fetch(`${DASHSCOPE_IMAGE_BASE_URL}/api/v1/tasks/${encodeURIComponent(taskId)}`, {
    headers: { Authorization: `Bearer ${DASHSCOPE_API_KEY}` },
  })
  const payload = await upstream.json()
  if (!upstream.ok) {
    const detail = payload?.message ?? payload?.error?.message ?? `通义万相图片状态查询失败（HTTP ${upstream.status}）。`
    throw new Error(detail)
  }

  const output = payload?.output ?? {}
  return {
    taskId,
    status: output.task_status ?? 'UNKNOWN',
    imageUrl: extractImageUrl(payload),
    error: output.message ?? payload?.message ?? null,
  }
}

async function createShotVideo(body) {
  if (!DASHSCOPE_VIDEO_BASE_URL) {
    throw new Error('未配置 DASHSCOPE_WORKSPACE_ID。万相视频需要 WorkspaceId，请在 .env.local 中配置。')
  }
  if (!DASHSCOPE_API_KEY) {
    throw new Error('未配置 DASHSCOPE_API_KEY。请在 .env.local 中填写通义万相 API key。')
  }
  if (!body?.shot || !body?.scene || typeof body.style !== 'string' || !body.style.trim()) {
    throw new Error('视频生成缺少镜头、场景或画风信息。')
  }
  if (typeof body.imageUrl !== 'string' || !/^https?:\/\//i.test(body.imageUrl)) {
    throw new Error('视频首帧必须是通义万相返回的公网图片地址。请先生成分镜画面。')
  }

  const duration = Math.min(15, Math.max(4, Math.round(Number(body.shot.duration) || 5)))
  const upstream = await fetch(`${DASHSCOPE_VIDEO_BASE_URL}/api/v1/services/aigc/video-generation/video-synthesis`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${DASHSCOPE_API_KEY}`,
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'enable',
    },
    body: JSON.stringify({
      model: DASHSCOPE_VIDEO_MODEL,
      input: {
        prompt: buildShotVideoPrompt(body),
        media: [{ type: 'first_frame', url: body.imageUrl }],
      },
      parameters: {
        resolution: '768P',
        duration,
        ratio: 'adaptive',
        prompt_extend: true,
        watermark: false,
      },
    }),
  })

  const payload = await upstream.json()
  if (!upstream.ok) {
    const detail = payload?.message ?? payload?.error?.message ?? `万相视频请求失败（HTTP ${upstream.status}）。`
    throw new Error(detail)
  }

  const taskId = payload?.output?.task_id
  if (!taskId) throw new Error('万相视频没有返回任务 ID，请检查视频模型和 Workspace 配置。')
  return { taskId, status: payload?.output?.task_status ?? 'PENDING' }
}

async function getShotVideoStatus(taskId) {
  if (!DASHSCOPE_VIDEO_BASE_URL) {
    throw new Error('未配置 DASHSCOPE_WORKSPACE_ID。万相视频需要 WorkspaceId，请在 .env.local 中配置。')
  }

  const upstream = await fetch(`${DASHSCOPE_VIDEO_BASE_URL}/api/v1/tasks/${encodeURIComponent(taskId)}`, {
    headers: { Authorization: `Bearer ${DASHSCOPE_API_KEY}` },
  })
  const payload = await upstream.json()
  if (!upstream.ok) {
    const detail = payload?.message ?? payload?.error?.message ?? `万相视频状态查询失败（HTTP ${upstream.status}）。`
    throw new Error(detail)
  }

  const output = payload?.output ?? {}
  return {
    taskId,
    status: output.task_status ?? 'UNKNOWN',
    videoUrl: output.video_url ?? null,
    error: output.message ?? payload?.message ?? null,
  }
}

export async function handleRequest(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*' })
    res.end()
    return
  }

  const requestUrl = new URL(req.url, 'http://127.0.0.1')

  if (req.method === 'GET' && requestUrl.pathname === '/api/shot-video-status') {
    const taskId = requestUrl.searchParams.get('taskId')
    if (!taskId) {
      sendJson(res, 400, { error: '缺少视频任务 ID。' })
      return
    }
    try {
      sendJson(res, 200, await getShotVideoStatus(taskId))
    } catch (error) {
      const message = error instanceof Error ? error.message : '视频状态查询失败，请稍后重试。'
      sendJson(res, 502, { error: message })
    }
    return
  }

  if (req.method === 'GET' && requestUrl.pathname === '/api/image-task-status') {
    const taskId = requestUrl.searchParams.get('taskId')
    if (!taskId) {
      sendJson(res, 400, { error: '缺少图片任务 ID。' })
      return
    }
    try {
      sendJson(res, 200, await getImageTaskStatus(taskId))
    } catch (error) {
      const message = error instanceof Error ? error.message : '图片状态查询失败，请稍后重试。'
      sendJson(res, 502, { error: message })
    }
    return
  }

  if (!requestUrl.pathname.startsWith('/api/')) {
    serveStatic(requestUrl.pathname, res)
    return
  }

  if (req.method !== 'POST' || !['/api/generate', '/api/generate-character-image', '/api/generate-scene-image', '/api/generate-shot-image', '/api/generate-shot-video'].includes(requestUrl.pathname)) {
    sendJson(res, 404, { error: 'Not found' })
    return
  }

  if (requestUrl.pathname === '/api/generate-character-image') {
    try {
      const task = await generateCharacterImage(await readBody(req))
      sendJson(res, 202, task)
    } catch (error) {
      const message = error instanceof Error ? error.message : '角色图片生成失败，请稍后重试。'
      sendJson(res, 502, { error: message })
    }
    return
  }

  if (requestUrl.pathname === '/api/generate-scene-image') {
    try {
      const task = await generateSceneImage(await readBody(req))
      sendJson(res, 202, task)
    } catch (error) {
      const message = error instanceof Error ? error.message : '场景母本生成失败，请稍后重试。'
      sendJson(res, 502, { error: message })
    }
    return
  }

  if (requestUrl.pathname === '/api/generate-shot-image') {
    try {
      const task = await generateShotImage(await readBody(req))
      sendJson(res, 202, task)
    } catch (error) {
      const message = error instanceof Error ? error.message : '分镜画面生成失败，请稍后重试。'
      sendJson(res, 502, { error: message })
    }
    return
  }

  if (requestUrl.pathname === '/api/generate-shot-video') {
    try {
      sendJson(res, 202, await createShotVideo(await readBody(req)))
    } catch (error) {
      const message = error instanceof Error ? error.message : '视频生成任务创建失败，请稍后重试。'
      sendJson(res, 502, { error: message })
    }
    return
  }

  if (!API_KEY) {
    sendJson(res, 500, { error: '未配置 DEEPSEEK_API_KEY。请在本机环境变量中设置 API key。' })
    return
  }

  try {
    const body = await readBody(req)
    const source = typeof body.source === 'string' ? body.source.trim() : ''
    if (source.length < 20) {
      sendJson(res, 400, { error: '请先输入至少 20 个字的小说原文。' })
      return
    }

    const upstream = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: '你只返回符合要求的 JSON。' },
          { role: 'user', content: buildPrompt(source) },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.4,
        max_tokens: 12000,
      }),
    })

    const payload = await upstream.json()
    if (!upstream.ok) {
      const detail = payload?.error?.message ?? `DeepSeek 请求失败（HTTP ${upstream.status}）。`
      sendJson(res, 502, { error: detail })
      return
    }

    const choice = payload?.choices?.[0]
    if (choice?.finish_reason === 'length') {
      throw new Error('模型输出被截断了，请减少原文长度后重试，或提高 DEEPSEEK_MODEL 的输出上限。')
    }
    const content = choice?.message?.content
    if (typeof content !== 'string') throw new Error('DeepSeek 没有返回文本结果。')
    sendJson(res, 200, { project: parseProject(content) })
  } catch (error) {
    const message = error instanceof Error ? error.message : '生成失败，请稍后重试。'
    sendJson(res, 500, { error: message })
  }
}

const isDirectRun = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isDirectRun) {
  const server = http.createServer(handleRequest)
  server.listen(PORT, HOST, () => {
    console.log(`AI 漫剧 server listening on http://${HOST}:${PORT}`)
  })
}
