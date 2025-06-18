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
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM users WHERE id = 1;')
  const [queryResults, setQueryResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [queryHistory, setQueryHistory] = useState<QueryHistory[]>([])

  const generateMockResults = (query: string) => {
    console.log(query)
    // Generate 50 rows with 12 columns for testing scrolling
    const mockResults = []
    for (let i = 1; i <= 50; i++) {
      mockResults.push({
        id: i,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        age: 20 + (i % 50),
        city: `City ${i % 10}`,
        country: `Country ${i % 5}`,
        department: `Dept ${i % 8}`,
        salary: 50000 + i * 1000,
        hire_date: `2024-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
        status: i % 3 === 0 ? 'active' : 'inactive',
        manager_id: i > 10 ? i - 10 : null,
        phone: `+1-${String(i).padStart(3, '0')}-${String(i * 2).padStart(4, '0')}`
      })
    }
    return mockResults
  }

  const handleRunQuery = async () => {
    setIsLoading(true)
    try {
      // Simulate query execution
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockResults = generateMockResults(sqlQuery)
      setQueryResults(mockResults)

      // Add to history
      const historyEntry: QueryHistory = {
        id: Date.now().toString(),
        query: sqlQuery,
        results: mockResults,
        timestamp: new Date()
      }

      setQueryHistory((prev) => [historyEntry, ...prev.slice(0, 19)]) // Keep last 20 queries
    } catch (error) {
      console.error('Query execution failed:', error)
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
