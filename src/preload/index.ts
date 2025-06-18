import { contextBridge, ipcRenderer } from 'electron'

if (!process.contextIsolated) {
  throw new Error('Context isolation must be enabled!')
}

try {
  contextBridge.exposeInMainWorld('context', {
    locale: navigator.language,
    getConnectionString: async () => await ipcRenderer.invoke('getConnectionString'),
    setConnectionString: async (connectionString: string) =>
      await ipcRenderer.invoke('setConnectionString', connectionString),
    runQuery: async (query: string) => await ipcRenderer.invoke('runQuery', query)
  })
} catch (error) {
  console.error(error)
}
