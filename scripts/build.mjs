import { build } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

await build({
  configFile: false,
  root: process.cwd(),
  base: '/',
  publicDir: false,
  plugins: [react()],
  build: {
    outDir: 'dist-vite',
  },
})

const publicDir = path.resolve(process.cwd(), 'public')
const outputDir = path.resolve(process.cwd(), 'dist-vite')
fs.cpSync(publicDir, outputDir, {
  recursive: true,
  filter: (source) => !source.toLowerCase().endsWith('.rar'),
})
