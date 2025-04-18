/**
 * Utility functions for AI stream handling and processing
 */

interface ConsumeStreamOptions {
  stream: ReadableStream;
  onChunk?: (chunk: any) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Efficiently consumes a ReadableStream and processes chunks
 * Optimized for AI response streaming
 */
export async function consumeStream({
  stream,
  onChunk,
  onComplete,
  onError
}: ConsumeStreamOptions): Promise<void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        onComplete?.();
        break;
      }
      
      // Process the chunk
      const chunk = decoder.decode(value, { stream: true });
      onChunk?.(chunk);
    }
  } catch (error) {
    onError?.(error as Error);
    console.error("Error consuming stream:", error);
  } finally {
    reader.releaseLock();
  }
}

/**
 * Parses SSE (Server-Sent Events) from a stream
 * Used for AI completion streaming
 */
export function parseSSE(chunk: string): string[] {
  return chunk
    .split('\n\n')
    .filter(Boolean)
    .map(event => {
      const data = event.replace(/^data: /, '').trim();
      if (data === '[DONE]') return '';
      try {
        return JSON.parse(data).choices[0]?.delta?.content || '';
      } catch (e) {
        return '';
      }
    })
    .filter(Boolean);
}
