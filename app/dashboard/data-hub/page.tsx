"use client"

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Calendar, RefreshCw, AlertCircle, CheckCircle, Link, Link2OffIcon as LinkOff } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import dynamic from 'next/dynamic'

interface DataSource {
  name: string
  displayName: string
  consentGranted: boolean
  connection: {
    status: "disconnected" | "connected" | "syncing" | "error"
    lastSyncedAt: string | null
    errorMessage: string | null
  }
}

// Dynamically import DataHubContent
const DataHubContent = dynamic(() => import('./page').then(mod => mod.DataHubContent), {
  ssr: false,
  loading: () => <div>Loading data sources...</div>
})

export default function DataHubPage() {
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-2">Data Hub</h1>
      <p className="text-muted-foreground mb-6">
        Connect external data sources to enrich your insights.
      </p>
      <Suspense fallback={<div>Loading data sources...</div>}>
        <DataHubContent />
      </Suspense>
    </div>
  )
}

function OriginalDataHubContent() {
  const [sources, setSources] = useState<DataSource[]>([])
  const [loading, setLoading] = useState(true)
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check for success/error messages in URL
  useEffect(() => {
    const success = searchParams.get("success")
    const error = searchParams.get("error")

    if (success === "google_connected") {
      toast({
        title: "Google Calendar Connected",
        description: "Your calendar data is now being synced.",
        variant: "default",
      })
      router.replace("/data-hub")
    } else if (error) {
      let errorMessage = "An error occurred while connecting to Google Calendar."

      switch (error) {
        case "google_auth_failed":
          errorMessage = "Google authentication failed. Please try again."
          break
        case "invalid_callback":
          errorMessage = "Invalid callback from Google. Please try again."
          break
        case "invalid_state":
          errorMessage = "Security verification failed. Please try again."
          break
        case "connection_failed":
          errorMessage = "Failed to establish connection. Please try again."
          break
      }

      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive",
      })
      router.replace("/data-hub")
    }
  }, [searchParams, toast, router])

  // Fetch data sources
  const fetchSources = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/hub/status")

      if (!response.ok) {
        throw new Error("Failed to fetch data sources")
      }

      const data = await response.json()
      setSources(data.sources)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data sources. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSources()
  }, [])

  // Handle connect button
  const handleConnect = async (sourceName: string) => {
    try {
      setActionInProgress(sourceName)
      const response = await fetch(`/api/hub/connect/${sourceName}`, {
        method: "POST",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to initiate connection")
      }

      const data = await response.json()

      // Redirect to Google auth URL
      window.location.href = data.authUrl
    } catch (error) {
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to initiate connection",
        variant: "destructive",
      })
      setActionInProgress(null)
    }
  }

  // Handle disconnect button
  const handleDisconnect = async (sourceName: string) => {
    try {
      setActionInProgress(sourceName)
      const response = await fetch(`/api/hub/disconnect/${sourceName}`, {
        method: "POST",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to disconnect")
      }

      toast({
        title: "Disconnected",
        description: `Successfully disconnected from ${sourceName === "google_calendar" ? "Google Calendar" : sourceName}`,
      })

      // Refresh sources
      fetchSources()
    } catch (error) {
      toast({
        title: "Disconnect Error",
        description: error instanceof Error ? error.message : "Failed to disconnect",
        variant: "destructive",
      })
    } finally {
      setActionInProgress(null)
    }
  }

  // Handle sync button
  const handleSync = async (sourceName: string) => {
    try {
      setActionInProgress(sourceName)
      const response = await fetch(`/api/hub/sync/${sourceName}`, {
        method: "POST",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to sync")
      }

      toast({
        title: "Sync Started",
        description: `Syncing your ${sourceName === "google_calendar" ? "Google Calendar" : sourceName} data...`,
      })

      // Refresh sources after a short delay
      setTimeout(fetchSources, 1000)
    } catch (error) {
      toast({
        title: "Sync Error",
        description: error instanceof Error ? error.message : "Failed to sync",
        variant: "destructive",
      })
    } finally {
      setActionInProgress(null)
    }
  }

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never"

    const date = new Date(dateString)
    return date.toLocaleString()
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "syncing":
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <LinkOff className="h-5 w-5 text-gray-500" />
    }
  }

  if (loading) {
    return <div className="text-center p-8">Loading data sources...</div>
  }

  return (
    <div className="space-y-6">
      {sources.map((source) => (
        <Card key={source.name} className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              {source.name === "google_calendar" && <Calendar className="h-5 w-5 text-purple-500" />}
              <CardTitle>{source.displayName}</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(source.connection.status)}
              <span className="text-sm capitalize">{source.connection.status}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor={`consent-${source.name}`} className="text-base">
                  Allow access to {source.displayName}
                </Label>
                <Switch
                  id={`consent-${source.name}`}
                  checked={source.consentGranted}
                  onCheckedChange={() => router.push("/settings/consent")}
                />
              </div>

              <div className="text-sm text-gray-500">
                <p>Last synced: {formatDate(source.connection.lastSyncedAt)}</p>
              </div>

              {source.connection.status === "error" && source.connection.errorMessage && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{source.connection.errorMessage}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            {source.connection.status === "disconnected" ? (
              <Button
                onClick={() => handleConnect(source.name)}
                disabled={!source.consentGranted || actionInProgress === source.name}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {actionInProgress === source.name ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Link className="mr-2 h-4 w-4" />
                    Connect
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => handleDisconnect(source.name)}
                variant="outline"
                disabled={actionInProgress === source.name}
              >
                {actionInProgress === source.name ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  <>
                    <LinkOff className="mr-2 h-4 w-4" />
                    Disconnect
                  </>
                )}
              </Button>
            )}

            {(source.connection.status === "connected" || source.connection.status === "error") && (
              <Button
                onClick={() => handleSync(source.name)}
                variant="secondary"
                disabled={!source.consentGranted || actionInProgress === source.name}
              >
                {actionInProgress === source.name ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Now
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
      {sources.length === 0 && (
        <p className="text-center text-muted-foreground">
          No data sources configured yet.
        </p>
      )}
    </div>
  )
}

// Export the original component for dynamic import resolution
export { OriginalDataHubContent as DataHubContent }
