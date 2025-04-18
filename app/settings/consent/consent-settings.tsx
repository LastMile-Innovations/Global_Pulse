"use client"

import { Button } from "@/components/ui/button"

import { CardFooter } from "@/components/ui/card"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, CheckCircle2, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { SessionConsentControls } from "@/components/settings/session-consent-controls"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"

// Define tooltip texts
const consentTooltips = {
  consentDataProcessing: "Required for core platform functionality.",
  consentDetailedAnalysisLogging: "Store detailed analysis of your interactions for personalized insights.",
  consentAnonymizedPatternTraining: "Allow anonymized data to improve the platform's understanding.",
  consentAggregation: "Allow your anonymized data to be included in aggregate insights.",
  allowSomaticPrompts: "Receive prompts about potential physical sensations during emotional moments.",
  allowDistressConsentCheck: "Allow Pulse to check in about data contributions during moments of distress.",
  consentNarrativeTraining: "Allow your anonymized narratives to be used for training the AI model.",
  showMyReflectionsInDashboard: "Show AI-generated reflections and insights on your personal dashboard.",
}

interface ConsentSettingsProps {
  userID: string
  consentDataProcessing: boolean
  allowSomaticPrompts: boolean
  consentDetailedAnalysisLogging: boolean
  consentAnonymizedPatternTraining: boolean
  allowDistressConsentCheck: boolean
  consentAggregation: boolean
  consentSaleOptIn: boolean
  consentNarrativeTraining: boolean
  showMyReflectionsInDashboard: boolean
  lastConsentUpdate: number
  createdAt: number
  updatedAt: number
  dataSourceConsents?: string | null
}

export default function ConsentSettings() {
  const [settings, setSettings] = useState<ConsentSettingsProps>({
    userID: "",
    consentDataProcessing: true,
    allowSomaticPrompts: false,
    consentDetailedAnalysisLogging: false,
    consentAnonymizedPatternTraining: false,
    allowDistressConsentCheck: false,
    consentAggregation: false,
    consentSaleOptIn: false,
    consentNarrativeTraining: false,
    showMyReflectionsInDashboard: false,
    lastConsentUpdate: 0,
    createdAt: 0,
    updatedAt: 0,
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [sessionId, setSessionId] = useState("")

  const { toast } = useToast()

  // Fetch current settings on component mount
  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch("/api/profile/consents")

        if (!response.ok) {
          throw new Error("Failed to fetch consent settings")
        }

        const data = await response.json()
        setSettings((prevSettings) => ({
          ...prevSettings,
          ...data,
          consentNarrativeTraining: data.consentNarrativeTraining ?? false,
          showMyReflectionsInDashboard: data.showMyReflectionsInDashboard ?? false,
        }))
        setError(null)

        // Get current session ID
        setSessionId(localStorage.getItem("sessionId") || "default-session")
      } catch (err) {
        setError("Failed to load your consent settings. Please try again later.")
        toast({
          title: "Error",
          description: "Failed to load consent settings",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [toast])

  // Handle toggle changes
  const handleToggle = (
    key: keyof Omit<
      ConsentSettingsProps,
      "userID" | "lastConsentUpdate" | "createdAt" | "updatedAt" | "dataSourceConsents"
    >,
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))

    // Clear any previous success message
    setSuccess(false)
  }

  // Save settings
  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch("/api/profile/consents", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          consentDataProcessing: settings.consentDataProcessing,
          allowSomaticPrompts: settings.allowSomaticPrompts,
          consentDetailedAnalysisLogging: settings.consentDetailedAnalysisLogging,
          consentAnonymizedPatternTraining: settings.consentAnonymizedPatternTraining,
          allowDistressConsentCheck: settings.allowDistressConsentCheck,
          consentAggregation: settings.consentAggregation,
          consentSaleOptIn: settings.consentSaleOptIn,
          consentNarrativeTraining: settings.consentNarrativeTraining,
          showMyReflectionsInDashboard: settings.showMyReflectionsInDashboard,
          dataSourceConsents: settings.dataSourceConsents,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update consent settings")
      }

      setSuccess(true)
      toast({
        title: "Success",
        description: "Your consent settings have been updated",
        variant: "default",
      })
    } catch (err) {
      setError("Failed to save your consent settings. Please try again.")
      toast({
        title: "Error",
        description: "Failed to update consent settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Reset to defaults
  const handleReset = () => {
    setSettings((prev) => ({
      ...prev,
      consentDataProcessing: true, // Default true
      allowSomaticPrompts: false, // Default false
      consentDetailedAnalysisLogging: false, // Default false
      consentAnonymizedPatternTraining: false, // Default false
      allowDistressConsentCheck: false, // Default false
      consentAggregation: false, // Default false
      consentSaleOptIn: false, // Default false
      consentNarrativeTraining: false, // Default false
      showMyReflectionsInDashboard: false, // Default false
    }))
    setSuccess(false)
  }

  // Format timestamp to readable date
  const formatDate = (timestamp: number) => {
    if (!timestamp) return "N/A"
    return new Date(timestamp).toLocaleString()
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Privacy & Consent Settings</CardTitle>
        <CardDescription>
          Control how your data is used and what features are enabled. Last updated:{" "}
          {formatDate(settings.lastConsentUpdate)}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert variant="default" className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success</AlertTitle>
                <AlertDescription className="text-green-700">
                  Your consent settings have been updated successfully.
                </AlertDescription>
              </Alert>
            )}

            <TooltipProvider>
              {/* Core Functionality & Personal Insights */}
              <Card className="border-purple-100">
                <CardHeader>
                  <CardTitle>🔒 Core Functionality & Personal Insights</CardTitle>
                  <CardDescription>Settings that enable core features and personalized insights.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="consentDataProcessing" className="text-base font-medium">
                        Basic Data Processing
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent>{consentTooltips.consentDataProcessing}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Switch
                      id="consentDataProcessing"
                      checked={settings.consentDataProcessing}
                      onCheckedChange={() => handleToggle("consentDataProcessing")}
                      disabled={true} // This is required and cannot be disabled
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    This allows Global Pulse to process your interactions for basic functionality. This is required to
                    use the platform.
                  </p>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="consentDetailedAnalysisLogging" className="text-base font-medium">
                        Detailed Analysis Logging
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent>{consentTooltips.consentDetailedAnalysisLogging}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Switch
                      id="consentDetailedAnalysisLogging"
                      checked={settings.consentDetailedAnalysisLogging}
                      onCheckedChange={() => handleToggle("consentDetailedAnalysisLogging")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showMyReflectionsInDashboard" className="text-base font-medium">
                        Show AI Reflections on Dashboard
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent>{consentTooltips.showMyReflectionsInDashboard}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Switch
                      id="showMyReflectionsInDashboard"
                      checked={settings.showMyReflectionsInDashboard}
                      onCheckedChange={() => handleToggle("showMyReflectionsInDashboard")}
                    />
                  </div>
                </CardContent>
              </Card>

              <Separator />

              {/* Platform Improvement & Research */}
              <Card className="border-purple-100">
                <CardHeader>
                  <CardTitle>📈 Platform Improvement & Research</CardTitle>
                  <CardDescription>
                    Help us improve Global Pulse by contributing to anonymized data sets.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="consentAnonymizedPatternTraining" className="text-base font-medium">
                        Anonymized Pattern Training
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent>{consentTooltips.consentAnonymizedPatternTraining}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Switch
                      id="consentAnonymizedPatternTraining"
                      checked={settings.consentAnonymizedPatternTraining}
                      onCheckedChange={() => handleToggle("consentAnonymizedPatternTraining")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="consentAggregation" className="text-base font-medium">
                        Aggregate Insights
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent>{consentTooltips.consentAggregation}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Switch
                      id="consentAggregation"
                      checked={settings.consentAggregation}
                      onCheckedChange={() => handleToggle("consentAggregation")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="consentNarrativeTraining" className="text-base font-medium">
                        Allow Narrative Training Data Use
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent>{consentTooltips.consentNarrativeTraining}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Switch
                      id="consentNarrativeTraining"
                      checked={settings.consentNarrativeTraining}
                      onCheckedChange={() => handleToggle("consentNarrativeTraining")}
                    />
                  </div>

                  <div className="mt-6 border-t pt-4">
                    <h3 className="text-lg font-medium mb-2">External Data Sources</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Control which external data sources Global Pulse can access to enhance your experience.
                    </p>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="google_calendar_consent" className="text-base font-medium">
                          Google Calendar
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                            </TooltipTrigger>
                            <TooltipContent>
                              Allow Global Pulse to access your Google Calendar data to provide insights about your
                              schedule patterns.
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Switch
                        id="google_calendar_consent"
                        checked={
                          settings.dataSourceConsents
                            ? JSON.parse(settings.dataSourceConsents)?.google_calendar === true
                            : false
                        }
                        onCheckedChange={() => {
                          // Parse existing dataSourceConsents or create new object
                          const currentConsents = settings.dataSourceConsents
                            ? JSON.parse(settings.dataSourceConsents)
                            : {}

                          // Toggle the google_calendar consent
                          const newConsents = {
                            ...currentConsents,
                            google_calendar: !currentConsents.google_calendar,
                          }

                          // Update settings
                          setSettings({
                            ...settings,
                            dataSourceConsents: JSON.stringify(newConsents),
                          })

                          // Clear any previous success message
                          setSuccess(false)
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Separator />

              {/* Optional Features & Check-ins */}
              <Card className="border-purple-100">
                <CardHeader>
                  <CardTitle>✨ Optional Features & Check-ins</CardTitle>
                  <CardDescription>
                    Enable optional features and check-ins for a more personalized experience.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allowSomaticPrompts" className="text-base font-medium">
                        Somatic Awareness Prompts
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent>{consentTooltips.allowSomaticPrompts}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Switch
                      id="allowSomaticPrompts"
                      checked={settings.allowSomaticPrompts}
                      onCheckedChange={() => handleToggle("allowSomaticPrompts")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allowDistressConsentCheck" className="text-base font-medium">
                        Distress Check-ins
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent>{consentTooltips.allowDistressConsentCheck}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Switch
                      id="allowDistressConsentCheck"
                      checked={settings.allowDistressConsentCheck}
                      onCheckedChange={() => handleToggle("allowDistressConsentCheck")}
                    />
                  </div>
                </CardContent>
              </Card>

              <Separator />

              {/* Data Value & Potential Monetization */}
              <Card className="border-purple-100">
                <CardHeader>
                  <CardTitle>💰 Data Value & Potential Monetization</CardTitle>
                  <CardDescription>Control options related to potential future data monetization.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="consentSaleOptIn" className="text-base font-medium">
                        Data Sale Opt-In
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Allow your anonymized data to be used for potential future data monetization.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Switch
                      id="consentSaleOptIn"
                      checked={settings.consentSaleOptIn}
                      onCheckedChange={() => handleToggle("consentSaleOptIn")}
                    />
                  </div>
                </CardContent>
              </Card>
            </TooltipProvider>
          </>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleReset} disabled={loading || saving}>
          Reset to Defaults
        </Button>
        <Button onClick={handleSave} disabled={loading || saving} className="bg-purple-600 hover:bg-purple-700">
          {saving ? (
            <>
              <span className="animate-spin mr-2">⟳</span>
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </CardFooter>

      {/* Session-level consent controls */}
      {!loading && settings.userID && (
        <SessionConsentControls
          userId={settings.userID}
          sessionId={sessionId}
          consentAggregation={settings.consentAggregation}
          consentAnonymizedPatternTraining={settings.consentAnonymizedPatternTraining}
        />
      )}
    </Card>
  )
}
