# Somatic Prompting

## Overview

Somatic prompting is a feature that encourages users to notice their bodily sensations in response to emotional experiences. This feature is designed to help users develop interoceptive awareness, which is the ability to perceive and understand signals from one's body.

## How It Works

1. **Trigger Detection**: The system analyzes the user's message using the EWEF pipeline to determine their emotional state (VAD values).

2. **Threshold Checking**: If the user's emotional state meets certain thresholds (high arousal or negative valence with moderate arousal), a somatic prompt may be triggered.

3. **Consent & Frequency**: The system checks if the user has consented to somatic prompts and ensures prompts aren't triggered too frequently.

4. **Prompt Generation**: If all conditions are met, the system generates a somatic prompt using a template, customized with a feeling name derived from the VAD values.

5. **Response Handling**: When the user responds to a somatic prompt, the system acknowledges their response without analyzing it, preserving privacy.

## Configuration

Somatic prompting behavior is controlled by several configuration parameters in `lib/somatic/somatic-config.ts`:

- `SOMATIC_PROMPT_AROUSAL_THRESHOLD`: Minimum arousal level to trigger a prompt (default: 0.65)
- `SOMATIC_PROMPT_NEG_VALENCE_THRESHOLD`: Negative valence threshold (default: -0.5)
- `SOMATIC_PROMPT_NEG_AROUSAL_THRESHOLD`: Arousal threshold when valence is negative (default: 0.6)
- `SOMATIC_PROMPT_MIN_TURNS_BETWEEN`: Minimum conversation turns between prompts (default: 5)
- `SOMATIC_PROMPT_MIN_CONFIDENCE`: Minimum VAD confidence required (default: 0.6)
- `SOMATIC_PROMPT_PROBABILITY`: Probability factor for triggering (default: 0.8)

## Implementation Details

### Core Functions

- `shouldTriggerSomaticPrompt`: Determines if a somatic prompt should be triggered based on user consent, VAD values, and frequency limits.
- `generateSomaticPrompt`: Generates a somatic prompt if conditions are met, using templates from the response template system.
- `isAwaitingSomaticResponse`: Checks if the system is waiting for a response to a somatic prompt.
- `generateSomaticAcknowledgment`: Generates an acknowledgment for a user's response to a somatic prompt.
- `resetSomaticState`: Resets the somatic state for a user session.

### Session State

The system maintains two session state flags in Redis:

- `lastSomaticPromptTurn`: The conversation turn when the last somatic prompt was triggered.
- `awaitingSomaticResponse`: Flag indicating if the system is waiting for a response to a somatic prompt.

### Integration with PCE Orchestrator

The somatic prompting logic is integrated into the PCE orchestrator (`processPceMvpRequest`):

1. After calculating VAD values, the system checks if it should trigger a somatic prompt.
2. If a prompt is triggered, it's returned as the response instead of proceeding with normal response generation.
3. When processing the next user message, the system checks if it's awaiting a somatic response.
4. If awaiting a response, it generates an acknowledgment without processing the user's message through the EWEF pipeline.

## User Consent

Somatic prompting is consent-gated. Users must explicitly opt in to receive somatic prompts by enabling the "Allow somatic prompts" setting in their consent profile.

## Testing

A testing interface is available at `/somatic-test` to experiment with different parameters and see how the somatic prompting system behaves.

## Example Prompts

Examples of somatic prompts:

- "Taking a moment to pause... if you're comfortable, you might notice where you feel that tension in your body right now. No need to answer - this is just for your awareness."
- "As we discuss this challenge, you might take a breath and notice any physical sensations that arise. Where in your body do you feel your response to this? Just noticing is enough."

Examples of acknowledgments:

- "Thank you for sharing that observation. Noticing our body's responses can provide valuable insights."
- "I appreciate you tuning into your physical experience. That awareness can be quite helpful."
\`\`\`

Now, let's ensure the PCE orchestrator (`processPceMvpRequest`) correctly integrates the somatic prompting logic:
