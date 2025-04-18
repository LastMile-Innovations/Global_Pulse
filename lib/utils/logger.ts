export const logger = {
  info: (message: string, details?: any) => {
    if (details !== undefined) {
      console.log(`[INFO] ${message}`, details)
    } else {
      console.log(`[INFO] ${message}`)
    }
  },

  warn: (message: string, details?: any) => {
    if (details !== undefined) {
      console.warn(`[WARN] ${message}`, details)
    } else {
      console.warn(`[WARN] ${message}`)
    }
  },

  error: (message: string, details?: any) => {
    if (details) {
      console.error(`[ERROR] ${message}`, details);
    } else {
      console.error(`[ERROR] ${message}`);
    }
  },

  debug: (message: string, details?: any) => {
    if (process.env.NODE_ENV !== "production") {
      if (details !== undefined) {
        console.debug(`[DEBUG] ${message}`, details)
      } else {
        console.debug(`[DEBUG] ${message}`)
      }
    }
  },
}
