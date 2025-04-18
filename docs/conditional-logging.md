# Conditional Core EWEF Instance Logging

The Conditional Core EWEF Instance Logging feature ensures that detailed EWEF analysis results are only persisted to the Unified Identity Graph (UIG) when specific consent and mode conditions are met. This is a critical ethical safeguard for the MVP.

## Overview

While the EWEF pipeline always generates internal VAD, heuristic MHH variables, and minimal State S representations for real-time features, this feature controls when these detailed results are persisted to the UIG. Detailed instance nodes (`:ERInstance`, `:PInstance`, `:UserStateInstance`) are only created and linked in the UIG if two conditions are met simultaneously:

1. The user is actively in "Insight Mode"
2. The user has explicitly granted consent for detailed analysis logging (`consentDetailedAnalysisLogging` flag)

Minimal interaction metadata (`:Interaction` node) is always logged regardless of mode or consent.

## Key Components

### 1. Dual Condition Check Logic

The system checks two conditions before persisting detailed EWEF analysis results:

- **Insight Mode Check**: Determines if the user is in "Insight Mode" for the current session
- **Consent Check**: Verifies if the user has granted consent for detailed analysis logging

Both conditions must be true for detailed logging to occur.

### 2. Conditional UIG Instance Node Creation

If both conditions are met, the system creates and links detailed instance nodes in the UIG:

- `:UserStateInstance`: Contains mood and stress estimates
- `:PInstance`: Contains perception instance data (MHH variables, valuation shift, power level)
- `:ERInstance`: Contains emotional reaction instance data (VAD values)

If either condition is not met, these nodes are not created, and no detailed analysis is persisted.

### 3. Unconditional Minimal Logging

Basic interaction metadata is always logged regardless of mode or consent:

- `:Interaction` node: Contains user input, agent response, timestamp, etc.
- Link to `:User` node: Associates the interaction with the user

### 4. Training Consent Check

If detailed logging is occurring, the system also checks if the user has granted consent for anonymized pattern training (`consentAnonymizedPatternTraining` flag). If this consent is granted, the logged data is marked as eligible for future training pools.

## Implementation Details

### Insight Mode Management

Insight Mode is managed through Redis:

- Key format: `session:{sessionId}:insightMode`
- Value: `"true"` or `"false"`
- Default: `"true"` for MVP
- TTL: 24 hours

### Consent Management

Consent flags are stored in the user's ConsentProfile node in the UIG:

- `consentDetailedAnalysisLogging`: Controls detailed EWEF logging
- `consentAnonymizedPatternTraining`: Controls eligibility for training

### Logging Process

1. Basic interaction is always logged via `kgService.logInteraction()`
2. System checks if user is in Insight Mode via `isInsightModeActive()`
3. System checks if user has granted consent via `checkConsent()`
4. If both conditions are met, detailed EWEF instances are logged via `kgService.createEWEFProcessingInstances()`
5. If training consent is also granted, instances are marked as eligible for training

## Testing

The Conditional Logging Tester page allows you to:

- Toggle Insight Mode on/off
- Update consent settings
- Process messages and see the results
- Verify which data is being logged

## Ethical Considerations

This feature is a critical ethical safeguard that:

- Prevents premature or non-consensual storage of sensitive, inferred psychological data
- Still allows the EWEF pipeline to run for basic attunement features
- Links detailed data persistence to explicit user intent and permission
- Lays a privacy-preserving foundation for future dashboard insights and model learning

By implementing this conditional logging approach, we ensure that users have full control over their data while still benefiting from the real-time features of the EWEF pipeline.
