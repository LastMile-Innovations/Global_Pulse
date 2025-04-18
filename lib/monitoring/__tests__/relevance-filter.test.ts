import { RelevanceFilter } from "../relevance-filter"
import type { NewsItem } from "../../types/monitoring-types"

describe("RelevanceFilter", () => {
  let filter: RelevanceFilter

  beforeEach(() => {
    // Create a filter with specific keywords for testing
    filter = new RelevanceFilter(["climate", "economy", "technology"])
  })

  describe("isRelevant", () => {
    it("should return true for news items containing relevant keywords", () => {
      const newsItem: NewsItem = {
        title: "Climate Change Impact on Global Economy",
        description: "New study shows the impact of climate change on the global economy",
        content: "Scientists have found that climate change could significantly impact the global economy...",
        publishedAt: "2023-01-01T12:00:00Z",
      }

      expect(filter.isRelevant(newsItem)).toBe(true)
    })

    it("should return false for news items not containing relevant keywords", () => {
      const newsItem: NewsItem = {
        title: "Sports News: Team Wins Championship",
        description: "Local team wins the championship after a close match",
        content: "The team celebrated their victory after winning the championship...",
        publishedAt: "2023-01-01T12:00:00Z",
      }

      expect(filter.isRelevant(newsItem)).toBe(false)
    })

    it("should return false for news items with very short or missing title", () => {
      const newsItem1: NewsItem = {
        title: "",
        description: "This contains the keyword economy",
        content: "This is about the economy",
        publishedAt: "2023-01-01T12:00:00Z",
      }

      const newsItem2: NewsItem = {
        title: "Hi",
        description: "This contains the keyword economy",
        content: "This is about the economy",
        publishedAt: "2023-01-01T12:00:00Z",
      }

      expect(filter.isRelevant(newsItem1)).toBe(false)
      expect(filter.isRelevant(newsItem2)).toBe(false)
    })

    it("should use default keywords if none are provided", () => {
      // Create filter with no keywords
      const defaultFilter = new RelevanceFilter([])

      const newsItem: NewsItem = {
        title: "Inflation Rises to 5% in Q2",
        description: "Central bank concerned about rising inflation",
        content: "The inflation rate has increased to 5% in the second quarter...",
        publishedAt: "2023-01-01T12:00:00Z",
      }

      // Should match default keywords like "inflation" or "economy"
      expect(defaultFilter.isRelevant(newsItem)).toBe(true)
    })
  })

  describe("updateKeywords", () => {
    it("should update the list of relevant keywords", () => {
      // Initially, this news item is not relevant
      const newsItem: NewsItem = {
        title: "Sports News: Team Wins Championship",
        description: "Local team wins the championship after a close match",
        content: "The team celebrated their victory after winning the championship...",
        publishedAt: "2023-01-01T12:00:00Z",
      }

      expect(filter.isRelevant(newsItem)).toBe(false)

      // Update keywords to include "sports"
      filter.updateKeywords(["climate", "economy", "technology", "sports"])

      // Now the news item should be relevant
      expect(filter.isRelevant(newsItem)).toBe(true)
    })
  })
})
