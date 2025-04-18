# Attuned Interaction Style

The Attuned Interaction Style feature makes Pulse interactions feel more responsive and attuned to the user's emotional state. It introduces variable response pacing, selects appropriate response sources, and collects feedback on interaction quality.

## Overview

This feature implements foundational mechanisms to make Pulse interactions feel more attuned and responsive to the user's inferred state (VAD/S). It involves subtle variations in response pacing (delay), selecting between safe pre-authored templates and LLM generation based on context, providing basic state hints to the LLM, and adding a simple, occasional user feedback prompt ("Felt Coherence Check-in").

## Key Features

### 1. State-Based Response Delay

- Introduces a variable delay before sending Pulse's response to simulate thinking time and match user pace
- Calculates delay duration (500ms - 2500ms) based on rules:
  - Longer delay if user stress estimate is high (giving user space)
  - Slightly longer delay if Pulse's response is complex or insight-oriented (simulating thought)
  - Shorter delay for simple acknowledgments or questions

### 2. State Hints for LLM Prompt Context

- Provides the LLM with a basic, categorized hint about the user's inferred state to influence tone generation
- Determines a simple state category based on VAD/S thresholds:
  - calm_positive, calm_neutral, calm_negative
  - activated_positive, activated_neutral, activated_negative
  - high_distress

### 3. Response Source Selection Logic

- Decides whether to use a safe, pre-authored template or request a generative response from the LLM
- Selection logic:
  - If user expressed uncertainty -> Use pre-authored validate_uncertainty
  - If user state is high distress -> Use pre-authored validate_high_distress
  - If user is in Listening Mode -> Use pre-authored listening_ack
  - Default -> Use LLM Gateway to generate response

### 4. Tone-Specific LLM Prompts

- Selects a different system prompt/persona instruction for the LLM based on the user state hint
- For high distress -> System prompt emphasizing extra caution, safety, supportiveness, and brevity
- For other states -> System prompts tailored to the specific emotional state

### 5. "Felt Coherence Check-in" Prompt & Logging

- Occasionally asks the user for feedback on how well Pulse's recent responses felt attuned
- Triggered probabilistically (e.g., 1 in 10 turns) or after a specific number of turns
- Logs feedback to a dedicated CoherenceFeedback table in the PostgreSQL database

## User State Hints

The system categorizes the user's emotional state into one of these hints:

- **high_distress**: Negative valence + high arousal
- **activated_negative**: Moderate negative valence + high arousal
- **activated_neutral**: Neutral valence + high arousal
- **activated_positive**: Positive valence + high arousal
- **calm_negative**: Negative valence + low arousal
- **calm_neutral**: Neutral valence + low arousal
- **calm_positive**: Positive valence + low arousal

## Response Sources

The system can select from two response sources:

- **template**: Pre-authored templates for specific intents (uncertainty, high distress, listening mode)
- **llm**: Generated responses from the LLM Gateway

## Coherence Feedback

The system occasionally asks for feedback on how well Pulse's responses are attuned to the user's needs. The feedback options are:

- **matched_well**: The response captured the user's meaning well
- **a_bit_off**: The response was somewhat misaligned with the user's meaning
- **missed_mark**: The response significantly missed the user's meaning

This feedback is logged to the database for future analysis and improvement.

## Integration with Other Features

The Attuned Interaction Style feature integrates with several other features:

- **VAD/S Output**: Uses emotional state detection to determine response style
- **LLM Gateway**: Provides state hints to the LLM for more appropriate responses
- **Templating**: Uses pre-authored templates for specific situations
- **Somatic Prompting**: Coordinates with somatic prompts to avoid conflicts
- **Listening Mode**: Provides simple acknowledgments when in listening mode

## Configuration

The feature is configured with several parameters:

- Response delay thresholds and durations
- VAD thresholds for state hint determination
- Coherence check-in probability and frequency limits

These parameters can be adjusted in the `attunement-config.ts` file.

## Usage

The attuned interaction features are automatically applied to all Pulse interactions. There is no need for explicit activation or configuration by the user.

To test the feature, you can use the Attunement Tester page, which allows you to simulate conversations with different emotional states and see how the system responds.
