import { Image as ImageIcon } from 'lucide-react'

interface ImageSlotProps {
  src?: string
  label?: string
  className?: string
}

/** 图片展示槽：有图显示图，无图显示等待生成状态 */
export default function ImageSlot({ src, label, className = '' }: ImageSlotProps) {
  if (src) {
    return <img src={src} alt={label ?? ''} className={`h-full w-full object-cover ${className}`} />
  }
  return (
    <div
      className={`flex h-full w-full items-center justify-center border border-dashed border-zinc-700 bg-zinc-900 ${className}`}
    >
      <div className="flex flex-col items-center gap-1.5 px-3 text-center text-zinc-600">
        <ImageIcon className="size-6" />
        <span className="text-xs">{label ?? '等待生成'}</span>
      </div>
    </div>
  )
}
