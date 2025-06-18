declare global {
  interface Window {
    context: {
      locale: string
      getConnectionString: () => Promise<string>
      setConnectionString: (connectionString: string) => Promise<boolean>
      runQuery: (query: string) => Promise<{ error: string | null; data: any }>
    }
  }
}

export {}
