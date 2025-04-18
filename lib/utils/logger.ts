export const logger = {
  info: (message: string) => {
    console.log(`[INFO] ${message}`)
  },

  warn: (message: string) => {
    console.warn(`[WARN] ${message}`)
  },

  error: (message: string) => {
    console.error(`[ERROR] ${message}`)
  },

  debug: (message: string) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(`[DEBUG] ${message}`)
    }
  },
}
