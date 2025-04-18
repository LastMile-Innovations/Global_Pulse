import crypto from "crypto"
import { logger } from "./logger"

// Get encryption key from environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
  logger.error("ENCRYPTION_KEY is missing or too short. Must be at least 32 characters.")
}

/**
 * Encrypts sensitive data using AES-256-GCM
 * @param text The text to encrypt
 * @returns The encrypted text as a base64 string with IV and auth tag
 */
export function encrypt(text: string): string {
  try {
    // Generate a random initialization vector
    const iv = crypto.randomBytes(16)

    // Create cipher using AES-256-GCM
    const cipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(ENCRYPTION_KEY as string, "utf-8").slice(0, 32), iv)

    // Encrypt the text
    let encrypted = cipher.update(text, "utf8", "base64")
    encrypted += cipher.final("base64")

    // Get the authentication tag
    const authTag = cipher.getAuthTag()

    // Combine IV, encrypted text, and auth tag into a single string
    // Format: base64(iv):base64(authTag):base64(encryptedText)
    return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted}`
  } catch (error) {
    logger.error("Encryption failed:", error)
    throw new Error("Failed to encrypt data")
  }
}

/**
 * Decrypts data that was encrypted with the encrypt function
 * @param encryptedText The encrypted text (format: base64(iv):base64(authTag):base64(encryptedText))
 * @returns The decrypted text
 */
export function decrypt(encryptedText: string): string {
  try {
    // Split the encrypted text into its components
    const [ivBase64, authTagBase64, encryptedData] = encryptedText.split(":")

    if (!ivBase64 || !authTagBase64 || !encryptedData) {
      throw new Error("Invalid encrypted text format")
    }

    // Convert components from base64
    const iv = Buffer.from(ivBase64, "base64")
    const authTag = Buffer.from(authTagBase64, "base64")

    // Create decipher
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      Buffer.from(ENCRYPTION_KEY as string, "utf-8").slice(0, 32),
      iv,
    )

    // Set auth tag
    decipher.setAuthTag(authTag)

    // Decrypt the data
    let decrypted = decipher.update(encryptedData, "base64", "utf8")
    decrypted += decipher.final("utf8")

    return decrypted
  } catch (error) {
    logger.error("Decryption failed:", error)
    throw new Error("Failed to decrypt data")
  }
}
