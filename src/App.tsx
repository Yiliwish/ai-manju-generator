import { useState } from 'react'
import Sidebar from './components/Sidebar'
import ImportStage from './stages/ImportStage'
import StoryboardStage from './stages/StoryboardStage'
import CharacterStage from './stages/CharacterStage'
import SceneStage from './stages/SceneStage'
import ShotStage from './stages/ShotStage'
import VoiceStage from './stages/VoiceStage'
import ExportStage from './stages/ExportStage'
import type { StageId } from './stages'

export default function App() {
  const [active, setActive] = useState<StageId>('import')

  return (
    <div className="flex h-dvh bg-zinc-950 text-zinc-100">
      <Sidebar active={active} onSelect={setActive} />
      <main className="min-w-0 flex-1 overflow-hidden">
        {active === 'import' && <ImportStage onNavigate={setActive} />}
        {active === 'storyboard' && <StoryboardStage />}
        {active === 'character' && <CharacterStage />}
        {active === 'scene' && <SceneStage />}
        {active === 'shot' && <ShotStage />}
        {active === 'voice' && <VoiceStage />}
        {active === 'export' && <ExportStage />}
      </main>
    </div>
  )
}
