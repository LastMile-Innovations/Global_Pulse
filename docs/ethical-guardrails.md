# Ethical Guardrails

This document describes the implementation of the Ethical Guardrails system in the Global Pulse platform.

## Overview

The Ethical Guardrails system provides a safety net to prevent potentially harmful or manipulative AI-generated responses from reaching users. It implements two primary checks:

1. **Predictive Well-being Check**: Estimates the likely emotional impact (VAD - Valence, Arousal, Dominance) of a candidate response on the user and checks if it falls within safe limits.
2. **Basic Manipulation Check**: Scans the candidate response for explicitly forbidden keywords or patterns that might indicate manipulation.

If either check fails, the original response is blocked and replaced with a generic safe response.

## Architecture

The guardrails system consists of the following components:

- **GuardrailsConfig**: Defines static thresholds and patterns for the checks.
- **GuardrailsService**: Implements the guardrail checks and intervention logic.
- **KgService Integration**: Logs guardrail alerts to the knowledge graph.

## Implementation Details

### Configuration

The guardrails system is configured with static thresholds and patterns:

- `GUARDRAIL_VAD_VALENCE_MIN`: Minimum allowed predicted Valence (e.g., -0.85).
- `GUARDRAIL_VAD_AROUSAL_MAX`: Maximum allowed predicted Arousal (e.g., 0.9).
- `GUARDRAIL_VAD_DOMINANCE_MIN`: Minimum allowed predicted Dominance (e.g., -0.9).
- `GUARDRAIL_MANIPULATION_KEYWORDS`: A set of forbidden keywords or patterns.

### Predictive Well-being Check

The Well-being Check uses the EWEF VAD logic to predict the user's likely emotional response to the candidate text:

1. It creates a minimal `PInstanceData` object representing the perception instance.
2. It calls `calculateLinearVad` to compute the predicted VAD values.
3. It compares the predicted VAD against the configured thresholds.

### Basic Manipulation Check

The Manipulation Check scans the candidate response for forbidden keywords or patterns:

1. It converts the text to lowercase for case-insensitive matching.
2. It checks if any of the keywords in `GUARDRAIL_MANIPULATION_KEYWORDS` are present in the text.
3. If any matches are found, the check fails.

### Guardrail Application Flow

The guardrail application flow is as follows:

1. The candidate response is received from the LLM.
2. The Predictive Well-being Check is applied.
3. If the Well-being Check passes, the Basic Manipulation Check is applied.
4. If either check fails:
   - A guardrail alert is logged to the knowledge graph.
   - A generic safe response is retrieved and used as the final response.
5. If both checks pass, the original candidate response is used as the final response.

### Guardrail Alert Logging

When a guardrail check fails, an alert is logged to the knowledge graph:

- A `GuardrailAlert` node is created with properties such as `alertID`, `timestamp`, `userID`, `interactionID`, `alertType`, `triggeringData`, `actionTaken`, and `status`.
- The `triggeringData` property contains details about what triggered the alert (e.g., which VAD threshold was breached or which pattern was matched).

## Testing

The guardrails system can be tested using the GuardrailsTester component, which allows entering candidate responses and checking if they pass the guardrail checks.

## Future Improvements

Future improvements to the guardrails system could include:

- More sophisticated predictive VAD calculation.
- Dynamic thresholds based on user context and history.
- More advanced pattern matching for manipulation detection.
- Integration with external content moderation services.
- Feedback loop for improving the guardrails based on user feedback.
