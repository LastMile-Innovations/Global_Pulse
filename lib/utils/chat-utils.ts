export function formatMessageTime(timestamp: string): string {
  try {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  } catch (error) {
    return "Unknown time"
  }
}

/**
 * Auto-resize a textarea element based on its content
 * @param textarea The textarea element to auto-resize
 */
export function autoResizeTextarea(textarea: HTMLTextAreaElement): void {
  textarea.style.height = "auto"
  textarea.style.height = `${textarea.scrollHeight}px`
}
