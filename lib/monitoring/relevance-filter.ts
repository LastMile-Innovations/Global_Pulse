import type { NewsItem } from "../types/monitoring-types"
import { monitoringConfig } from "./monitoring-config"

/**
 * Service for filtering external content based on relevance criteria
 */
export class RelevanceFilter {
  private relevantKeywords: string[]

  constructor(relevantKeywords: string[] = []) {
    this.relevantKeywords = relevantKeywords.map((keyword) => keyword.toLowerCase())

    // Add default keywords if none provided
    if (this.relevantKeywords.length === 0) {
      this.relevantKeywords = monitoringConfig.defaultKeywords.map((keyword) => keyword.toLowerCase())
    }
  }

  /**
   * Check if a news item is relevant based on predefined criteria
   */
  isRelevant(newsItem: NewsItem): boolean {
    // Skip items without title or with very short content
    if (!newsItem.title || newsItem.title.length < 10) {
      return false
    }

    // Combine all text content for keyword matching
    const combinedText = [newsItem.title, newsItem.description, newsItem.content]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()

    // Check if any relevant keyword is present in the combined text
    return this.relevantKeywords.some((keyword) => combinedText.includes(keyword))
  }

  /**
   * Update the list of relevant keywords
   */
  updateKeywords(keywords: string[]): void {
    this.relevantKeywords = keywords.map((keyword) => keyword.toLowerCase())
  }
}
