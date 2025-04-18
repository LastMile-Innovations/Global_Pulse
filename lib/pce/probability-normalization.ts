import { logger } from "../utils/logger"

/**
 * Interface for emotion category with probability
 */
export interface EmotionCategoryProb {
  label: string
  probability: number
}

/**
 * Normalize probabilities in an array of emotion categories so they sum to 1.0
 *
 * @param categories Array of emotion categories with probabilities
 * @returns The same array with normalized probabilities
 */
export function normalizeProbabilities(categories: EmotionCategoryProb[]): EmotionCategoryProb[] {
  // Calculate the sum of all probabilities
  const sum = categories.reduce((acc, category) => acc + category.probability, 0)

  // If sum is 0 or very close to 0, set equal probabilities
  if (sum < 0.0001) {
    const equalProb = 1.0 / categories.length
    categories.forEach((category) => {
      category.probability = equalProb
    })

    logger.warn("Normalizing zero or near-zero probabilities to equal distribution", {
      categoriesCount: categories.length,
      equalProbability: equalProb,
    })

    return categories
  }

  // Normalize each probability by dividing by the sum
  categories.forEach((category) => {
    category.probability = category.probability / sum
  })

  logger.debug("Normalized probabilities", {
    originalSum: sum,
    normalizedSum: categories.reduce((acc, category) => acc + category.probability, 0),
    categories,
  })

  return categories
}

/**
 * Cap the maximum probability in a distribution and redistribute excess
 *
 * @param categories Array of emotion categories with probabilities
 * @param maxProb Maximum allowed probability for any category (e.g., 0.9)
 * @returns The modified array with capped probabilities
 */
export function capAndRedistributeProbabilities(
  categories: EmotionCategoryProb[],
  maxProb = 0.9,
): EmotionCategoryProb[] {
  // First check if any probability exceeds the cap
  const exceedingCategories = categories.filter((cat) => cat.probability > maxProb)

  if (exceedingCategories.length === 0) {
    return categories // No capping needed
  }

  // Calculate total excess probability to redistribute
  let totalExcess = 0
  exceedingCategories.forEach((cat) => {
    totalExcess += cat.probability - maxProb
    cat.probability = maxProb // Cap the probability
  })

  // Find categories below the cap to redistribute excess to
  const belowCapCategories = categories.filter((cat) => cat.probability < maxProb)

  if (belowCapCategories.length === 0) {
    // If all categories were at or above cap, add a "Neutral" category
    categories.push({
      label: "Neutral",
      probability: totalExcess,
    })

    logger.debug("Added Neutral category to redistribute excess probability", {
      totalExcess,
      categories,
    })
  } else {
    // Redistribute excess proportionally to categories below cap
    const belowCapSum = belowCapCategories.reduce((acc, cat) => acc + cat.probability, 0)

    belowCapCategories.forEach((cat) => {
      // Weight by current probability if sum is non-zero
      const weight = belowCapSum > 0 ? cat.probability / belowCapSum : 1 / belowCapCategories.length
      cat.probability += totalExcess * weight
    })

    logger.debug("Redistributed excess probability", {
      totalExcess,
      belowCapSum,
      categories,
    })
  }

  return categories
}
