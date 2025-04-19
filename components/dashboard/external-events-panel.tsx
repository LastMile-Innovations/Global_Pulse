"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, ExternalLink, Calendar, Globe } from "lucide-react"

interface Entity {
  entityId: string
  name: string
  type: string
  relationshipType: string
}

interface InformationEvent {
  eventId: string
  title: string
  summary: string
  sourceType: string
  sourceUrl: string
  publishedAt: number
  entities: Entity[]
}

export function ExternalEventsPanel() {
  const [events, setEvents] = useState<InformationEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true)
        const response = await fetch("/api/external/events?limit=10")

        if (!response.ok) {
          throw new Error(`Error fetching events: ${response.statusText}`)
        }

        const data = await response.json()
        setEvents(data.events)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load events")
        console.error("Error fetching external events:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  function getEntityTypeColor(type: string): string {
    switch (type.toLowerCase()) {
      case "person":
        return "card-blue border-none text-xs py-0.5 px-1.5"
      case "organization":
        return "card-pink border-none text-xs py-0.5 px-1.5"
      case "location":
        return "card-green border-none text-xs py-0.5 px-1.5"
      case "event":
        return "card-yellow border-none text-xs py-0.5 px-1.5"
      case "product":
        return "card-orange border-none text-xs py-0.5 px-1.5"
      default:
        return "bg-muted text-muted-foreground border-none text-xs py-0.5 px-1.5"
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          External Events Monitor
        </CardTitle>
        <CardDescription>Recent events from external sources that may be relevant to users</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Events</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="rounded-md bg-destructive/10 p-4 text-destructive">{error}</div>
            ) : events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No external events found</div>
            ) : (
              events.map((event) => (
                <div key={event.eventId} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{event.title}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(event.publishedAt)}
                      </Badge>
                      <Badge>{event.sourceType}</Badge>
                    </div>
                  </div>

                  {event.summary && <p className="text-sm text-muted-foreground">{event.summary}</p>}

                  {event.entities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {event.entities.map((entity, index) => (
                        <Badge
                          key={`${entity.entityId}-${index}`}
                          variant="secondary"
                          className={getEntityTypeColor(entity.type)}
                        >
                          {entity.name} ({entity.type})
                        </Badge>
                      ))}
                    </div>
                  )}

                  {event.sourceUrl && (
                    <div className="mt-2">
                      <a
                        href={event.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs flex items-center gap-1 text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View source
                      </a>
                    </div>
                  )}
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="news" className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              events
                .filter((event) => event.sourceType === "news")
                .map((event) => (
                  <div key={event.eventId} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{event.title}</h3>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(event.publishedAt)}
                      </Badge>
                      <Badge>{event.sourceType}</Badge>
                    </div>

                    {event.summary && <p className="text-sm text-muted-foreground">{event.summary}</p>}

                    {event.entities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {event.entities.map((entity, index) => (
                          <Badge
                            key={`${entity.entityId}-${index}`}
                            variant="secondary"
                            className={getEntityTypeColor(entity.type)}
                          >
                            {entity.name} ({entity.type})
                          </Badge>
                        ))}
                      </div>
                    )}

                    {event.sourceUrl && (
                      <div className="mt-2">
                        <a
                          href={event.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs flex items-center gap-1 text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View source
                        </a>
                      </div>
                    )}
                  </div>
                ))
            )}
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              events
                .filter((event) => event.sourceType === "social")
                .map((event) => (
                  <div key={event.eventId} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{event.title}</h3>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(event.publishedAt)}
                      </Badge>
                    </div>

                    {event.summary && <p className="text-sm text-muted-foreground">{event.summary}</p>}

                    {event.entities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {event.entities.map((entity, index) => (
                          <Badge
                            key={`${entity.entityId}-${index}`}
                            variant="secondary"
                            className={getEntityTypeColor(entity.type)}
                          >
                            {entity.name} ({entity.type})
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))
            )}

            {!loading && events.filter((event) => event.sourceType === "social").length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No social media events found</div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
