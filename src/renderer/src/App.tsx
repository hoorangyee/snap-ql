import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { SQLEditor } from './components/SQLEditor'
import { ResultsTable } from './components/ResultsTable'
import { AIChat } from './components/AIChat'
import { Settings } from './components/Settings'
import { Toaster } from './components/ui/toaster'

interface QueryHistory {
  id: string
  query: string
  results: any[]
  timestamp: Date
}

const Index = () => {
  const [currentView, setCurrentView] = useState<'editor' | 'settings'>('editor')
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM information_schema.tables;')
  const [queryResults, setQueryResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [queryHistory, setQueryHistory] = useState<QueryHistory[]>([])
  const [rawResults, setRawResults] = useState<any>('Test')
  const [error, setError] = useState<string | null>(null)

  const handleRunQuery = async () => {
    setIsLoading(true)
    try {
      setRawResults('Running query...')
      const res = await window.context.runQuery(sqlQuery)
      if (res.error) {
        setError(res.error)
        setQueryResults([])
      } else {
        setQueryResults(res.data)
        setError(null)

        // Add to history
        const historyEntry: QueryHistory = {
          id: Date.now().toString(),
          query: sqlQuery,
          results: res.data,
          timestamp: new Date()
        }

        setQueryHistory((prev) => [historyEntry, ...prev.slice(0, 19)]) // Keep last 20 queries
      }
    } catch (error: any) {
      console.error('Query execution failed:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAIQuery = (generatedQuery: string) => {
    setSqlQuery(generatedQuery)
  }

  const handleHistorySelect = (historyItem: QueryHistory) => {
    setSqlQuery(historyItem.query)
    setQueryResults(historyItem.results)
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        queryHistory={queryHistory}
        onHistorySelect={handleHistorySelect}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* AI Chat Header */}
        <div className="border-b bg-card p-3 flex-shrink-0">
          <AIChat onQueryGenerated={handleAIQuery} />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-3 min-h-0">
          {currentView === 'editor' ? (
            <div className="space-y-3 h-full flex flex-col">
              <div className="flex-shrink-0">
                <SQLEditor
                  value={sqlQuery}
                  onChange={setSqlQuery}
                  onRun={handleRunQuery}
                  isLoading={isLoading}
                />
              </div>
              {error && <div className="text-red-500">{error}</div>}
              <div className="flex-1 min-h-0">
                <ResultsTable results={queryResults} isLoading={isLoading} query={sqlQuery} />
              </div>
            </div>
          ) : (
            <Settings />
          )}
        </div>
      </div>

      <Toaster />
    </div>
  )
}

export default Index
