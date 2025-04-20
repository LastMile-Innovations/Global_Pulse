import { EWEFAnalysisOutput, RuleVariables } from '../types/pce-types'
import { logger } from '../utils/logger'

/**
 * Calculates a V1 confidence score for the overall EWEF analysis output.
 * This score represents the system's epistemic humility about its understanding.
 *
 * V1 Logic: Combines primary appraisal confidence, average MHH variable confidence,
 * and VAD consistency (approximated here by VAD distance from origin, lower is better).
 * Weights are initial estimates and require tuning.
 *
 * @param ewefOutput The output from the EWEF analysis process.
 * @returns A confidence score between 0 and 1.
 */
export function calculateAnalysisConfidenceV1(
  ewefOutput: EWEFAnalysisOutput
): number {
  const { pInstance, ruleVariables, vad } = ewefOutput

  // 1. Get Primary Appraisal Confidence
  const pAppraisalConfidence = pInstance.pAppraisalConfidence

  // 2. Calculate average MHH variable confidence from ruleVariables
  const getConfidences = (rv: RuleVariables): number[] => {
    return [
      rv.source.confidence,
      rv.perspective.confidence,
      rv.timeframe.confidence,
      rv.acceptanceState.confidence,
    ]
  }
  const mhhConfidences = getConfidences(ruleVariables)
  const avgMhhConfidence =
    mhhConfidences.reduce((sum: number, conf: number) => sum + conf, 0) /
    mhhConfidences.length

  // 3. Calculate VAD consistency score (V1 approximation using VAD confidence)
  // Higher confidence in VAD assessment implies higher consistency.
  const vadConsistencyScore = vad.confidence // Use the direct confidence from VADOutput

  // 4. Apply weights (V1 - requires tuning)
  const weightPAppraisal = 0.4
  const weightAvgMhh = 0.3
  const weightVadConsistency = 0.3 // Adjusted weight interpretation

  const confidenceScore =
    weightPAppraisal * pAppraisalConfidence +
    weightAvgMhh * avgMhhConfidence +
    weightVadConsistency * vadConsistencyScore

  // 5. Clamp final score to [0, 1]
  const finalScore = Math.max(0, Math.min(1, confidenceScore))

  // Fix logger call: message first, then object
  logger.debug(
    'Calculated V1 Analysis Confidence', // Message string first
    {
      // Metadata object second
      pAppraisalConfidence,
      avgMhhConfidence,
      vadConsistencyScore,
      rawScore: confidenceScore,
      finalScore,
      sourceConfidences: {
        mhh: mhhConfidences,
        vad: vad.confidence,
        pAppraisal: pAppraisalConfidence,
      },
    }
  )

  return finalScore
} 