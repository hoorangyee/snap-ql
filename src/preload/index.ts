import { contextBridge } from 'electron'

if (!process.contextIsolated) {
  throw new Error('Context isolation must be enabled!')
}

try {
  contextBridge.exposeInMainWorld('context', {
    // TODO: Add API here
  })
} catch (error) {
  console.error(error)
}
