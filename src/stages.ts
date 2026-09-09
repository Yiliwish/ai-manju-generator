import {
  FileText,
  LayoutGrid,
  Users,
  Image as ImageIcon,
  Clapperboard,
  Download,
  type LucideIcon,
} from 'lucide-react'

export type StageId =
  | 'import'
  | 'storyboard'
  | 'character'
  | 'scene'
  | 'shot'
  | 'export'

export interface Stage {
  id: StageId
  /** 管线序号，从 1 开始 */
  index: number
  /** 屏名 */
  name: string
  /** 对应的管线环节 */
  pipeline: string
  /** 副标题：这一屏在讲什么 */
  subtitle: string
  /** 是否为「一致性」核心差异点 */
  highlight?: boolean
  icon: LucideIcon
}

export const STAGES: Stage[] = [
  {
    id: 'import',
    index: 1,
    name: '导入原文',
    pipeline: '脚本',
    subtitle: '粘贴或选择小说章节，一键开始',
    icon: FileText,
  },
  {
    id: 'storyboard',
    index: 2,
    name: '智能分镜',
    pipeline: '分镜',
    subtitle: 'AI 拆出逐镜头脚本，可拖动调整',
    icon: LayoutGrid,
  },
  {
    id: 'character',
    index: 3,
    name: '角色设定',
    pipeline: '角色设定图',
    subtitle: '生成角色形象，锁定跨镜一致性',
    icon: Users,
  },
  {
    id: 'scene',
    index: 4,
    name: '场景母本',
    pipeline: '一致性核心',
    subtitle: '母本锁构图，治场景空间漂移',
    highlight: true,
    icon: ImageIcon,
  },
  {
    id: 'shot',
    index: 5,
    name: '分镜画面',
    pipeline: '图生视频',
    subtitle: '逐镜头从母本派生画面',
    icon: Clapperboard,
  },
  {
    id: 'export',
    index: 6,
    name: '字幕成片',
    pipeline: '字幕 + 合成',
    subtitle: '字幕校对、竖屏预览与导出',
    icon: Download,
  },
]
