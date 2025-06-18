import { homedir } from 'os'
import fs from 'fs-extra'

import { z } from 'zod'

const settingsSchema = z.object({
  connectionString: z.string().nullable(),
})

const defaultSettings = {
  connectionString: null,
}

function rootDir() {
  return `${homedir()}/SnapQL`
}

async function settingsPath() {
  const root = rootDir()
  await fs.ensureDir(root)
  return `${root}/settings.json`
}

async function getSettings() {
  const path = await settingsPath()
  let settings
  try {
    settings = await fs.readJson(path)
    settings = settingsSchema.parse(settings)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(error.message)
    }
    settings = defaultSettings
    await fs.writeJson(path, settings)
  }
  return settings
}

async function setSettings(settings: z.infer<typeof settingsSchema>) {
  const path = await settingsPath()
  await fs.writeJson(path, settings)
}

export async function getConnectionString() {
  const settings = await getSettings()
  return settings.connectionString
}

export async function setConnectionString(connectionString: string) {
  const settings = await getSettings()
  settings.connectionString = connectionString
  await setSettings(settings)
}
