# Session-Level Consent Controls & Distress Check-in

This feature enhances user agency by providing temporary control over data contributions and adds a crucial safety mechanism for users experiencing distress.

## Overview

The Session-Level Consent Controls & Distress Check-in feature implements two key session-level consent control mechanisms:

1. **Session-Level Consent Controls**: User-facing toggles in Settings to temporarily pause contributions to anonymized pools (Aggregate Insights and Model Training) for the current session only.

2. **Distress-Based Check-in Prompt**: An optional feature that, when high distress is detected via VAD, asks if the user wants to temporarily pause contributions, updating the session flags based on their response.

## Key Components

### Session-Level Consent Controls

- **UI Toggles**: Located in the Settings page, clearly labeled as "For this session only".
- **Session State Flags**: Stored in Redis, scoped to the session, default to false, and reset on new sessions.
- **Update API**: Secure endpoint to update Redis session flags based on UI toggle actions.

### Distress-Based Check-in

- **Opt-in Check**: Only activates if the user has opted in via the `allowDistressConsentCheck` consent setting.
- **Trigger Logic**: Checks for sustained high distress (configurable VAD thresholds over N turns) and verifies that detailed data logging is currently active.
- **Prompt Generation**: Uses the `distress_consent_checkin` template to present clear choices.
- **Response Handling**: Updates the appropriate Redis session pause flags based on the user's choice.

## Implementation Details

### Session State Management

Session state is stored in Redis with the following keys:

- `session:{sessionId}:pauseAggregation`: Whether aggregation contributions are paused for the session.
- `session:{sessionId}:pauseTraining`: Whether training contributions are paused for the session.
- `session:{sessionId}:distressCheckPerformed`: Whether a distress check-in has been performed for the session.
- `session:{sessionId}:awaitingDistressCheckResponse`: Whether awaiting a response to a distress check-in.

### Conditional Logging Logic

The conditional logging logic has been modified to respect session pause flags:

- Before flagging data for training: Checks `mainTrainingConsent && !sessionPauseTraining`.
- Before flagging data for aggregation: Checks `mainAggregationConsent && !sessionPauseAggregation`.

### Distress Detection

Distress is detected based on the following criteria:

- Valence below a negative threshold (e.g., -0.5)
- Arousal above a high threshold (e.g., 0.7)
- Sustained over multiple consecutive turns (e.g., 2-3 turns)
- VAD confidence above a minimum threshold (e.g., 0.6)

### API Endpoints

- `GET /api/session/settings`: Get current session settings.
- `PUT /api/session/settings/pause_contributions`: Update session pause flags.
- `POST /api/feedback/session_pause_update`: Handle distress check-in responses.

## User Experience

### Session-Level Controls in Settings

Users can access session-level controls in the Settings page under the "Temporary Session Controls" section. These controls:

- Are clearly labeled as temporary and session-specific
- Only active if the corresponding main consent is enabled
- Provide immediate feedback when toggled
- Reset when the session expires or the user logs out

### Distress Check-in Flow

1. User experiences high distress (detected via VAD)
2. If opted in and detailed logging is active, Pulse asks if they want to pause contributions
3. User selects from options (Pause Both, Pause Insights Only, Pause Training Only, Continue Both)
4. Pulse acknowledges the choice and updates session flags accordingly
5. The check-in is performed at most once per session

## Testing

The feature includes comprehensive testing:

- Unit tests for conditional logging logic
- Unit tests for distress detection
- Integration tests for session state management
- End-to-end tests for the UI components

A dedicated test page at `/distress-test` allows manual testing of the distress check-in flow.

## Ethical Considerations

This feature addresses the "Living Consent" principle by:

- Giving users immediate, temporary control over non-essential data uses
- Enhancing agency during moments of vulnerability
- Providing a crucial safety mechanism during distress
- Respecting user preferences while maintaining conversation flow

## Future Enhancements

Potential future enhancements include:

- More granular session-level controls
- Adaptive distress detection thresholds
- Additional check-in triggers based on other factors
- Visual indicators of current session pause status in the chat interface
