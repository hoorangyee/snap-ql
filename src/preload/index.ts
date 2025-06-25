import { contextBridge, ipcRenderer } from 'electron'

if (!process.contextIsolated) {
  throw new Error('Context isolation must be enabled!')
}

try {
  contextBridge.exposeInMainWorld('context', {
    locale: navigator.language,
    getConnectionConfig: async () => await ipcRenderer.invoke('getConnectionConfig'),
    setConnectionConfig: async (config: any) =>
      await ipcRenderer.invoke('setConnectionConfig', config),
    runQuery: async (query: string) => await ipcRenderer.invoke('runQuery', query),
    generateQuery: async (input: string, sqlQuery: string) =>
      await ipcRenderer.invoke('generateQuery', input, sqlQuery),
    getOpenAiKey: async () => await ipcRenderer.invoke('getOpenAiKey'),
    setOpenAiKey: async (openAiKey: string) => await ipcRenderer.invoke('setOpenAiKey', openAiKey),
    getOpenAiBaseUrl: async () => await ipcRenderer.invoke('getOpenAiBaseUrl'),
    setOpenAiBaseUrl: async (openAiBaseUrl: string) =>
      await ipcRenderer.invoke('setOpenAiBaseUrl', openAiBaseUrl),
    getOpenAiModel: async () => await ipcRenderer.invoke('getOpenAiModel'),
    setOpenAiModel: async (openAiModel: string) =>
      await ipcRenderer.invoke('setOpenAiModel', openAiModel)
  })
} catch (error) {
  console.error(error)
}
