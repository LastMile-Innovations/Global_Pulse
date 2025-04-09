"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Filter, X } from "lucide-react"

interface Topic {
  id: string
  name: string
}

interface SurveyFiltersProps {
  topics: Topic[]
  selectedTopicId: string | null
  onFilterChange: (filters: { topicId: string | null }) => void
  disabled?: boolean
}

export default function SurveyFilters({
  topics,
  selectedTopicId,
  onFilterChange,
  disabled = false,
}: SurveyFiltersProps) {
  // Handle topic selection
  const handleTopicChange = (value: string) => {
    onFilterChange({ topicId: value === "all" ? null : value })
  }

  // Clear all filters
  const clearFilters = () => {
    onFilterChange({ topicId: null })
  }

  // Check if any filters are active
  const hasActiveFilters = !!selectedTopicId

  return (
    <div className="bg-muted/30 p-4 rounded-lg border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          Filter Questions
        </h2>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} disabled={disabled} className="h-8 text-xs">
            <X className="h-3 w-3 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="topic-filter">Topic</Label>
          <Select value={selectedTopicId || "all"} onValueChange={handleTopicChange} disabled={disabled}>
            <SelectTrigger id="topic-filter">
              <SelectValue placeholder="All Topics" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Topics</SelectItem>
              {topics.map((topic) => (
                <SelectItem key={topic.id} value={topic.id}>
                  {topic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
