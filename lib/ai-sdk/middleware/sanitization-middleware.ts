/**
 * Sanitizes sensitive information from text.
 * MVP production: covers credit cards, SSNs, emails, phone numbers, IBANs, and basic PII.
 * Extend as needed for more comprehensive coverage.
 */
function sanitizeText(text: string): string {
  if (typeof text !== "string") return text as any

  return text
    // Credit card numbers (Visa, MC, Amex, Discover, etc.)
    .replace(/\b(?:\d[ -]*?){13,16}\b/g, "[CREDIT_CARD]")
    // SSNs (US)
    .replace(/\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g, "[SSN]")
    // Email addresses
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, "[EMAIL]")
    // US phone numbers (various formats)
    .replace(/(\+1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, "[PHONE]")
    // IBAN (International Bank Account Number, basic pattern)
    .replace(/\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g, "[IBAN]")
    // Simple address patterns (street, avenue, etc.)
    .replace(/\b\d{1,5}\s+([A-Za-z0-9]+\s)+(Street|St|Avenue|Ave|Boulevard|Blvd|Road|Rd|Lane|Ln|Drive|Dr)\b/gi, "[ADDRESS]")
    // Names (very basic, for demo only; real PII detection is more complex)
    .replace(/\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g, "[NAME]")
    // Remove excessive whitespace after replacements
    .replace(/\s{2,}/g, " ")
}

/**
 * Types for sanitization middleware context and hooks
 */
export interface SanitizationBeforeContext {
  prompt?: unknown
  messages?: Array<{ [key: string]: any }>
  options?: unknown
}

export interface SanitizationAfterContext extends SanitizationBeforeContext {
  response?: { [key: string]: any }
}

export interface SanitizationMiddleware {
  before: (ctx: SanitizationBeforeContext) => Promise<SanitizationBeforeContext>
  after: (ctx: SanitizationAfterContext) => Promise<unknown>
}

/**
 * Middleware that sanitizes sensitive information from prompts, messages, and responses.
 * MVP: Covers common PII and secrets. Extend for more.
 */
export function sanitizationMiddleware(): SanitizationMiddleware {
  return {
    before: async ({ prompt, messages, options }: SanitizationBeforeContext) => {
      let sanitizedPrompt: unknown = prompt
      let sanitizedMessages: Array<{ [key: string]: any }> | undefined = messages

      // Sanitize string prompt if present
      if (typeof prompt === "string") {
        sanitizedPrompt = sanitizeText(prompt)
      }

      // Sanitize messages if present and is array
      if (Array.isArray(messages) && messages.length > 0) {
        sanitizedMessages = messages.map((msg: any) => {
          // Sanitize 'content' field if string
          const sanitizedContent =
            typeof msg.content === "string" ? sanitizeText(msg.content) : msg.content

          // Optionally sanitize other fields (e.g., name, role) if needed
          const sanitizedMsg = { ...msg, content: sanitizedContent }
          if (typeof msg.name === "string") {
            sanitizedMsg.name = sanitizeText(msg.name)
          }
          return sanitizedMsg
        })
      }

      return { prompt: sanitizedPrompt, messages: sanitizedMessages, options }
    },

    after: async ({ prompt, messages, options, response }: SanitizationAfterContext) => {
      // Explicit types for context parameters
      const currentPrompt: unknown = prompt;
      const currentMessages: Array<{ [key: string]: any }> | undefined = messages;
      const currentOptions: unknown = options;
      const currentResponse: { [key: string]: any } | undefined = response;

      // Sanitize response text if present
      if (currentResponse && typeof currentResponse.text === "string") {
        return {
          ...currentResponse,
          text: sanitizeText(currentResponse.text),
        }
      }
      // Optionally, sanitize other fields in response (e.g., choices, message, etc.)
      return currentResponse
    },
  }
}
