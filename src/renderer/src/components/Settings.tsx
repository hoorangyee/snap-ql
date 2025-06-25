import { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible'
import { TestTube, ChevronDown } from 'lucide-react'
import { useToast } from '../hooks/use-toast'
import { ModeToggle } from './ui/mode-toggle'

export const Settings = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isTesting, setIsTesting] = useState(false)
  const [connectionString, setConnectionString] = useState<string>('')
  const [openAIApiKey, setOpenAIApiKey] = useState<string>('')
  const [apiKeyError, setApiKeyError] = useState<string | null>(null)
  const [apiKeySuccess, setApiKeySuccess] = useState<string | null>(null)
  const [isSavingApiKey, setIsSavingApiKey] = useState(false)
  const [openAIBaseUrl, setOpenAIBaseUrl] = useState<string>('')
  const [baseUrlError, setBaseUrlError] = useState<string | null>(null)
  const [baseUrlSuccess, setBaseUrlSuccess] = useState<string | null>(null)
  const [isSavingBaseUrl, setIsSavingBaseUrl] = useState(false)
  const [openAIModel, setOpenAIModel] = useState<string>('')
  const [modelError, setModelError] = useState<string | null>(null)
  const [modelSuccess, setModelSuccess] = useState<string | null>(null)
  const [isSavingModel, setIsSavingModel] = useState(false)
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)

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

  // Load the saved OpenAI base URL when the component mounts
  useEffect(() => {
    const loadSavedBaseUrl = async () => {
      try {
        const savedBaseUrl = await window.context.getOpenAiBaseUrl()
        if (savedBaseUrl) {
          setOpenAIBaseUrl(savedBaseUrl)
        }
      } catch (error: any) {
        setBaseUrlError('Failed to load the OpenAI base URL. Please try again.')
      }
    }
    loadSavedBaseUrl()
  }, [toast])

  // Load the saved OpenAI model when the component mounts
  useEffect(() => {
    const loadSavedModel = async () => {
      try {
        const savedModel = await window.context.getOpenAiModel()
        if (savedModel) {
          setOpenAIModel(savedModel)
        }
      } catch (error: any) {
        setModelError('Failed to load the OpenAI model. Please try again.')
      }
    }
    loadSavedModel()
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

  const updateOpenAIBaseUrl = async () => {
    setIsSavingBaseUrl(true)
    setBaseUrlSuccess(null)
    setBaseUrlError(null)
    try {
      await window.context.setOpenAiBaseUrl(openAIBaseUrl)
      setBaseUrlError(null)
      setBaseUrlSuccess('Base URL saved successfully.')
    } catch (error: any) {
      setBaseUrlError('Failed to save the OpenAI base URL: ' + error.message)
    } finally {
      setIsSavingBaseUrl(false)
    }
  }

  const updateOpenAIModel = async () => {
    setIsSavingModel(true)
    setModelSuccess(null)
    setModelError(null)
    try {
      await window.context.setOpenAiModel(openAIModel)
      setModelError(null)
      setModelSuccess('Model ID saved successfully.')
    } catch (error: any) {
      setModelError('Failed to save the OpenAI model: ' + error.message)
    } finally {
      setIsSavingModel(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h2 className="text-lg font-bold">Settings</h2>
        <p className="text-muted-foreground text-sm">
          Configure your MSSQL database connection.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Database Connection</CardTitle>
              <CardDescription className="text-xs">
                Enter your MSSQL connection string to connect to your database.
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
              type="password"
              value={connectionString}
              onChange={(e) => setConnectionString(e.target.value)}
              placeholder="mssql://username:password@hostname:port/database"
              className="font-mono text-xs h-8"
            />
            <p className="text-xs text-muted-foreground">
              Format: mssql://username:password@hostname:port/database
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
              type="password"
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

          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-1.5 h-8 px-3 text-xs">
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`}
                />
                <span>Advanced Options</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-3">
              <div className="space-y-1.5">
                <Label htmlFor="openai-base-url" className="text-xs">
                  Base URL (Optional)
                </Label>
                <Input
                  id="openai-base-url"
                  type="text"
                  value={openAIBaseUrl}
                  onChange={(e) => setOpenAIBaseUrl(e.target.value)}
                  placeholder="https://api.openai.com/v1"
                  className="font-mono text-xs h-8"
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  Custom base URL for OpenAI API. Leave empty to use the default OpenAI endpoint.
                  Useful for OpenAI-compatible APIs like Azure OpenAI or local models.
                </p>
                {baseUrlError && <p className="text-xs text-destructive">{baseUrlError}</p>}
                {baseUrlSuccess && <p className="text-xs text-green-500">{baseUrlSuccess}</p>}
              </div>

              <Button
                onClick={updateOpenAIBaseUrl}
                disabled={isSavingBaseUrl}
                className="flex items-center space-x-1.5 h-8 px-3 text-xs"
                size="sm"
                variant="outline"
              >
                <span>{isSavingBaseUrl ? 'Saving...' : 'Save Base URL'}</span>
              </Button>

              <div className="space-y-1.5">
                <Label htmlFor="openai-model" className="text-xs">
                  Model (Optional)
                </Label>
                <Input
                  id="openai-model"
                  type="text"
                  value={openAIModel}
                  onChange={(e) => setOpenAIModel(e.target.value)}
                  placeholder="gpt-4o"
                  className="font-mono text-xs h-8"
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  Model ID to use for query generation. Leave empty to use gpt-4o (default).
                  Examples: gpt-4, gpt-3.5-turbo, claude-3-sonnet, or custom model names.
                </p>
                {modelError && <p className="text-xs text-destructive">{modelError}</p>}
                {modelSuccess && <p className="text-xs text-green-500">{modelSuccess}</p>}
              </div>

              <Button
                onClick={updateOpenAIModel}
                disabled={isSavingModel}
                className="flex items-center space-x-1.5 h-8 px-3 text-xs"
                size="sm"
                variant="outline"
              >
                <span>{isSavingModel ? 'Saving...' : 'Save Model'}</span>
              </Button>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Theme Settings</CardTitle>
          <CardDescription className="text-xs">
            Toggle between light, dark, and system themes.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex">
            <ModeToggle />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">About</CardTitle>
          <CardDescription className="text-xs">
            MSSQL Query Builder and Executor
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
