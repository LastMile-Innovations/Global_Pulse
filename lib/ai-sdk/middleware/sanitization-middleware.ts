function sanitizeText(text: string): string {
  // Example sanitization rules - would be more comprehensive in production
  return text
    .replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, "[CREDIT_CARD]") // Credit card numbers
    .replace(/\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g, "[SSN]") // SSNs
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, "[EMAIL]") // Email addresses
}

/**
 * Middleware that sanitizes sensitive information from prompts and responses
 */
export function sanitizationMiddleware() {
  return {
    before: async ({ prompt, messages, options }) => {
      // Sanitize string prompt if present
      if (typeof prompt === "string") {
        const sanitizedPrompt = sanitizeText(prompt)
        return { prompt: sanitizedPrompt, messages, options }
      }

      // Sanitize messages if present
      if (messages && messages.length > 0) {
        const sanitizedMessages = messages.map((msg) => ({
          ...msg,
          content: typeof msg.content === "string" ? sanitizeText(msg.content) : msg.content,
        }))
        return { prompt, messages: sanitizedMessages, options }
      }

      return { prompt, messages, options }
    },

    after: async ({ prompt, messages, options, response }) => {
      // Sanitize response text if present
      if (response.text) {
        return {
          ...response,
          text: sanitizeText(response.text),
        }
      }

      return response
    },
  }
}
