// 漫剧项目领域模型：对应管线「脚本 → 分镜 → 角色 → 场景母本 → 画面 → 成片」

/** 角色状态时间轴上的一个节点：发生在某镜、状态如何变化（连续性档案） */
export interface CharacterState {
  shot: number
  note: string
}

/** 角色：用「身份串」锁定跨镜视觉一致性 */
export interface Character {
  id: string
  name: string
  role: string
  /** 身份串：固定描述，每镜复用，避免 AI 重新发挥导致长相漂移 */
  identity: string
  /** 状态时间轴：跨镜自动推进 */
  states: CharacterState[]
  /** 固定三联角色设定图 URL：正视全身图 + 头像 + 后视全身图 */
  image?: string
}

/** 场景母本：先定一张空场景母本图，锁住空间几何 */
export interface Scene {
  id: string
  name: string
  /** 空场景母本图 URL（根据 geometry 生成，用于后续镜头垫图） */
  masterPlate?: string
  /** 空间几何描述：墙/门/家具的固定关系，锁构图的依据 */
  geometry: string
  /** 引用该场景的镜头号 */
  shots: number[]
}

export type ShotType = '对白' | '旁白' | '动作' | '空镜'

/** 镜头：分镜脚本的最小单元 */
export interface Shot {
  id: number
  sceneId: string
  characters: string[]
  duration: number
  type: ShotType
  text: string
  camera: string
  /** 垫图权重（%）：从母本锁构图的强度，55–70 为推荐区间 */
  plateWeight?: number
  /** 根据场景母本、角色身份串和镜头描述生成的派生画面 URL */
  image?: string
  /** 根据分镜首帧和运镜描述生成的真实视频 URL */
  video?: string
  /** 视频任务状态：异步生成期间用于显示进度 */
  videoStatus?: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED' | 'UNKNOWN'
  /** 动效 / 运镜 */
  motion?: string
}

export interface Project {
  id: string
  title: string
  source: string
  style: string
  aspect: '9:16'
  /** 原文节选，展示在「导入原文」屏 */
  originalExcerpt: string
  characters: Character[]
  scenes: Scene[]
  shots: Shot[]
}
