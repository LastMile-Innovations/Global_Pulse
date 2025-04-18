# Self-Map Bootstrapping

The Self-Map Bootstrapping feature provides a simple, optional, one-time conversational flow to elicit core values or goals from users, creating a foundation for personalized interactions in the UIG (Unified Identity Graph).

## Overview

When a new user starts interacting with Pulse in Insight Mode, the system checks if they have any core values or goals in their UIG. If not, it triggers a bootstrapping prompt that asks them to share one or two core values or important goals that guide them in life. The user's response is processed using NLP to extract relevant concepts, which are then stored in the UIG as Value or Goal nodes linked to the user.

This provides essential, minimal personalized context for the EWEF pipeline, enabling more effective attunement and somatic prompting.

## Key Components

### 1. Trigger Logic

The system determines if bootstrapping should be triggered based on the following conditions:
- User is in Insight Mode
- User is within the first 5 turns of conversation
- User doesn't already have bootstrapping marked as complete
- User doesn't already have core attachments in their UIG
- System isn't already awaiting a bootstrap response

### 2. Elicitation Prompt

When triggered, the system generates a prompt using the `bootstrap_self_map_prompt` template:
"To help me understand what matters most to you, could you share one or two core values or important goals that guide you in life? You can also skip this if you prefer."

### 3. User Response Handling

When the user responds to the bootstrapping prompt:
- If they choose to skip, the system marks bootstrapping as complete and sends a neutral acknowledgment
- If they provide a response, the system processes it using NLP to extract potential Value/Goal concepts

### 4. Concept Extraction

The system uses several methods to extract concepts from the user's response:
1. Zero-Shot Classification (ZSC) to identify Values and Goals
2. Pattern matching for explicit mentions of values or goals
3. Entity extraction and keyword analysis as fallbacks

The system extracts up to 3 concepts from the user's response.

### 5. UIG Node/Edge Creation

For each extracted concept:
1. The system finds or creates a canonical Value or Goal node in the UIG
2. The system creates a HOLDS_ATTACHMENT edge linking the user to the node
3. The edge is assigned high default Power Level (8) and Valuation (8) to reflect self-reported importance
4. The edge is assigned moderate Certainty (0.7) to indicate it's user-stated but initial

### 6. Completion

After processing the user's response (or skip request):
1. The system marks bootstrapping as complete
2. The system sends a simple acknowledgment response
3. The bootstrapping prompt will not be triggered again for this user

## Implementation Details

### KgService Functions

The feature adds several new functions to the KgService:
- `isBootstrappingComplete`: Checks if bootstrapping is complete for a user
- `markBootstrappingComplete`: Marks bootstrapping as complete for a user
- `checkUserHasCoreAttachments`: Checks if a user has sufficient core attachments
- `findOrCreateAttachmentNode`: Finds or creates an attachment node (Value or Goal)
- `linkUserAttachment`: Links a user to an attachment node with specified properties

### Redis State

The feature uses Redis to track the bootstrapping state:
- `session:awaiting_bootstrap:{sessionId}`: Indicates that the system is awaiting a bootstrap response

### Templates

The feature adds new templates to the template library:
- `bootstrap_self_map_prompt`: Prompts the user to share core values or goals
- `bootstrap_acknowledgment`: Acknowledges the user's response or skip request

## Benefits

The Self-Map Bootstrapping feature provides several benefits:
- Creates essential personalized context for the EWEF pipeline
- Enables more effective attunement and somatic prompting
- Provides a safe, user-driven way to seed the UIG
- Respects user agency by making the process optional and one-time
- Limits the number of concepts extracted to avoid overwhelming the user

## Testing

The feature includes a comprehensive testing interface that allows you to:
- Simulate conversations with a new user
- See the bootstrapping prompt in action
- Test different user responses (including skipping)
- View the extracted concepts
- Reset the bootstrapping state for testing

## Unit Tests

The feature includes unit tests that verify:
- Trigger logic works correctly
- Prompt generation works correctly
- Response processing works correctly
- Concept extraction works correctly
- UIG node/edge creation works correctly
- Skipping works correctly
\`\`\`

Let's create a test for the KgService functions:
