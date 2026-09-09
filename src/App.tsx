import { useState } from 'react'
import Sidebar from './components/Sidebar'
import ImportStage from './stages/ImportStage'
import StoryboardStage from './stages/StoryboardStage'
import CharacterStage from './stages/CharacterStage'
import SceneStage from './stages/SceneStage'
import ShotStage from './stages/ShotStage'
import ExportStage from './stages/ExportStage'
import type { StageId } from './stages'
import type { Project } from './types'
import { exampleProject } from './data/exampleProject'
import {
  generateCharacterImage,
  generateProject,
  generateSceneImage,
  generateShotImage,
  generateShotVideo,
} from './api'

export default function App() {
  const [active, setActive] = useState<StageId>('import')
  const [project, setProject] = useState<Project>(exampleProject)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatingCharacterId, setGeneratingCharacterId] = useState<string | null>(null)
  const [characterError, setCharacterError] = useState<string | null>(null)
  const [generatingSceneId, setGeneratingSceneId] = useState<string | null>(null)
  const [sceneError, setSceneError] = useState<string | null>(null)
  const [generatingShotId, setGeneratingShotId] = useState<number | null>(null)
  const [shotError, setShotError] = useState<string | null>(null)
  const [generatingVideoId, setGeneratingVideoId] = useState<number | null>(null)
  const [videoProgress, setVideoProgress] = useState<string | null>(null)
  const [videoError, setVideoError] = useState<string | null>(null)

  const handleGenerate = async (source: string) => {
    setIsGenerating(true)
    setError(null)
    try {
      const generatedProject = await generateProject(source)
      setProject(generatedProject)
      setActive('storyboard')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '生成失败，请稍后重试。')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateCharacterImage = async (characterId: string) => {
    const character = project.characters.find((item) => item.id === characterId)
    if (!character) return

    setGeneratingCharacterId(characterId)
    setCharacterError(null)
    try {
      const imageUrl = await generateCharacterImage(character, project.style)
      setProject((current) => ({
        ...current,
        characters: current.characters.map((item) =>
          item.id === characterId ? { ...item, image: imageUrl } : item,
        ),
      }))
    } catch (cause) {
      setCharacterError(cause instanceof Error ? cause.message : '角色图片生成失败，请稍后重试。')
    } finally {
      setGeneratingCharacterId(null)
    }
  }

  const handleGenerateSceneImage = async (sceneId: string) => {
    const scene = project.scenes.find((item) => item.id === sceneId)
    if (!scene) return

    setGeneratingSceneId(sceneId)
    setSceneError(null)
    try {
      const imageUrl = await generateSceneImage(scene, project.style)
      setProject((current) => ({
        ...current,
        scenes: current.scenes.map((item) =>
          item.id === sceneId ? { ...item, masterPlate: imageUrl } : item,
        ),
      }))
    } catch (cause) {
      setSceneError(cause instanceof Error ? cause.message : '场景母本生成失败，请稍后重试。')
    } finally {
      setGeneratingSceneId(null)
    }
  }

  const handleGenerateShotImage = async (shotId: number) => {
    const shot = project.shots.find((item) => item.id === shotId)
    const scene = project.scenes.find((item) => item.id === shot?.sceneId)
    if (!shot || !scene) return

    const characters = project.characters.filter((character) => shot.characters.includes(character.id))
    setGeneratingShotId(shotId)
    setShotError(null)
    try {
      const imageUrl = await generateShotImage(shot, scene, characters, project.style)
      setProject((current) => ({
        ...current,
        shots: current.shots.map((item) => (item.id === shotId ? { ...item, image: imageUrl } : item)),
      }))
    } catch (cause) {
      setShotError(cause instanceof Error ? cause.message : '分镜画面生成失败，请稍后重试。')
    } finally {
      setGeneratingShotId(null)
    }
  }

  const handleGenerateShotVideo = async (shotId: number) => {
    const shot = project.shots.find((item) => item.id === shotId)
    const scene = project.scenes.find((item) => item.id === shot?.sceneId)
    if (!shot || !scene) return

    const characters = project.characters.filter((character) => shot.characters.includes(character.id))
    setGeneratingVideoId(shotId)
    setVideoError(null)
    setVideoProgress('准备首帧…')

    try {
      let imageUrl = shot.image ?? ''
      if (!/^https?:\/\//i.test(imageUrl)) {
        setVideoProgress('正在生成首帧画面…')
        imageUrl = await generateShotImage(shot, scene, characters, project.style)
        setProject((current) => ({
          ...current,
          shots: current.shots.map((item) => (item.id === shotId ? { ...item, image: imageUrl } : item)),
        }))
      }

      setVideoProgress('正在创建视频任务…')
      const videoUrl = await generateShotVideo(
        shot,
        scene,
        characters,
        project.style,
        imageUrl,
        (status) => {
          const labels: Record<string, string> = {
            PENDING: '视频排队中…',
            RUNNING: '视频生成中…',
            SUCCEEDED: '视频生成完成',
          }
          setVideoProgress(labels[status] ?? '正在查询视频状态…')
        },
      )
      setProject((current) => ({
        ...current,
        shots: current.shots.map((item) =>
          item.id === shotId ? { ...item, image: imageUrl, video: videoUrl, videoStatus: 'SUCCEEDED' } : item,
        ),
      }))
    } catch (cause) {
      setVideoError(cause instanceof Error ? cause.message : '视频生成失败，请稍后重试。')
    } finally {
      setGeneratingVideoId(null)
      setVideoProgress(null)
    }
  }

  return (
    <div className="flex h-dvh bg-zinc-950 text-zinc-100">
      <Sidebar active={active} onSelect={setActive} />
      <main className="min-w-0 flex-1 overflow-hidden">
        {active === 'import' && (
          <ImportStage
            project={project}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            error={error}
          />
        )}
        {active === 'storyboard' && <StoryboardStage project={project} />}
        {active === 'character' && (
          <CharacterStage
            project={project}
            onGenerateImage={handleGenerateCharacterImage}
            generatingCharacterId={generatingCharacterId}
            error={characterError}
          />
        )}
        {active === 'scene' && (
          <SceneStage
            project={project}
            onGenerateImage={handleGenerateSceneImage}
            generatingSceneId={generatingSceneId}
            error={sceneError}
          />
        )}
        {active === 'shot' && (
          <ShotStage
            project={project}
            onGenerateImage={handleGenerateShotImage}
            generatingShotId={generatingShotId}
            error={shotError}
            onGenerateVideo={handleGenerateShotVideo}
            generatingVideoId={generatingVideoId}
            videoProgress={videoProgress}
            videoError={videoError}
          />
        )}
        {active === 'export' && <ExportStage project={project} />}
      </main>
    </div>
  )
}
