# Validating Uncertainty & Ambiguity

The Validating Uncertainty & Ambiguity feature detects when users express uncertainty or ambiguity in their messages and responds with validating messages rather than pushing for answers they don't have.

## Overview

When users express uncertainty (e.g., "I don't know," "I'm not sure," "It's confusing"), Pulse responds with a specific, pre-authored validating message and temporarily suppresses potentially demanding analytical probes or deep questions in the immediate next turn.

This builds significant user trust and psychological safety by acknowledging and validating moments of uncertainty rather than pushing for answers the user doesn't have.

## Key Features

### 1. Uncertainty Detection Logic

The system identifies common phrases indicating user uncertainty, confusion, or ambiguity using a comprehensive list of keywords and phrases. It performs efficient matching against the normalized utterance text and returns:

- A boolean flag (`isExpressingUncertainty`)
- A confidence score based on the number/strength of matched phrases
- The specific topic the user is uncertain about (when identifiable)

### 2. Response Selection Override Logic

When uncertainty is detected, the system modifies the primary response selection mechanism to prioritize validation. It forces the selection of the pre-authored response template pathway instead of potentially calling the LLM.

### 3. Pre-Authored Uncertainty Validation Response

The system delivers a specific, validating, non-probing response using the `validate_uncertainty` template. The template validates the feeling of uncertainty (e.g., "It's perfectly okay not to be sure about that") and avoids immediately asking a follow-up question that requires a specific answer.

### 4. Suppression of Probing

The system ensures that the next interaction doesn't immediately ask a deep analytical question. It recognizes that the last agent turn was `validate_uncertainty` and prioritizes a gentler follow-up rather than a direct analytical probe related to the uncertain topic.

## Implementation Details

### Uncertainty Detection

The system uses a predefined list of phrases indicating uncertainty, including:

- "don't know"
- "not sure"
- "uncertain"
- "confused"
- "unclear"
- "maybe"
- "perhaps"
- "it depends"
- "hard to say"
- And many more...

It also checks for question patterns that indicate uncertainty, such as:

- "what if"
- "i wonder"
- "could it be"
- "is it possible"

### Topic Extraction

The system attempts to identify the specific term/topic the user is uncertain about using several methods:

1. Pattern matching (e.g., "I'm not sure about X")
2. Entity extraction from NLP analysis
3. Keyword extraction from NLP analysis

If no specific topic can be identified, it uses a generic default like "this" or "that".

### Response Generation

When uncertainty is detected, the system:

1. Calls `getTemplatedResponse('validate_uncertainty', { topic_or_feeling: identified_topic | 'this' })`
2. Records that an uncertainty validation was sent
3. Ensures the next response is gentler and less probing

## Testing

You can test the uncertainty detection feature using the Uncertainty Tester page at `/uncertainty-test`. This page allows you to:

1. Enter text with expressions of uncertainty
2. See if uncertainty is detected
3. View the confidence score
4. See the identified uncertainty topic (if any)
5. Preview the suggested response

## Examples

Here are some examples of uncertainty expressions and how the system responds:

1. User: "I'm not sure what to do next."
   - System detects uncertainty with high confidence
   - System identifies "what to do next" as the uncertainty topic
   - System responds with a validation message

2. User: "Maybe we should try a different approach?"
   - System detects uncertainty with medium confidence
   - System identifies "a different approach" as the uncertainty topic
   - System responds with a validation message

3. User: "I'm confused about the instructions."
   - System detects uncertainty with high confidence
   - System identifies "the instructions" as the uncertainty topic
   - System responds with a validation message
