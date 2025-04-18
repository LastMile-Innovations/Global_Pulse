import { extractKeywords } from "../keyword-extraction"

describe("extractKeywords", () => {
  test("should extract keywords from text", () => {
    const text = "The quick brown fox jumps over the lazy dog"
    const keywords = extractKeywords(text)

    // Expected keywords: quick, brown, fox, jumps, lazy, dog
    // (after stopword removal and min length filtering)
    expect(keywords).toContain("quick")
    expect(keywords).toContain("brown")
    expect(keywords).toContain("fox")
    expect(keywords).toContain("jumps")
    expect(keywords).toContain("lazy")
    expect(keywords).toContain("dog")

    // Stopwords should be removed
    expect(keywords).not.toContain("the")
    expect(keywords).not.toContain("over")
  })

  test("should handle empty input", () => {
    expect(extractKeywords("")).toEqual([])
    expect(extractKeywords(null as any)).toEqual([])
    expect(extractKeywords(undefined as any)).toEqual([])
  })

  test("should respect minWordLength option", () => {
    const text = "The quick brown fox jumps over the lazy dog"
    const keywords = extractKeywords(text, { minWordLength: 5 })

    // Only words with 5+ characters should be included
    expect(keywords).toContain("quick")
    expect(keywords).toContain("brown")
    expect(keywords).toContain("jumps")

    // Words with fewer than 5 characters should be excluded
    expect(keywords).not.toContain("fox")
    expect(keywords).not.toContain("dog")
  })

  test("should respect maxKeywords option", () => {
    const text = "The quick brown fox jumps over the lazy dog and the quick brown bear runs away"
    const keywords = extractKeywords(text, { maxKeywords: 3 })

    // Should only return the top 3 keywords
    expect(keywords.length).toBeLessThanOrEqual(3)

    // 'quick' and 'brown' should be included as they appear twice
    expect(keywords).toContain("quick")
    expect(keywords).toContain("brown")
  })

  test("should handle custom stopwords", () => {
    const text = "The quick brown fox jumps over the lazy dog"
    const keywords = extractKeywords(text, { customStopwords: ["quick", "fox"] })

    // Custom stopwords should be removed
    expect(keywords).not.toContain("quick")
    expect(keywords).not.toContain("fox")

    // Other keywords should still be included
    expect(keywords).toContain("brown")
    expect(keywords).toContain("jumps")
    expect(keywords).toContain("lazy")
    expect(keywords).toContain("dog")
  })

  test("should handle punctuation correctly", () => {
    const text = "The quick, brown fox! It jumps over the lazy dog."
    const keywords = extractKeywords(text)

    // Punctuation should be removed
    expect(keywords).toContain("quick")
    expect(keywords).toContain("brown")
    expect(keywords).toContain("fox")
    expect(keywords).toContain("jumps")
    expect(keywords).toContain("lazy")
    expect(keywords).toContain("dog")
  })
})
