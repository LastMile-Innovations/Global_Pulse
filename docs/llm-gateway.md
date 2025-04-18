# LLM Gateway

The LLM Gateway provides a standardized interface for interacting with various Large Language Model (LLM) providers through the Vercel AI SDK. It handles secure API key management, provider selection, configuration management, error handling, and timeouts.

## Features

- **Provider Agnostic**: Works with multiple LLM providers (OpenAI, Google, Anthropic) through a unified interface
- **Secure API Key Management**: Loads API keys from environment variables
- **Configurable**: Supports customization of model, temperature, max tokens, and more
- **Error Handling**: Standardized error codes and messages for common failure scenarios
- **Timeout Management**: Configurable timeouts to prevent hanging requests
- **JSON Support**: Specialized function for generating and parsing JSON responses

## Usage

### Basic Text Generation

\`\`\`typescript
import { generateLlmResponseViaSdk } from '@/lib/llm/llm-gateway';

async function generateResponse() {
  const result = await generateLlmResponseViaSdk(
    'Explain the concept of quantum computing in simple terms.',
    {
      modelId: 'openai/gpt-4o',
      temperature: 0.3,
      maxTokens: 150,
      systemPrompt: 'You are a helpful assistant that explains complex topics simply.'
    }
  );

  if (result.success) {
    console.log('Generated text:', result.text);
  } else {
    console.error('Error:', result.error, 'Code:', result.errorCode);
  }
}
\`\`\`

### JSON Generation

\`\`\`typescript
import { generateLlmJsonViaSdk } from '@/lib/llm/llm-gateway';

interface UserProfile {
  name: string;
  age: number;
  interests: string[];
}

async function generateUserProfile() {
  const result = await generateLlmJsonViaSdk<UserProfile>(
    'Generate a profile for a fictional user interested in technology.',
    {
      modelId: 'openai/gpt-4o',
      temperature: 0.5,
      maxTokens: 200
    }
  );

  if (result.success && result.data) {
    const profile = result.data;
    console.log('User name:', profile.name);
    console.log('User age:', profile.age);
    console.log('User interests:', profile.interests.join(', '));
  } else {
    console.error('Error:', result.error, 'Code:', result.errorCode);
  }
}
\`\`\`

## Configuration Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `modelId` | `string` | The model ID in format "provider/model-name" | `'openai/gpt-4o'` |
| `systemPrompt` | `string` | Optional system prompt to set context | `undefined` |
| `temperature` | `number` | Controls randomness (0.0 to 1.0) | `0.3` |
| `maxTokens` | `number` | Maximum number of tokens to generate | `150` |
| `timeoutMs` | `number` | Timeout in milliseconds | `15000` |
| `stopSequences` | `string[]` | Optional stop sequences to end generation | `undefined` |

## Supported Models

### OpenAI
- `openai/gpt-4o`
- `openai/gpt-4o-mini`
- `openai/gpt-3.5-turbo`

### Google
- `google/gemini-1.5-pro`
- `google/gemini-1.5-flash`

### Anthropic
- `anthropic/claude-3-opus`
- `anthropic/claude-3-sonnet`
- `anthropic/claude-3-haiku`

## Error Codes

| Code | Description |
|------|-------------|
| `TIMEOUT` | Request timed out |
| `AUTH` | Authentication failed (e.g., invalid API key) |
| `RATE_LIMIT` | Rate limit exceeded |
| `SERVER_ERROR` | Provider server error |
| `PARSING` | Error parsing response |
| `INVALID_REQUEST` | Invalid request parameters |
| `UNKNOWN` | Unknown error |

## Environment Variables

The following environment variables are required depending on which providers you use:

- `OPENAI_API_KEY`: Required for OpenAI models
- `GOOGLE_API_KEY`: Required for Google models
- `ANTHROPIC_API_KEY`: Required for Anthropic models
