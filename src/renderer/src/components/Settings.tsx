import { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { TestTube } from 'lucide-react'
import { useToast } from '../hooks/use-toast'

export const Settings = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isTesting, setIsTesting] = useState(false)
  const [connectionString, setConnectionString] = useState<string>('')

  const { toast } = useToast()

  // Load the saved connection string when the component mounts
  useEffect(() => {
    const loadSavedConnectionString = async () => {
      try {
        const savedConnectionString = await window.context.getConnectionString()
        if (savedConnectionString) {
          setConnectionString(savedConnectionString)
        }
      } catch (error) {
        toast({
          title: 'Error loading connection string',
          description: 'Failed to load the connection string. Please try again.',
          variant: 'destructive'
        })
      }
    }

    loadSavedConnectionString()
  }, [toast])

  const updateConnectionString = async () => {
    setIsTesting(true)
    setSuccessMessage(null)
    setErrorMessage(null)
    try {
      const result = await window.context.setConnectionString(connectionString)
      if (!result) {
        throw new Error('Failed to save connection string')
      }
      setErrorMessage(null)
      setSuccessMessage('Connection string saved successfully.')
    } catch (error) {
      console.error('Error saving connection string:', error)
      setErrorMessage(
        'Failed to connect to the database. Please check your connection string or server and try again.'
      )
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h2 className="text-lg font-bold">Settings</h2>
        <p className="text-muted-foreground text-sm">
          Configure your PostgreSQL database connection.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Database Connection</CardTitle>
              <CardDescription className="text-xs">
                Enter your PostgreSQL connection string to connect to your database.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="space-y-1.5">
            <Label htmlFor="connection-string" className="text-xs">
              Connection String
            </Label>
            <Input
              id="connection-string"
              value={connectionString}
              onChange={(e) => setConnectionString(e.target.value)}
              placeholder="postgresql://username:password@hostname:port/database"
              className="font-mono text-xs h-8"
            />
            <p className="text-xs text-muted-foreground">
              Format: postgresql://username:password@hostname:port/database
            </p>
            {errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}
            {successMessage && <p className="text-xs text-green-500">{successMessage}</p>}
          </div>

          <Button
            onClick={updateConnectionString}
            disabled={isTesting || !connectionString.trim()}
            className="flex items-center space-x-1.5 h-8 px-3 text-xs"
            size="sm"
          >
            <TestTube className="w-3.5 h-3.5" />
            <span>{isTesting ? 'Testing Connection...' : 'Test & Set'}</span>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">About</CardTitle>
          <CardDescription className="text-xs">
            PostgreSQL Query Builder and Executor
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version:</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform:</span>
              <span>Electron + React</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">UI Library:</span>
              <span>shadcn/ui</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
