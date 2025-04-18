import { logger } from "../utils/logger"
import type { NewsItem } from "../types/monitoring-types"
import { monitoringConfig } from "./monitoring-config"

/**
 * Client for interacting with the NewsAPI
 */
export class NewsApiClient {
  private apiKey: string
  private baseUrl = "https://newsapi.org/v2"

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * Fetch top headlines from NewsAPI
   */
  async fetchTopHeadlines(
    options: {
      country?: string
      category?: string
      pageSize?: number
      page?: number
    } = {},
  ): Promise<NewsItem[]> {
    try {
      const {
        country = monitoringConfig.newsApi.defaultCountry,
        category = monitoringConfig.newsApi.defaultCategory,
        pageSize = monitoringConfig.newsApi.defaultPageSize,
        page = 1,
      } = options

      const url = new URL(`${this.baseUrl}/top-headlines`)
      url.searchParams.append("country", country)
      url.searchParams.append("category", category)
      url.searchParams.append("pageSize", pageSize.toString())
      url.searchParams.append("page", page.toString())

      const response = await fetch(url.toString(), {
        headers: {
          "X-Api-Key": this.apiKey,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`NewsAPI error (${response.status}): ${errorText}`)
      }

      const data = await response.json()

      if (data.status !== "ok") {
        throw new Error(`NewsAPI returned status: ${data.status}, code: ${data.code}, message: ${data.message}`)
      }

      return data.articles.map((article: any) => ({
        title: article.title,
        description: article.description,
        content: article.content,
        url: article.url,
        publishedAt: article.publishedAt,
        source: article.source?.name || "Unknown",
      }))
    } catch (error) {
      logger.error(`Error fetching from NewsAPI: ${error}`)
      throw error
    }
  }

  /**
   * Search for news articles by keyword
   */
  async searchNews(
    query: string,
    options: {
      language?: string
      sortBy?: "relevancy" | "popularity" | "publishedAt"
      pageSize?: number
      page?: number
      from?: string
      to?: string
    } = {},
  ): Promise<NewsItem[]> {
    try {
      const {
        language = "en",
        sortBy = "publishedAt",
        pageSize = monitoringConfig.newsApi.defaultPageSize,
        page = 1,
        from,
        to,
      } = options

      const url = new URL(`${this.baseUrl}/everything`)
      url.searchParams.append("q", query)
      url.searchParams.append("language", language)
      url.searchParams.append("sortBy", sortBy)
      url.searchParams.append("pageSize", pageSize.toString())
      url.searchParams.append("page", page.toString())

      if (from) url.searchParams.append("from", from)
      if (to) url.searchParams.append("to", to)

      const response = await fetch(url.toString(), {
        headers: {
          "X-Api-Key": this.apiKey,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`NewsAPI error (${response.status}): ${errorText}`)
      }

      const data = await response.json()

      if (data.status !== "ok") {
        throw new Error(`NewsAPI returned status: ${data.status}, code: ${data.code}, message: ${data.message}`)
      }

      return data.articles.map((article: any) => ({
        title: article.title,
        description: article.description,
        content: article.content,
        url: article.url,
        publishedAt: article.publishedAt,
        source: article.source?.name || "Unknown",
      }))
    } catch (error) {
      logger.error(`Error searching NewsAPI: ${error}`)
      throw error
    }
  }
}
