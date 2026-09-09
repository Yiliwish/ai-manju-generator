# 漫造 · AI 漫剧生成器

这是一个 Vite + React 的 AI 漫剧创作 MVP。在「导入原文」页面输入小说后，会生成结构化的角色、场景和分镜数据，并同步到后续页面。

## 本地运行

1. 复制 `.env.example` 为 `.env.local`。
2. 在 `.env.local` 中填入自己的 DeepSeek API Key：

   ```env
   DEEPSEEK_API_KEY=你的key
   DEEPSEEK_MODEL=deepseek-v4-flash
   DASHSCOPE_API_KEY=你的百炼APIKey
   DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com
   DASHSCOPE_IMAGE_MODEL=qwen-image-3.0-pro
   DASHSCOPE_WORKSPACE_ID=你的百炼WorkspaceId
   DASHSCOPE_VIDEO_MODEL=MiniMax/MiniMax-H3
   ```

   `.env.local` 已被 Git 忽略，key 不会进入前端构建产物。

3. 开两个终端，分别运行：

   ```bash
   npm run api
   npm run dev
   ```

4. 打开 Vite 输出的本地地址，进入「导入原文」并点击「开始生成」。

如果当前账号暂不支持 `deepseek-v4-flash`，把 `DEEPSEEK_MODEL` 改成 DeepSeek 控制台中可用的模型名即可。

## 当前能力

- DeepSeek：小说解析、项目元信息、角色设定、场景描述和分镜脚本。
- 通义万相 `qwen-image-3.0-pro`：角色三联设定图、场景母本、分镜画面。
- MiniMax H3：以分镜首帧生成真实动态视频，异步轮询任务状态。
- 浏览器端 Canvas + MediaRecorder：将分镜画面和字幕录制为可下载的 WebM 预览片。

万相视频需要百炼 WorkspaceId 和视频额度；视频生成通常需要等待数分钟，结果链接有效期有限。当前导出预览仍为 WebM，不是带服务端音轨的最终 MP4。

## Vercel 免费部署

项目已包含 `vercel.json`，可直接从 GitHub 导入。部署时在 Vercel 的环境变量中填写 `DEEPSEEK_API_KEY`、`DASHSCOPE_API_KEY` 和 `DASHSCOPE_WORKSPACE_ID`；其余模型与地域配置可沿用 `.env.example` 中的值。线上 API 由 `api/[...path].mjs` 提供，本地运行方式不变。
