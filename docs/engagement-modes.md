# Engagement Modes

The Engagement Modes feature allows users to switch between different interaction styles with Pulse. This provides essential control over the intensity and data persistence aspects of their interaction, enhancing psychological safety and user agency.

## Available Modes

### Insight Mode

In Insight Mode, Pulse provides deeper analysis and insights based on the user's messages. This mode enables:

- Full EWEF analysis pipeline
- Detailed responses that may include questions and insights
- Conditional detailed logging (if consent is granted)
- Potential for training data collection (if consent is granted)

### Listening Mode

In Listening Mode, Pulse takes a more passive role, providing minimal acknowledgment responses without deep analysis. This mode:

- Bypasses the full EWEF analysis pipeline
- Provides simple, non-probing acknowledgment responses
- Prevents detailed logging regardless of consent settings
- Never collects data for training

## User Interface

The Engagement Modes feature includes two key UI components:

1. **Mode Toggle**: A switch that allows users to toggle between Insight and Listening modes
2. **Mode Indicator**: A persistent visual indicator showing the current active mode

These components ensure that users always know which mode they're in and can easily switch between modes.

## Technical Implementation

### Mode State Management

The mode state is stored in Redis with the following characteristics:

- Session-bound: The mode is associated with the user's current session
- Default mode: New sessions start in Insight Mode by default
- Persistence: The mode persists for the duration of the session
- Reset on logout: The mode resets to default when the user logs out or starts a new session

### API Endpoints

The following API endpoints are available for mode management:

- `GET /api/session/mode`: Get the current mode for a session
- `PUT /api/session/mode`: Update the mode for a session

### Integration with PCE Service

The PCE service integrates with the mode system in two key ways:

1. **Response Selection**: In Listening Mode, the service bypasses normal processing and uses simple acknowledgment templates
2. **Conditional Logging**: The service only logs detailed EWEF instances if the user is in Insight Mode AND has granted consent

## Usage

To use the Engagement Modes feature:

1. Click the mode toggle in the chat interface to switch between Insight and Listening modes
2. Observe the mode indicator to confirm the current mode
3. Send messages to see how Pulse's responses differ between modes

## Privacy and Consent

The Engagement Modes feature works in conjunction with the consent system to provide users with control over their data:

- In Insight Mode, detailed logging occurs only if the user has granted consent
- In Listening Mode, detailed logging never occurs, regardless of consent settings
- Training data collection only occurs in Insight Mode and only if the user has granted consent

This ensures that users have multiple layers of control over their data and interaction experience.
