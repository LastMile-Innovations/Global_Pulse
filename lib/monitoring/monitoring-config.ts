export const monitoringConfig = {
  // Default interval for monitoring cycles (in minutes)
  defaultInterval: 60,

  // Default keywords for relevance filtering
  defaultKeywords: [
    // Global topics
    "climate",
    "pandemic",
    "covid",
    "war",
    "crisis",
    "election",
    "economy",

    // Politics
    "president",
    "government",
    "congress",
    "senate",
    "policy",
    "law",
    "regulation",

    // Economy
    "inflation",
    "recession",
    "stock market",
    "interest rate",
    "federal reserve",
    "unemployment",

    // Technology
    "ai",
    "artificial intelligence",
    "technology",
    "innovation",
    "digital",
    "cyber",
    "data",

    // Social issues
    "healthcare",
    "education",
    "inequality",
    "discrimination",
    "rights",
    "justice",

    // Common values
    "freedom",
    "security",
    "privacy",
    "safety",
    "health",
    "wellbeing",
    "community",
  ],

  // Maximum number of news items to fetch per cycle
  maxNewsItemsPerCycle: 50,

  // Maximum content length for NER processing
  maxContentLengthForNer: 1000,

  // News API configuration
  newsApi: {
    defaultCountry: "us",
    defaultCategory: "general",
    defaultPageSize: 20,
  },
}
