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
  const [openAIApiKey, setOpenAIApiKey] = useState<string>('')
  const [apiKeyError, setApiKeyError] = useState<string | null>(null)
  const [apiKeySuccess, setApiKeySuccess] = useState<string | null>(null)
  const [isSavingApiKey, setIsSavingApiKey] = useState(false)

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

  // Load the saved OpenAI API key when the component mounts
  useEffect(() => {
    const loadSavedApiKey = async () => {
      try {
        const savedApiKey = await window.context.getOpenAiKey()
        if (savedApiKey) {
          setOpenAIApiKey(savedApiKey)
        }
      } catch (error: any) {
        setApiKeyError('Failed to load the OpenAI API key. Please try again.')
      }
    }
    loadSavedApiKey()
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

  const updateOpenAIApiKey = async () => {
    setIsSavingApiKey(true)
    setApiKeySuccess(null)
    setApiKeyError(null)
    try {
      await window.context.setOpenAiKey(openAIApiKey)
      setApiKeyError(null)
      setApiKeySuccess('OpenAI API key saved successfully.')
    } catch (error: any) {
      setApiKeyError('Failed to save the OpenAI API key: ' + error.message)
    } finally {
      setIsSavingApiKey(false)
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">OpenAI API Key</CardTitle>
              <CardDescription className="text-xs">
                Enter your OpenAI API key to enable AI-powered features.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="space-y-1.5">
            <Label htmlFor="openai-api-key" className="text-xs">
              API Key
            </Label>
            <Input
              id="openai-api-key"
              value={openAIApiKey}
              onChange={(e) => setOpenAIApiKey(e.target.value)}
              placeholder="sk-..."
              className="font-mono text-xs h-8"
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              You can create an API key at{' '}
              <a
                href="https://platform.openai.com/account/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                OpenAI API Keys
              </a>
              .
            </p>
            {apiKeyError && <p className="text-xs text-destructive">{apiKeyError}</p>}
            {apiKeySuccess && <p className="text-xs text-green-500">{apiKeySuccess}</p>}
          </div>

          <Button
            onClick={updateOpenAIApiKey}
            disabled={isSavingApiKey || !openAIApiKey.trim()}
            className="flex items-center space-x-1.5 h-8 px-3 text-xs"
            size="sm"
          >
            <span>{isSavingApiKey ? 'Saving...' : 'Save Key'}</span>
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
