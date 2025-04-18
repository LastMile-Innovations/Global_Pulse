import { logger } from "../utils/logger"

/**
 * Interface for emotion category with probability
 */
export interface EmotionCategoryProb {
  label: string
  probability: number
}

/**
 * Deep copy utility for EmotionCategoryProb arrays
 */
function cloneCategories(categories: EmotionCategoryProb[]): EmotionCategoryProb[] {
  return categories.map((cat) => ({ label: cat.label, probability: cat.probability }))
}

/**
 * Normalize probabilities in an array of emotion categories so they sum to 1.0.
 * Mutates the input array for performance, but returns it for chaining.
 *
 * @param categories Array of emotion categories with probabilities
 * @returns The same array with normalized probabilities
 */
export function normalizeProbabilities(categories: EmotionCategoryProb[]): EmotionCategoryProb[] {
  if (!Array.isArray(categories) || categories.length === 0) {
    logger.error("normalizeProbabilities: Input must be a non-empty array of EmotionCategoryProb")
    throw new Error("normalizeProbabilities: Input must be a non-empty array of EmotionCategoryProb")
  }

  // Remove negative probabilities and warn
  let hadNegative = false
  categories.forEach((cat) => {
    if (cat.probability < 0) {
      logger.warn(`Negative probability detected for label "${cat.label}", setting to 0`)
      cat.probability = 0
      hadNegative = true
    }
  })

  // Calculate the sum of all probabilities
  const sum = categories.reduce((acc, category) => acc + category.probability, 0)

  // If sum is 0 or very close to 0, set equal probabilities
  if (sum < 1e-8) {
    const equalProb = 1.0 / categories.length
    categories.forEach((category) => {
      category.probability = equalProb
    })

    logger.warn(
      `Normalizing zero or near-zero probabilities to equal distribution: count=${categories.length}, equalProbability=${equalProb}`
    )

    return categories
  }

  // Normalize each probability by dividing by the sum
  categories.forEach((category) => {
    category.probability = category.probability / sum
  })

  // After normalization, ensure sum is exactly 1.0 (fix floating point drift)
  let normSum = categories.reduce((acc, category) => acc + category.probability, 0)
  if (Math.abs(normSum - 1.0) > 1e-8) {
    // Adjust the largest probability to make the sum exactly 1.0
    let maxIdx = 0
    for (let i = 1; i < categories.length; i++) {
      if (categories[i].probability > categories[maxIdx].probability) maxIdx = i
    }
    categories[maxIdx].probability += 1.0 - normSum
    normSum = categories.reduce((acc, category) => acc + category.probability, 0)
  }

  logger.debug(
    `Normalized probabilities: originalSum=${sum}, normalizedSum=${normSum}, categories=${JSON.stringify(categories)}`
  )

  return categories
}

/**
 * Cap the maximum probability in a distribution and redistribute excess.
 * Mutates the input array for performance, but returns it for chaining.
 *
 * @param categories Array of emotion categories with probabilities
 * @param maxProb Maximum allowed probability for any category (e.g., 0.9)
 * @returns The modified array with capped probabilities
 */
export function capAndRedistributeProbabilities(
  categories: EmotionCategoryProb[],
  maxProb = 0.9,
): EmotionCategoryProb[] {
  if (!Array.isArray(categories) || categories.length === 0) {
    logger.error("capAndRedistributeProbabilities: Input must be a non-empty array of EmotionCategoryProb")
    throw new Error("capAndRedistributeProbabilities: Input must be a non-empty array of EmotionCategoryProb")
  }
  if (maxProb <= 0 || maxProb >= 1) {
    logger.error("capAndRedistributeProbabilities: maxProb must be between 0 and 1 (exclusive)")
    throw new Error("capAndRedistributeProbabilities: maxProb must be between 0 and 1 (exclusive)")
  }

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

    logger.debug(
      `Added Neutral category to redistribute excess probability: totalExcess=${totalExcess}, categories=${JSON.stringify(categories)}`
    )
  } else {
    // Redistribute excess proportionally to categories below cap
    const belowCapSum = belowCapCategories.reduce((acc, cat) => acc + cat.probability, 0)

    belowCapCategories.forEach((cat) => {
      // Weight by current probability if sum is non-zero
      const weight = belowCapSum > 0 ? cat.probability / belowCapSum : 1 / belowCapCategories.length
      cat.probability += totalExcess * weight
    })

    logger.debug(
      `Redistributed excess probability: totalExcess=${totalExcess}, belowCapSum=${belowCapSum}, categories=${JSON.stringify(categories)}`
    )
  }

  // After redistribution, re-normalize to ensure sum is 1.0
  normalizeProbabilities(categories)

  return categories
}
